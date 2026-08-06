import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import CommentSection from './CommentSection';
import { doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { COMMUNITIES, MOODS } from '../../store/useCommunityStore';
import { Trash2, Share2, MessageSquare, Flag, Bookmark, Ghost, UserCircle2, X } from 'lucide-react';

const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'Just now';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const diff = Math.floor((new Date() - date) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff/60)}m`;
    if (diff < 86400) return `${Math.floor(diff/3600)}h`;
    return `${Math.floor(diff/86400)}d`;
};

export default function FeedItem({ post, onDelete }) {
    const { currentUser } = useAuth();
    const [showComments, setShowComments] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    const isLong = post.content?.length > 280;
    const isAnon = post.isAnonymous;
    const canDelete = currentUser && (currentUser.uid === post.authorId || currentUser.role === 'admin');

    const community = COMMUNITIES.find(c => c.id === post.communityId) || COMMUNITIES[0];
    const mood = MOODS.find(m => m.id === post.moodId);

    const handleDelete = async () => {
        if (!window.confirm('Delete this post?')) return;
        try {
            await deleteDoc(doc(db, 'posts', post.id));
            if (onDelete) onDelete(post.id);
        } catch (error) { 
            console.error('Delete failed:', error);
        }
    };

    const handleReport = async () => {
        try {
            await updateDoc(doc(db, 'posts', post.id), {
                isFlagged: true,
                flaggedAt: new Date()
            });
            alert("Thank you. This post has been reported to the clinical moderation team.");
        } catch (error) {
            console.error('Report failed:', error);
        }
    };

    return (
        <article className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm relative hover:shadow-md transition-all duration-300 transform">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    {isAnon ? (
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                            <Ghost className="w-6 h-6" />
                        </div>
                    ) : post.authorPhoto ? (
                        <img src={post.authorPhoto} alt="Author" className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                        <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-500">
                            <UserCircle2 className="w-7 h-7" />
                        </div>
                    )}
                    <div>
                        <div className="flex items-center gap-2">
                            {isAnon ? (
                                <span className="font-bold text-gray-900">Anonymous</span>
                            ) : (
                                <Link to={`/profile/${post.authorId}`} className="font-bold text-gray-900 hover:underline">
                                    {post.authorName}
                                </Link>
                            )}
                            <span className="text-xs text-gray-400 font-medium">· {formatTimeAgo(post.createdAt)}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                                {community.label}
                            </span>
                            {mood && (
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${mood.color}`}>
                                    {mood.label}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {canDelete && (
                    <button onClick={handleDelete} aria-label="Delete post" className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50 hover:scale-105 active:scale-95">
                        <Trash2 className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Content */}
            <div className="mb-6 relative">
                <p className={`text-gray-800 text-[15px] leading-relaxed whitespace-pre-wrap ${!isExpanded && isLong ? 'line-clamp-4' : ''}`}>
                    {post.content}
                </p>
                {!isExpanded && isLong && (
                    <button onClick={() => setIsExpanded(true)} className="text-indigo-600 font-semibold text-sm mt-2 hover:underline">
                        Read more
                    </button>
                )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center gap-6">
                    <button 
                        onClick={() => setShowComments(!showComments)}
                        aria-expanded={showComments}
                        aria-label="Toggle comments"
                        className={`flex items-center gap-2 text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95 ${showComments ? 'text-indigo-600' : 'text-gray-500 hover:text-indigo-600'}`}
                    >
                        <MessageSquare className="w-5 h-5" />
                        <span>{post.commentsCount || 0}</span>
                    </button>

                    <button aria-label="Share post" className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-indigo-600 transition-all duration-200 hover:scale-105 active:scale-95">
                        <Share2 className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    <button aria-label="Save post" className="text-gray-400 hover:text-indigo-600 transition-all duration-200 p-2 hover:scale-105 active:scale-95">
                        <Bookmark className="w-5 h-5" />
                    </button>
                    {!canDelete && (
                        <button 
                            onClick={handleReport}
                            aria-label="Report post" 
                            className="text-gray-400 hover:text-red-500 transition-all duration-200 p-2 hover:scale-105 active:scale-95"
                        >
                            <Flag className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Comments Area */}
            {showComments && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                    <CommentSection postId={post.id} postAuthorId={post.authorId} />
                </div>
            )}
        </article>
    );
}
