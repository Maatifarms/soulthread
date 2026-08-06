import { useState, useEffect, useRef, useCallback } from 'react';
import { collection, query, orderBy, onSnapshot, limit, where } from 'firebase/firestore';
import { db } from '../services/firebase';

export function usePosts(limitCount = 15, communityId = null, moodId = null, currentUser = null, searchTerm = '') {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(null);
    const prevLimitCountRef = useRef(limitCount);
    const unsubscribeRef = useRef(null);

    const [refreshKey, setRefreshKey] = useState(0);
    const refetch = useCallback(() => {
        setRefreshKey(k => k + 1);
    }, []);

    const buildQuery = useCallback(() => {
        let constraints = [orderBy('createdAt', 'desc'), limit(limitCount)];
        
        if (communityId && communityId !== 'all') {
            constraints = [where('communityId', '==', communityId), ...constraints];
        } else {
            // Only show public or published posts globally
            // constraints = [where('status', '==', 'published'), ...constraints];
        }

        return query(collection(db, 'posts'), ...constraints);
    }, [limitCount, communityId, refreshKey]);

    useEffect(() => {
        const isPagination = limitCount > prevLimitCountRef.current;
        if (!isPagination) {
            setPosts([]);
            setLoading(true);
        } else {
            setLoadingMore(true);
        }

        if (unsubscribeRef.current) {
            unsubscribeRef.current();
            unsubscribeRef.current = null;
        }

        const q = buildQuery();

        const unsubscribe = onSnapshot(q, (snapshot) => {
            let freshPosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Local filters for things that don't need complex composite indexes yet
            if (searchTerm.trim()) {
                const term = searchTerm.toLowerCase();
                freshPosts = freshPosts.filter(p => p.content?.toLowerCase().includes(term));
            }
            if (moodId) {
                freshPosts = freshPosts.filter(p => p.moodId === moodId);
            }
            
            // Only show non-deleted posts
            freshPosts = freshPosts.filter(p => p.status !== 'deleted');

            setPosts(freshPosts);
            setLoading(false);
            setLoadingMore(false);
            prevLimitCountRef.current = limitCount;
        }, (err) => {
            console.error('❌ [Feed] Firestore Error:', err);
            setError(err);
            setLoading(false);
            setLoadingMore(false);
        });

        unsubscribeRef.current = unsubscribe;

        return () => {
            if (unsubscribeRef.current) unsubscribeRef.current();
        };
    }, [buildQuery, limitCount, searchTerm, moodId]);

    return { posts, loading, loadingMore, error, refetch };
}
