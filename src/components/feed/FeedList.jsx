import React from 'react';
import FeedItem from './FeedItem';
import SpotlightCard from './SpotlightCard';
import { usePosts } from '../../hooks/usePosts';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, limit, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Capacitor } from '@capacitor/core';
import './FeedList.css';

const isNativeApp = Capacitor.isNativePlatform();

// Skeleton card shown while posts load — makes app feel instant
const FeedSkeleton = () => (
    <div className="feed-container">
        {[1, 2, 3, 4].map(i => (
            <div key={i} className="feed-skeleton-card">
                <div className="skeleton-header">
                    <div className="skeleton-avatar" />
                    <div>
                        <div className="skeleton-title" />
                        <div className="skeleton-meta" />
                    </div>
                </div>
                <div className="skeleton-line full" />
                <div className="skeleton-line three-quarters" />
                <div className="skeleton-line half" />
            </div>
        ))}
    </div>
);

const FeedList = ({ circleId = null, searchTerm = '', filterCategory = null }) => {
    const { currentUser } = useAuth();
    // 8 posts on first load = faster initial render; user can load more
    const [postLimit, setPostLimit] = React.useState(8);
    // Use either the explicit prop (from Home/Explore) OR the user's preference
    const activeCategory = filterCategory || (currentUser?.feedFocus !== 'all' ? currentUser?.feedFocus : null);
    const { posts, loading, loadingMore, error } = usePosts(postLimit, activeCategory, currentUser, circleId, searchTerm);
    const [spotlightPost, setSpotlightPost] = React.useState(null);

    // Fetch spotlight post
    React.useEffect(() => {
        const fetchSpotlight = async () => {
            try {
                const q = query(collection(db, 'posts'), where('isSpotlight', '==', true), limit(1));
                const snapshot = await getDocs(q);
                if (!snapshot.empty) {
                    setSpotlightPost({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
                }
            } catch (err) {
                console.warn('Failed to fetch spotlight:', err);
            }
        };
        fetchSpotlight();
    }, []);

    // Reset limit if search term or category changes
    React.useEffect(() => {
        setPostLimit(8);
    }, [searchTerm, filterCategory]);

    // Infinite scroll observer
    const observer = React.useRef();
    const loaderRef = React.useCallback(node => {
        // Prevent continuous calls if already loading
        if (loading || loadingMore) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {
                setPostLimit(prev => prev + 10);
            }
        }, { rootMargin: '600px' });
        if (node) observer.current.observe(node);
    }, [loading, loadingMore]);

    const filteredPosts = React.useMemo(() => {
        if (!posts) return [];
        if (!currentUser) return posts;

        const isMinor = currentUser.age && currentUser.age < 18;

        return posts.filter(post => {
            if (isMinor) {
                // Minors: Hide marked sensitive/adult/explicit
                if (post.isSensitive || post.isAdult || post.isExplicit) return false;
            } else {
                // Adults: Only hide if preference is set. No automatic sensual filtering.
                if (currentUser.hideSensitiveContent && post.isSensitive) return false;
            }
            return true;
        });
    }, [posts, currentUser]);

    // Fallback logic: Adults can fallback to raw posts if filters are too restrictive.
    // Minors never fallback to sensitive content.
    const displayPosts = React.useMemo(() => {
        if (filteredPosts.length > 0) return filteredPosts;
        if (currentUser && currentUser.age < 18) return [];
        return posts; // Fallback for Adults and Guests
    }, [filteredPosts, posts, currentUser]);

    if (loading && posts.length === 0) return <FeedSkeleton />;
    
    if (error) return (
        <div className="feed-error">
            Error loading posts: {error.message || JSON.stringify(error)}
        </div>
    );

    return (
        <div className="feed-container">
            {displayPosts.length === 0 ? (
                <div className="feed-empty">
                    {currentUser && currentUser.age < 18
                        ? "No appropriate posts available right now"
                        : "No posts available at the moment."}
                </div>
            ) : (
                <>
                    {/* Community Spotlight (Phase 7) */}
                    {spotlightPost && !searchTerm && !circleId && !filterCategory && (
                        <SpotlightCard post={spotlightPost} />
                    )}

                    {displayPosts.map(post => (
                        <FeedItem key={post.id} post={post} />
                    ))}

                    {/* --- FEED LOADERS & BANNERS --- */}
                    {!isNativeApp ? (
                        /* Website Behavior */
                        <div className="feed-footer-website">
                            {/* Manual pagination for Website */}
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setPostLimit(prev => prev + 10);
                                }}
                                disabled={loading || loadingMore}
                                className="btn-see-more"
                            >
                                {loadingMore ? 'Fetching more...' : 'See more posts'}
                            </button>
                        </div>
                    ) : (
                        /* Native App Behavior (Infinite Scroll) */
                        <div ref={loaderRef} className="feed-loader-native">
                            {(loading || loadingMore) && (
                                <div className="loader-spinner-wrapper">
                                    <div className="loader-spinner" />
                                    <span className="loader-text">
                                        Loading more entries...
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default React.memo(FeedList);
