import { useState, useEffect, useRef } from 'react';
import { collection, query, orderBy, onSnapshot, limit, where } from 'firebase/firestore';
import { db } from '../services/firebase';
import { getCachedPosts, cachePosts, hasCachedPosts } from '../services/feedCache';

/**
 * usePosts — Intelligent Personalized Feed with IndexedDB cache
 *
 * Cold-start strategy:
 *   1. Immediately serve cached posts from IndexedDB (< 5ms, no network)
 *   2. Firestore listener starts in parallel
 *   3. When Firestore data arrives → replace cached data + write new cache
 *
 * This makes the feed feel instant on every open, even on slow connections.
 */
export function usePosts(limitCount = 15, filterCategory = null, currentUser = null, circleId = null, searchTerm = '') {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(null);
    const cacheLoadedRef = useRef(false);
    const prevLimitCountRef = useRef(limitCount);
    
    // Maintain a stable set of IDs for the current session to prevent jumping
    const sessionOrderRef = useRef([]); 

    // ── Step 1: Load from IndexedDB cache IMMEDIATELY ──────────────────────
    useEffect(() => {
        let cancelled = false;
        const loadCache = async () => {
            if (searchTerm.trim() || circleId || (filterCategory && filterCategory !== 'all')) return;
            const hasCache = await hasCachedPosts();
            if (!hasCache || cancelled) return;
            const cached = await getCachedPosts();
            if (cancelled || cached.length === 0) return;
            
            const visible = cached.filter(p => !p.circleId);
            if (visible.length > 0) {
                setPosts(current => {
                    if (current.length > 0) return current;
                    return visible.slice(0, limitCount);
                });
                setLoading(false);
                cacheLoadedRef.current = true;
            }
        };
        loadCache();
        return () => { cancelled = true; };
    }, [filterCategory, circleId, searchTerm]); 

    // ── Step 2: Firestore real-time listener ──────────────────────────────
    useEffect(() => {
        const isPagination = limitCount > prevLimitCountRef.current;
        const isFilterSearchChange = posts.length === 0 || (prevLimitCountRef.current === limitCount && (searchTerm.trim() || filterCategory));
        
        if (isFilterSearchChange) {
            setPosts([]); 
            setLoading(true);
        } else if (isPagination) {
            setLoadingMore(true);
        }

        let q;
        if (searchTerm.trim()) {
            q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(100));
        } else if (circleId) {
            q = query(collection(db, 'posts'), where('circleId', '==', circleId), orderBy('createdAt', 'desc'), limit(limitCount));
        } else if (filterCategory && filterCategory !== 'all') {
            q = query(collection(db, 'posts'), where('categoryId', '==', filterCategory), orderBy('createdAt', 'desc'), limit(limitCount));
        } else {
            // Fetch more posts than needed to allow for randomization/preference sorting
            q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(Math.max(limitCount, 100)));
        }

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const freshPosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            let filtered = [...freshPosts];
            if (searchTerm.trim()) {
                const term = searchTerm.toLowerCase();
                filtered = filtered.filter(p =>
                    p.content?.toLowerCase().includes(term) ||
                    p.authorName?.toLowerCase().includes(term) ||
                    p.categoryName?.toLowerCase().includes(term)
                );
            }
            filtered = filtered.filter(p => circleId ? true : !p.circleId);

            setPosts(current => {
                const getTS = (p) => {
                    if (!p) return 0;
                    const ts = p.createdAt;
                    if (!ts) return 0;
                    if (ts?.seconds) return ts.seconds;
                    if (ts instanceof Date) return ts.getTime() / 1000;
                    try { return new Date(ts).getTime() / 1000; } catch(e) { return 0; }
                };

                // Helper to shuffle an array
                const shuffle = (arr) => {
                    const res = [...arr];
                    for (let i = res.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [res[i], res[j]] = [res[j], res[i]];
                    }
                    return res;
                };

                // Helper to sort by preference and then shuffle
                const applySmartOrder = (items) => {
                    const userInterests = currentUser?.interests || [];
                    const userFocus = currentUser?.feedFocus;
                    
                    const favored = items.filter(p => 
                        userInterests.includes(p.categoryId) || 
                        userInterests.includes(p.categoryName) ||
                        (userFocus && (p.categoryId === userFocus || p.categoryName === userFocus))
                    );
                    const others = items.filter(p => !favored.includes(p));

                    // Randomize within groups to satisfy "random" requirement
                    return [...shuffle(favored), ...shuffle(others)];
                };

                if (current.length === 0) {
                    return applySmartOrder(filtered).slice(0, limitCount);
                }

                const currentIds = new Set(current.map(p => p.id));
                const novel = filtered.filter(f => !currentIds.has(f.id));
                
                // For new posts coming in, we also want them to be mixed in somewhat randomly
                // but keep them at the top if they are fresh. 
                // However, the user asked for random/preference, so we'll just smart-sort the novel ones too.
                const sortedNovel = applySmartOrder(novel);

                const updatedCurrent = current.map(c => {
                    const fresh = filtered.find(f => f.id === c.id);
                    return fresh ? { ...c, ...fresh } : c;
                });

                if (isPagination) {
                    // When loading more, we take the novel ones (which are "older" because we fetch by desc date)
                    // and shuffle them into the bottom.
                    return [...updatedCurrent, ...sortedNovel].slice(0, limitCount);
                }

                // If new posts arrive from listener, prepend them
                if (novel.length > 0) {
                    return [...sortedNovel, ...updatedCurrent].slice(0, limitCount);
                }

                return updatedCurrent.slice(0, limitCount);
            });

            setLoading(false);
            setLoadingMore(false);
            prevLimitCountRef.current = limitCount; // Update stability marker AFTER processing

            if (!searchTerm.trim() && !circleId && (!filterCategory || filterCategory === 'all')) {
                cachePosts(freshPosts).catch(() => { });
            }
        }, (err) => {
            console.error('❌ [Feed] Firestore Error:', err);
            setError(err);
            setLoading(false);
            setLoadingMore(false);
        });

        return () => unsubscribe();
    }, [limitCount, filterCategory, circleId, searchTerm]);

    return { posts, loading, loadingMore, error };
}
