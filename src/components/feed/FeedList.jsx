import React from 'react';
import FeedItem from './FeedItem';
import { usePosts } from '../../hooks/usePosts';
import { useAuth } from '../../contexts/AuthContext';
import { RefreshCw } from 'lucide-react';

export default function FeedList({ filterCategory, moodFilter }) {
    const { currentUser } = useAuth();
    const [limitCount, setLimitCount] = React.useState(15);
    
    // Fetch posts using our new hook parameters
    const { posts, loading, loadingMore, error, refetch } = usePosts(limitCount, filterCategory, moodFilter, currentUser, '');

    // Infinite scroll removed to prevent mindless engagement. 
    // Using manual "Load More" for intentionality.

    if (error) {
        return <div className="text-red-500 p-4 text-center">Failed to load feed. Please refresh.</div>;
    }

    if (loading && posts.length === 0) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="bg-white rounded-3xl p-6 h-48 animate-pulse border border-gray-100 shadow-sm flex flex-col justify-between">
                        <div className="flex gap-3 items-start">
                            <div className="w-12 h-12 bg-gray-100 rounded-full" />
                            <div className="space-y-2 flex-1 pt-1">
                                <div className="h-4 bg-gray-100 rounded w-1/3" />
                                <div className="h-3 bg-gray-100 rounded w-1/4" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="h-3 bg-gray-100 rounded w-full" />
                            <div className="h-3 bg-gray-100 rounded w-5/6" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            
            <div className="flex justify-end mb-2">
                <button 
                    onClick={refetch}
                    className="flex items-center text-xs font-semibold text-gray-500 hover:text-black transition-colors"
                >
                    <RefreshCw className="w-3 h-3 mr-1" /> Refresh
                </button>
            </div>

            {posts.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm animate-in fade-in duration-500">
                    <p className="text-gray-900 font-semibold mb-2 text-lg">This space is quiet right now.</p>
                    <p className="text-gray-500 text-sm max-w-sm mx-auto">Sometimes all it takes is one person to start a meaningful conversation. Feel free to share what's on your mind.</p>
                </div>
            ) : (
                posts.map(post => (
                    <FeedItem key={post.id} post={post} />
                ))
            )}

            {/* Intentional pagination trigger */}
            {posts.length > 0 && posts.length >= limitCount && (
                <div className="py-6 text-center">
                    <button 
                        onClick={() => setLimitCount(prev => prev + 15)}
                        disabled={loading || loadingMore}
                        className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors disabled:opacity-50"
                    >
                        {loading || loadingMore ? 'Loading...' : 'Load More Conversations'}
                    </button>
                </div>
            )}
        </div>
    );
}
