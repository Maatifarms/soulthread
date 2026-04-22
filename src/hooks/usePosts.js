import { useState, useEffect, useRef, useCallback } from 'react';
import { collection, query, orderBy, onSnapshot, limit, where } from 'firebase/firestore';
import { db } from '../services/firebase';
import { getCachedPosts, cachePosts, hasCachedPosts } from '../services/feedCache';
import { CATEGORIES } from '../data/categories';

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
    const unsubscribeRef = useRef(null);

    // ── Step 1: Load from IndexedDB cache IMMEDIATELY ──────────────────────
    useEffect(() => {
        let cancelled = false;
        const loadCache = async () => {
            // Cache only applies to the global un-filtered feed
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
    // Wrap in useCallback to make the dependency array stable
    const buildQuery = useCallback(() => {
        if (searchTerm.trim()) {
            return query(
                collection(db, 'posts'),
                orderBy('createdAt', 'desc'),
                limit(100)
            );
        }
        if (circleId) {
            return query(
                collection(db, 'posts'),
                where('circleId', '==', circleId),
                orderBy('createdAt', 'desc'),
                limit(limitCount)
            );
        }
        if (filterCategory && filterCategory !== 'all') {
            // Dynamically derive aliases from categories data
            const catInfo = CATEGORIES.find(c => c.id === filterCategory);
            const queryCategories = [filterCategory, ...(catInfo?.legacyAliases || [])];

            if (queryCategories.length > 1) {
                return query(
                    collection(db, 'posts'),
                    where('categoryId', 'in', queryCategories),
                    orderBy('createdAt', 'desc'),
                    limit(limitCount)
                );
            }
            return query(
                collection(db, 'posts'),
                where('categoryId', '==', filterCategory),
                orderBy('createdAt', 'desc'),
                limit(limitCount)
            );
        }
        // Global feed — reduce from 100 to 25 for massive speed boost
        return query(
            collection(db, 'posts'),
            orderBy('createdAt', 'desc'),
            limit(Math.max(limitCount, 25))
        );
    }, [limitCount, filterCategory, circleId, searchTerm]);

    useEffect(() => {
        const isPagination = limitCount > prevLimitCountRef.current;
        const isFilterOrSearchChange =
            posts.length === 0 ||
            (prevLimitCountRef.current === limitCount && (searchTerm.trim() || filterCategory));

        if (isFilterOrSearchChange && !isPagination) {
            setPosts([]);
            setLoading(true);
        } else if (isPagination) {
            setLoadingMore(true);
        }

        // Tear down previous listener before creating a new one
        if (unsubscribeRef.current) {
            unsubscribeRef.current();
            unsubscribeRef.current = null;
        }

        const q = buildQuery();

        const unsubscribe = onSnapshot(q, { includeMetadataChanges: false }, (snapshot) => {
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
                    try { return new Date(ts).getTime() / 1000; } catch (e) { return 0; }
                };

                // Shuffle helper — used for preference-aware randomization
                const shuffle = (arr) => {
                    const res = [...arr];
                    for (let i = res.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [res[i], res[j]] = [res[j], res[i]];
                    }
                    return res;
                };

                const applySmartOrder = (items) => {
                    const userInterests = (currentUser?.interests || []).map(i => i.toLowerCase());
                    const userFocus = currentUser?.feedFocus?.toLowerCase();

                    const favored = items.filter(p => {
                        const catId = p.categoryId?.toLowerCase();
                        const catName = p.categoryName?.toLowerCase();
                        return (
                            userInterests.includes(catId) ||
                            userInterests.includes(catName) ||
                            (userFocus && userFocus !== 'all' && (catId === userFocus || catName === userFocus))
                        );
                    });
                    const others = items.filter(p => !favored.includes(p));
                    return [...shuffle(favored), ...shuffle(others)];
                };

                if (current.length === 0) {
                    return applySmartOrder(filtered).slice(0, limitCount);
                }

                const currentIds = new Set(current.map(p => p.id));
                const novel = filtered.filter(f => !currentIds.has(f.id));
                const sortedNovel = applySmartOrder(novel);

                const updatedCurrent = current.map(c => {
                    const fresh = filtered.find(f => f.id === c.id);
                    return fresh ? { ...c, ...fresh } : c;
                });

                if (isPagination) {
                    return [...updatedCurrent, ...sortedNovel].slice(0, limitCount);
                }

                if (novel.length > 0) {
                    return [...sortedNovel, ...updatedCurrent].slice(0, limitCount);
                }

                return updatedCurrent.slice(0, limitCount);
            });

            setLoading(false);
            setLoadingMore(false);
            prevLimitCountRef.current = limitCount;

            // Only cache the global feed to keep IndexedDB lean
            if (!searchTerm.trim() && !circleId && (!filterCategory || filterCategory === 'all')) {
                cachePosts(freshPosts).catch(() => { });
            }
        }, (err) => {
            console.error('❌ [Feed] Firestore Error:', err);
            setError(err);
            setLoading(false);
            setLoadingMore(false);
        });

        unsubscribeRef.current = unsubscribe;

        return () => {
            if (unsubscribeRef.current) {
                unsubscribeRef.current();
                unsubscribeRef.current = null;
            }
        };
    }, [buildQuery, limitCount]);

    return { posts, loading, loadingMore, error };
}
