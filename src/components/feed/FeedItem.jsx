// FeedItem — single post card: author, content, reactions, share, delete
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Reactions from './Reactions';
import CommentSection from './CommentSection';
import MediaCarousel from './MediaCarousel';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';

import { getCategoryConfig } from '../../config/issueCategories';
import { 
    Lock, 
    Trash2, 
    Share2, 
    MessageSquare, 
    Flag, 
    Bookmark, 
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
    Sprout,
    User,
    Building2,
    DollarSign,
    Briefcase,
    Stethoscope
} from 'lucide-react';
import './FeedItem.css';

const CATEGORY_LUCIDE_ICONS = {
  mental_health: Brain,
  relationships: Heart,
  caretaker: Building2,
  financial: DollarSign,
  career: Briefcase,
  physical_health: Stethoscope
};

const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'recent';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const diff = Math.floor((new Date() - date) / 1000);
    if (diff < 3600)   return 'recent';
    if (diff < 86400)  return 'today';
    if (diff < 172800) return 'yesterday';
    if (diff < 604800) return 'this week';
    return 'earlier';
};

const renderParsedContent = (text) => {
    if (!text) return '';
    const parts = text.split(/(\s+|\n)/);
    return parts.map((part, i) => {
        if (part.startsWith('#')) {
            return <span key={i} className="content-hashtag">{part}</span>;
        }
        return part;
    });
};

