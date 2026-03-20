import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Reactions from './Reactions';
import CommentSection from './CommentSection';
import MediaCarousel from './MediaCarousel';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { trackCategoryInteraction } from '../../services/trackingService';
import './FeedItem.css';

const FeedItem = React.memo(({ post, onDelete }) => {
    const { currentUser } = useAuth();
    const [showComments, setShowComments] = useState(false);
    const [expanded, setExpanded] = useState(false);

    const handleReport = async () => {
        if (!confirm('Report this post for review? We will check it for community guidelines violations.')) return;
        try {
            // Log to a dedicated 'reports' collection
            const { addDoc, collection, serverTimestamp } = await import('firebase/firestore');
            await addDoc(collection(db, 'reports'), {
                postId: post.id,
                reporterId: currentUser?.uid || 'anonymous',
                timestamp: serverTimestamp(),
                reason: 'Community Guideline Violation'
            });
            alert('Thank you for helping us keep the sanctuary safe. Our team will review this post.');
            analytics.logEvent('post_reported', { postId: post.id });
        } catch (error) {
            console.error('Report failed:', error);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Remove this post from the sanctuary?')) return;
        try {
            await deleteDoc(doc(db, 'posts', post.id));
            if (onDelete) onDelete(post.id);
            else window.location.reload();
        } catch (error) { 
            console.error('Delete failed:', error);
            alert('Error: ' + error.message); 
        }
    };

    const canDelete = currentUser && (
        currentUser.uid === post.authorId ||
        currentUser.role === 'admin' ||
        currentUser.role === 'psychologist'
    );

    const isPostIncognito = post.isIncognito && currentUser?.role !== 'admin' && currentUser?.role !== 'psychologist';
    const isAccountAnon = post.authorIsAnonymous === true && currentUser?.role !== 'admin';
    const isAnon = isPostIncognito || isAccountAnon;

    const authorInitial = isAnon ? (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
    ) : (post.authorName ? post.authorName.charAt(0) : 'F');

    const authorName = isAnon ? 'Anonymous' : (post.authorName || 'A Friend');
    const canViewAuthorProfile = !isAnon && !!post.authorId;

    const handleShare = async () => {
        const shareUrl = `${window.location.origin}/post/${post.id}`;
        const shareTitle = 'SoulThread Sanctuary';
        const shareText = `${post.content || ''}\n\nRead more at:`;

        if (navigator.share) {
            try {
                const shareData = { title: shareTitle, text: shareText, url: shareUrl };
                if (post.mediaUrl && !post.mediaUrl.includes('test.com')) {
                    try {
                        const response = await fetch(post.mediaUrl);
                        const blob = await response.blob();
                        const fileName = post.mediaUrl.split('/').pop().split('?')[0] || 'share.jpg';
                        const file = new File([blob], fileName, { type: blob.type });
                        if (navigator.canShare && navigator.canShare({ files: [file] })) {
                            shareData.files = [file];
                        }
                    } catch (mediaErr) {
                        console.warn("Media share prep failed", mediaErr);
                    }
                }
                await navigator.share(shareData);
            } catch (e) {
                console.log("Share skipped or failed", e);
            }
        } else {
            try {
                await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
                alert('Sanctuary link and content copied to clipboard');
            } catch (e) { /* ignore */ }
        }
    };

    return (
        <article className="feed-item-article">
            {/* Header */}
            <div className="feed-item-header">
                <div className="author-info">
                    <div style={{ position: 'relative' }}>
                        {!isAnon ? (
                            <div className="author-avatar-wrapper">
                                <img
                                    src={post.authorPhotoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.authorId || 'soulthread'}`}
                                    alt={authorName}
                                    className="author-avatar-img"
                                    onError={e => {
                                        if (!e.target.src.includes('anonymous')) {
                                            e.target.src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=anonymous';
                                        }
                                    }}
                                />
                            </div>
                        ) : (
                            <div className="anon-avatar">
                                {authorInitial}
                            </div>
                        )}
                        {post.authorRole === 'psychologist' && (
                            <div className="psychologist-badge">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                                </svg>
                            </div>
                        )}
                    </div>

                    <div className="author-details">
                        <div className="author-name-row">
                            {canViewAuthorProfile ? (
                                <Link to={`/profile/${post.authorId}`} className="author-name-link">
                                    {authorName}
                                </Link>
                            ) : (
                                <span className="anon-name-text">
                                    Anonymous Soul
                                </span>
                            )}

                            {post.authorRole === 'psychologist' && (
                                <span className="expert-badge">
                                    VERIFIED EXPERT
                                </span>
                            )}

                            {post.isIncognito && (currentUser?.role === 'admin' || currentUser?.role === 'psychologist') && (
                                <span className="incognito-badge">
                                    INCOGNITO
                                </span>
                            )}
                        </div>
                        {(isAnon || post.circleId) && (
                            <div className="meta-info">
                                {isAnon && <span className="anon-meta">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                    </svg>
                                    Anonymous Presence
                                </span>}
                                {post.circleId && <span className="circle-meta" style={{ marginLeft: isAnon ? '8px' : '0' }}>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <circle cx="12" cy="12" r="10" /><path d="M8 12h8" />
                                    </svg>
                                    Private Circle
                                </span>}
                            </div>
                        )}
                    </div>
                </div>

                {canDelete && (
                    <button onClick={handleDelete} className="delete-btn-top" title="Delete post">
                        ×
                    </button>
                )}
            </div>

            {/* Guided Reflection Header */}
            {post.type === 'guided' && post.promptText && (
                <div className="guided-reflection-block">
                    <div className="guidance-label">Soul Guidance</div>
                    <div className="guidance-text">"{post.promptText}"</div>
                </div>
            )}

            {/* Content */}
            <div className="feed-item-content">
                <div className="content-text">
                    {expanded ? post.content : (
                        <>
                            {post.content && post.content.length > 250
                                ? `${post.content.substring(0, 250)}`
                                : post.content}
                            {post.content && post.content.length > 250 && (
                                <button
                                    onClick={() => {
                                        setExpanded(true);
                                        if (post.categoryId) trackCategoryInteraction(post.categoryId, 'click');
                                    }}
                                    className="read-more-btn"
                                >
                                    ... Read more
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Media */}
            {((post.mediaItems && post.mediaItems.length > 0) || (post.mediaUrl && !post.mediaUrl.includes('test.com'))) && (
                <div className="feed-item-media">
                    {post.mediaItems && post.mediaItems.length > 0 ? (
                        <MediaCarousel mediaItems={post.mediaItems} />
                    ) : (
                        post.mediaUrl && !post.mediaUrl.includes('test.com') && (() => {
                            const isVid = post.mediaType === 'video' ||
                                (post.mediaUrl.split('?')[0]).match(/\.(mp4|webm|ogg|mov)$/i);
                            return isVid ? (
                                <video src={post.mediaUrl} controls playsInline preload="metadata" className="feed-item-video" />
                            ) : (
                                <img 
                                    src={post.mediaUrl} 
                                    alt={post.content ? `Story snippet: ${post.content.substring(0, 50)}...` : 'Shared story image from SoulThread community'} 
                                    loading="lazy" 
                                    decoding="async" 
                                    className="feed-item-img" 
                                />
                            );
                        })()
                    )}
                </div>
            )}

            {/* Action Bar */}
            <div className="action-bar-divider">
                <div className="reactions-row">
                    <Reactions postId={post.id} postAuthorId={post.authorId} initialCounts={post.reactionCounts || {}} />
                </div>

                <div className="interaction-row">
                    <button
                        onClick={() => setShowComments(!showComments)}
                        className={`btn-interaction btn-comments ${showComments ? 'active' : ''}`}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                        <span>{showComments ? 'Hide Comments' : `Reflections ${post.commentsCount > 0 ? `(${post.commentsCount})` : ''}`}</span>
                    </button>

                    <button
                        onClick={handleShare}
                        className="btn-interaction btn-share"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>
                        </svg>
                        Share
                    </button>
                    {!canDelete && currentUser && (
                        <button onClick={handleReport} className="btn-interaction btn-report" title="Report post">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>
                            </svg>
                            Report
                        </button>
                    )}
                    {canDelete && (
                        <button onClick={handleDelete} className="delete-btn-bottom">
                             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        </button>
                    )}
                </div>

                {showComments && (
                    <div className="comments-container">
                        <CommentSection postId={post.id} postAuthorId={post.authorId} />
                    </div>
                )}
            </div>
        </article>
    );
});

export default FeedItem;
