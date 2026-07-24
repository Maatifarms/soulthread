import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
    // Track whether initial smart sort has been applied — prevents re-shuffle on every reaction update
    const initialSortDoneRef = useRef(false);
    // BUG 5 FIX: refreshKey forces the Firestore listener to re-subscribe on demand
    const [refreshKey, setRefreshKey] = useState(0);
    const refetch = useCallback(() => {
        initialSortDoneRef.current = false;
        setRefreshKey(k => k + 1);
    }, []);

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
            return query(
                collection(db, 'posts'),
                where('category', '==', filterCategory),
                orderBy('createdAt', 'desc'),
                limit(limitCount)
            );
        }
        // Global feed
        return query(
            collection(db, 'posts'),
            where('isPublic', '==', true),
            orderBy('createdAt', 'desc'),
            limit(Math.max(limitCount, 30))
        );
    // refreshKey intentionally included to force re-subscribe on manual pull-to-refresh
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [limitCount, filterCategory, circleId, searchTerm, refreshKey]);

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

            // Exclude seeded/admin content from every organic feed view — not just
            // the unfiltered "All" feed. Previously bot content only got filtered
            // out on the exact "All" view; any category-filtered view (which is
            // what most users land on by default via their feedFocus preference)
            // showed seeded content completely unfiltered, letting it dominate.
            if (!circleId && !searchTerm.trim()) {
                filtered = filtered.filter(p => !p.isSeeded && !p.isAdmin);
            }

            setPosts(current => {
                const getTS = (p) => {
                    const ts = p.createdAt;
                    if (!ts) return 0;
                    if (ts?.toDate) return ts.toDate().getTime();
                    if (ts?.seconds) return ts.seconds * 1000;
                    return new Date(ts).getTime();
                };

                // Always sort by newest first — no exceptions
                const applySmartOrder = (items) =>
                    [...items].sort((a, b) => getTS(b) - getTS(a));

                const existingIds = new Set(current.map(p => p.id));
                const incoming = filtered;
                // Update existing posts in-place (reactions etc), add new ones
                const updated = current.map(p => {
                    const fresh = incoming.find(i => i.id === p.id);
                    return fresh || p;
                });
                const novel = incoming.filter(i => !existingIds.has(i.id));
                const merged = [...updated, ...novel];
                return applySmartOrder(merged).slice(0, limitCount);
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

    return { posts, loading, loadingMore, error, refetch };
}