const FeedItem = React.memo(({ post, onDelete, autoExpandComments = false }) => {
    const { currentUser } = useAuth();
    const [showComments, setShowComments] = useState(autoExpandComments);
    const [showShareMenu, setShowShareMenu] = useState(false);
    const [isConnected, setIsConnected] = useState(false);

    const isPostIncognito = post.isIncognito && currentUser?.role !== 'admin' && currentUser?.role !== 'guide';
    const isAccountAnon = post.authorIsAnonymous === true && currentUser?.role !== 'admin';
    const isAnon = isPostIncognito || isAccountAnon;

    // Check connection status with post author (not for own posts or anon posts)
    useEffect(() => {
        if (!currentUser || !post.authorId || isAnon || currentUser.uid === post.authorId) return;
        const connected = currentUser.connections?.includes(post.authorId) ||
                          (Array.isArray(currentUser.connections) && currentUser.connections.includes(post.authorId));
        setIsConnected(!!connected);
    }, [currentUser, post.authorId, isAnon]);

    const handleConnectFromPost = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!currentUser) { navigate('/login'); return; }
        if (isConnected) return; // already connected, go to profile to disconnect
        try {
            const { setDoc, doc: fbDoc, arrayUnion, addDoc, collection, serverTimestamp } = await import('firebase/firestore');
            const { db: database } = await import('../../services/firebase');
            // Send connection REQUEST — not instant connect
            const myRef = fbDoc(database, 'users', currentUser.uid);
            const theirRef = fbDoc(database, 'users', post.authorId);
            await setDoc(myRef, { sentRequests: arrayUnion(post.authorId) }, { merge: true });
            await setDoc(theirRef, { pendingRequests: arrayUnion(currentUser.uid) }, { merge: true });
            // Notify the other person
            await addDoc(collection(database, 'notifications'), {
                recipientId: post.authorId,
                senderId: currentUser.uid,
                senderName: currentUser.isIncognito ? 'Someone' : (currentUser.displayName || 'Someone'),
                senderPhoto: currentUser.isIncognito ? '' : (currentUser.photoURL || ''),
                type: 'connection_request',
                message: `${currentUser.isIncognito ? 'Someone' : (currentUser.displayName || 'Someone')} wants to connect with you.`,
                read: false,
                createdAt: serverTimestamp()
            });
            setIsConnected(true); // shows "Requested"
        } catch (err) { console.error('Connect error', err); }
    };
    const [expanded, setExpanded] = useState(false);
    const [toast, setToast] = useState(null);
    const [isSaved, setIsSaved] = useState(false);
    const catConfig = getCategoryConfig(post.category);

    React.useEffect(() => {
        if (!currentUser) return;
        const checkSaved = async () => {
            try {
                const { getDoc, doc } = await import('firebase/firestore');
                const docRef = doc(db, 'users', currentUser.uid, 'saved_posts', post.id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) setIsSaved(true);
            } catch (err) {}
        };
        checkSaved();
    }, [currentUser, post.id]);

    const handleSavePost = async () => {
        if (!currentUser) {
            setToast('Please login to save posts');
            setTimeout(() => setToast(null), 2000);
            return;
        }
        try {
            const { doc, setDoc, deleteDoc, serverTimestamp } = await import('firebase/firestore');
            const docRef = doc(db, 'users', currentUser.uid, 'saved_posts', post.id);
            if (isSaved) {
                await deleteDoc(docRef);
                setIsSaved(false);
                setToast('Post removed from saved');
            } else {
                await setDoc(docRef, { postId: post.id, savedAt: serverTimestamp() });
                setIsSaved(true);
                setToast('Post saved');
            }
            setTimeout(() => setToast(null), 2000);
        } catch (error) {
            console.error('Save failed:', error);
        }
    };

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
        currentUser.role === 'guide'
    );

    const authorInitial = isAnon ? (
        <User size={20} strokeWidth={2.5} color="rgba(255, 255, 255, 0.6)" />
    ) : (post.authorHandle ? post.authorHandle.charAt(0) : 'S');

    // Show real name if not anonymous — user can hide in profile settings
    const authorName = isAnon ? 'Anonymous' : (post.authorDisplayName || post.authorName || post.authorHandle || 'SoulThread');
    const displayName = authorName === 'Soul_bot' ? 'SoulThread' : authorName;
    const canViewAuthorProfile = !isAnon && !!post.authorId;

    const handleShare = async () => {
        const postUrl = `https://soulthread.in/post/${post.id}`;
        const snippet = post.content ? post.content.substring(0, 100) + (post.content.length > 100 ? '...' : '') : '';
        const fullText = snippet ? `${snippet}\n\n${postUrl}` : postUrl;

        if (navigator.share) {
            try {
                await navigator.share({ title: 'SoulThread', text: fullText, url: postUrl });
                return;
            } catch (e) {
                if (e.name === 'AbortError') return;
            }
        }
        // Fallback: show manual share sheet
        setShowShareMenu(true);
    };

    const CategoryIcon = CATEGORY_LUCIDE_ICONS[catConfig.id] || Brain;

    const isFlaggedByMe = post.flagged === true && currentUser?.uid === post.authorId;
    const isLong = post.content?.length > 280;

    return (
        <article className={`feed-item-article ${isFlaggedByMe ? 'flagged-post' : ''}`} data-category={post.categoryId || 'general'} style={isFlaggedByMe ? { border: '2px solid rgba(239, 68, 68, 0.5)' } : {}}>
            {isFlaggedByMe && (
                <div style={{ padding: '8px 16px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Flag size={14} /> Post under review
                </div>
            )}
            
            {post.circleId && (
                <div style={{ padding: '0 16px 8px', fontSize: '12px', color: 'var(--color-primary)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Circle size={12} /> Private Circle
                </div>
            )}

            {/* Header */}
            <div className="feed-item-header">
                <div className="author-info">
                    <div style={{ position: 'relative' }}>
                        {!isAnon ? (
                            <div className="author-avatar-wrapper">
                                <img
                                    src={post.authorPhotoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.authorId || 'soulthread'}`}
                                    alt={displayName}
                                    className="author-avatar-img"
                                    loading="lazy"
                                    decoding="async"
                                    width="36"
                                    height="36"
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
                        {post.authorRole === 'guide' && (
                            <div className="guide-badge">
                                <Star size={10} fill="currentColor" />
                            </div>
                        )}
                    </div>

                    <div className="author-details">
                        <div className="author-name-row">
                            {canViewAuthorProfile ? (
                                <Link to={`/profile/${post.authorId}`} className="author-name-link" style={{ fontWeight: 600, fontSize: '14px', color: 'var(--color-text-primary)' }}>
                                    {displayName}
                                </Link>
                            ) : (
                                <span className="anon-name-text" style={{ fontWeight: 600, fontSize: '14px', color: 'var(--color-text-primary)' }}>
                                    {displayName}
                                </span>
                            )}

                            <span className="feed-item-small-badge">
                                {catConfig.label}
                            </span>

                            {post.authorRole === 'guide' && (
                                <div className="expert-badge-premium">
                                    <ShieldCheck size={12} fill="var(--color-primary)" stroke="white" />
                                    <span>Verified Expert</span>
                                </div>
                            )}

                            {post.isIncognito && (currentUser?.role === 'admin' || currentUser?.role === 'guide') && (
                                <span className="incognito-badge">
                                    INCOGNITO
                                </span>
                            )}
                            
                            <span className="author-meta-dot">·</span>
                            <span className="author-time-text" style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: '400' }}>
                                {formatTimeAgo(post.createdAt)}
                            </span>
                            {/* Connect button — only for named non-own posts */}
                            {currentUser && !isAnon && post.authorId && currentUser.uid !== post.authorId && canViewAuthorProfile && (
                                <button
                                    onClick={handleConnectFromPost}
                                    style={{
                                        marginLeft: '6px', padding: '2px 10px',
                                        borderRadius: '12px', border: '1px solid',
                                        borderColor: isConnected ? 'var(--color-border)' : 'var(--color-primary)',
                                        background: isConnected ? 'transparent' : 'var(--color-primary-soft)',
                                        color: isConnected ? 'var(--color-text-muted)' : 'var(--color-primary)',
                                        fontSize: '11px', fontWeight: '600', cursor: 'pointer',
                                        flexShrink: 0, whiteSpace: 'nowrap'
                                    }}
                                >
                                    {isConnected ? 'Connected' : '+ Connect'}
                                </button>
                            )}
                        </div>
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
                    <div
                        style={{
                            overflow: isLong ? 'hidden' : 'visible',
                            position: 'relative',
                            maxHeight: isLong && !expanded ? '100px' : 'none',
                            transition: expanded ? 'max-height 0.4s ease' : 'max-height 0.25s ease',
                        }}
                        className="content-text"
                    >
                        {renderParsedContent(post.content)}

                        {isLong && !expanded && (
                            <div className="content-fade-overlay" />
                        )}
                    </div>

                    {isLong && !expanded && (
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
                        title={showComments ? 'Hide replies' : 'Reply'}
                    >
                        <MessageSquare size={18} />
                        {post.commentsCount > 0 && (
                            <span>{post.commentsCount > 200 ? '200+' : post.commentsCount}</span>
                        )}
                    </button>

                    <button onClick={handleShare} className="btn-action-text" title="Share">
                        <Share2 size={18} />
                    </button>
                </div>

                <div className="utility-interactions">
                    <button onClick={handleSavePost} className={`btn-icon-soft ${isSaved ? 'active' : ''}`} title="Save post">
                        <Bookmark size={18} fill={isSaved ? "currentColor" : "none"} />
                    </button>
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
            
            {toast && (
                <div style={{
                    position: 'absolute',
                    bottom: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(0, 0, 0, 0.8)',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: '500',
                    zIndex: 100,
                    animation: 'fade-in 0.2s ease-out'
                }}>
                    {toast}
                </div>
            )}

            {/* Share menu */}
            {showShareMenu && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 300, display: 'flex', alignItems: 'flex-end' }}
                    onClick={() => setShowShareMenu(false)}>
                    <div style={{ background: 'var(--color-surface)', borderRadius: '20px 20px 0 0', padding: '20px 16px 40px', width: '100%' }}
                        onClick={e => e.stopPropagation()}>
                        <p style={{ fontWeight: '700', fontSize: '15px', marginBottom: '16px', textAlign: 'center', color: 'var(--color-text-primary)' }}>Share this post</p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                            {[
                                { label: 'WhatsApp', bg: '#25D366', text: 'white', letter: 'W', url: `https://wa.me/?text=${encodeURIComponent((post.content?.substring(0,80)||'') + '\n\nhttps://soulthread.in/post/' + post.id)}` },
                                { label: 'Telegram', bg: '#0088cc', text: 'white', letter: 'T', url: `https://t.me/share/url?url=${encodeURIComponent('https://soulthread.in/post/'+post.id)}&text=${encodeURIComponent(post.content?.substring(0,80)||'')}` },
                                { label: 'Twitter', bg: '#000', text: 'white', letter: 'X', url: `https://twitter.com/intent/tweet?text=${encodeURIComponent((post.content?.substring(0,100)||'') + '\nhttps://soulthread.in/post/' + post.id)}` },
                                { label: 'Copy Link', bg: 'var(--color-primary-soft)', text: 'var(--color-primary)', letter: '🔗', url: null },
                            ].map(opt => (
                                <button key={opt.label}
                                    onClick={async () => {
                                        if (opt.url) { window.open(opt.url, '_blank'); }
                                        else { await navigator.clipboard.writeText('https://soulthread.in/post/'+post.id); setToast('Link copied!'); setTimeout(()=>setToast(null),2000); }
                                        setShowShareMenu(false);
                                    }}
                                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', padding: '12px 4px', borderRadius: '12px', border: 'none', background: 'transparent', cursor: 'pointer' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: opt.bg, color: opt.text, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: opt.letter.length > 1 ? '22px' : '18px', fontWeight: '800' }}>
                                        {opt.letter}
                                    </div>
                                    <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: '500' }}>{opt.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </article>
    );
});

export default FeedItem;
