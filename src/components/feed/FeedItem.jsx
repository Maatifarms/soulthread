import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Reactions from './Reactions';
import CommentSection from './CommentSection';
import MediaCarousel from './MediaCarousel';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { trackCategoryInteraction } from '../../services/trackingService';
import { CATEGORY_MAP } from '../../data/categories';
import { 
    Lock, 
    Trash2, 
    Share2, 
    MessageSquare, 
    Flag, 
    ShieldCheck, 
    Star, 
    Circle, 
    X,
    HeartPulse,
    Brain,
    Volume2,
    Wrench,
    Sparkles,
    Rainbow,
    Users,
    Heart,
    Flame,
    PenLine,
    Sprout
} from 'lucide-react';
import './FeedItem.css';

const ICON_MAP = {
    HeartPulse,
    Brain,
    Volume2,
    Wrench,
    Sparkles,
    Rainbow,
    Users,
    Heart,
    Flame,
    PenLine,
    Sprout
};

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
        <Lock size={18} />
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
                                    loading="lazy"
                                    decoding="async"
                                    width="44"
                                    height="44"
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
                                <Star size={10} fill="currentColor" />
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
                                <div className="expert-badge-premium">
                                    <ShieldCheck size={12} fill="var(--color-primary)" stroke="white" />
                                    <span>Verified Expert</span>
                                </div>
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
                                    <Lock size={12} />
                                    Anonymous Presence
                                </span>}
                                    <span className="category-pill">
                                        {(() => {
                                            const cat = CATEGORY_MAP[post.categoryId];
                                            const IconComp = ICON_MAP[cat.icon];
                                            return IconComp ? <IconComp size={12} style={{ marginRight: '4px' }} /> : null;
                                        })()}
                                        {CATEGORY_MAP[post.categoryId].label}
                                    </span>
                                {post.circleId && <span className="circle-meta" style={{ marginLeft: isAnon ? '12px' : '0' }}>
                                    <Circle size={12} />
                                    Private Circle
                                </span>}
                            </div>
                        )}
                    </div>
                </div>

                {canDelete && (
                    <button onClick={handleDelete} className="delete-btn-top" title="Delete post">
                        <X size={18} />
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
                <div className="content-text-wrapper" style={{ position: 'relative' }}>
                    <motion.div 
                        layout 
                        initial={false}
                        animate={{ height: expanded ? 'auto' : '100px' }}
                        style={{ overflow: 'hidden', position: 'relative' }}
                        className="content-text"
                    >
                        {post.content}
                        
                        {!expanded && post.content && post.content.length > 200 && (
                            <div className="content-fade-overlay" />
                        )}
                    </motion.div>

                    {!expanded && post.content && post.content.length > 200 && (
                        <button
                            onClick={() => {
                                setExpanded(true);
                                if (post.categoryId) trackCategoryInteraction(post.categoryId, 'click');
                            }}
                            className="read-more-btn-v2"
                        >
                            Read more
                        </button>
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

            {/* Unified Action Bar */}
            <div className="action-bar-unified">
                <div className="social-interactions">
                    <Reactions postId={post.id} postAuthorId={post.authorId} initialCounts={post.reactionCounts || {}} />
                    
                    <button
                        onClick={() => setShowComments(!showComments)}
                        className={`btn-action-text ${showComments ? 'active' : ''}`}
                    >
                        <MessageSquare size={18} />
                        <span>{showComments ? 'Hide' : (post.commentsCount > 0 ? `${post.commentsCount}` : 'Reflect')}</span>
                    </button>

                    <button onClick={handleShare} className="btn-action-text">
                        <Share2 size={18} />
                        <span>Share</span>
                    </button>
                </div>

                <div className="utility-interactions">
                    {!canDelete && currentUser && (
                        <button onClick={handleReport} className="btn-icon-soft" title="Report post">
                        <Flag size={18} />
                        </button>
                    )}
                    {canDelete && (
                        <button onClick={handleDelete} className="btn-icon-soft delete" title="Delete post">
                             <Trash2 size={18} />
                        </button>
                    )}
                </div>
            </div>
            {showComments && (
                <div className="comments-container">
                    <CommentSection postId={post.id} postAuthorId={post.authorId} />
                </div>
            )}
        </article>
    );
});

export default FeedItem;
