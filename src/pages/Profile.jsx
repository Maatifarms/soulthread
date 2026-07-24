import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
    ShieldCheck, Share2, MessageCircle, UserPlus, Award, 
    LayoutGrid, List, Bookmark, BookOpen, PenTool, 
    Image, Rocket, Lock, Link2, Trash2 
} from 'lucide-react';
const ImageIcon = Image;
import useTheme from '../hooks/useTheme';
import {
    collection, doc, getDoc, getDocs, setDoc, updateDoc,
    addDoc, arrayUnion, arrayRemove, query, where,
    orderBy, limit, deleteDoc, getCountFromServer, onSnapshot,
    serverTimestamp, collectionGroup
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import FeedItem from '../components/feed/FeedItem';
import EditProfileModal from '../components/profile/EditProfileModal';
import Skeleton from '../components/common/Skeleton';
import ConnectModal from '../components/common/ConnectModal';
import MoodStatusPicker, { MoodBadge } from '../components/profile/MoodStatusPicker';
import DesktopLayoutWrapper from '../components/layout/DesktopLayoutWrapper';
import SEO from '../components/common/SEO';
import Breadcrumbs from '../components/common/Breadcrumbs';

import './Profile.css';
import MySessions from '../components/bookings/MySessions';

const ProfilePostCard = ({ post, isOwner, viewMode, onDelete, onNavigate }) => {
    const [expanded, setExpanded] = useState(false);

    const formatTimeAgo = (timestamp) => {
        if (!timestamp) return 'Just now';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const now = new Date();
        const diff = Math.floor((now - date) / 1000);
        
        if (diff < 60) return 'Just now';
        const mins = Math.floor(diff / 60);
        if (mins < 60) return `${mins}m ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    const contentText = post.content || '';
    const isLongText = contentText.length > 200;
    const shouldClamp = isLongText && !expanded;

    return (
        <div className={`profile-post-card ${viewMode}`} style={{
            background: post.style?.background || 'var(--color-surface)',
            color: post.style?.color || 'var(--color-text-primary)'
        }}>
            <div className="profile-post-header">
                <span className="profile-post-category-badge">{post.category?.toUpperCase() || 'GENERAL'}</span>
                {isOwner && post.flagged && (
                    <span style={{ marginLeft: '8px', padding: '2px 8px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontSize: '10px', fontWeight: 'bold', borderRadius: '4px' }}>
                        Post under review
                    </span>
                )}
                <span className="profile-post-time">{formatTimeAgo(post.createdAt)}</span>
            </div>
            
            <div className="profile-post-body" onClick={() => onNavigate(post.id)}>
                <p className={`profile-post-content ${shouldClamp ? 'clamped' : ''}`}>
                    {contentText}
                </p>
                {isLongText && (
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            setExpanded(!expanded);
                        }} 
                        className="read-more-btn"
                    >
                        {expanded ? 'Show less' : 'Read more'}
                    </button>
                )}
            </div>

            <div className="profile-post-footer">
                <div className="profile-post-stats">
                    <span className="stat-span">❤️ {post.likes?.length || post.likesCount || 0}</span>
                    <span className="stat-span">💬 {post.commentsCount || post.repliesCount || 0}</span>
                </div>
                {isOwner && (
                    <button 
                        className="delete-post-btn" 
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(post.id);
                        }}
                    >
                        <Trash2 size={16} />
                    </button>
                )}
            </div>
        </div>
    );
};

const Profile = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { currentUser, logout, loading: authLoading } = useAuth();
    const { isDarkMode } = useTheme();

    // Guest Guard: Redirect to login if not authenticated
    useEffect(() => {
        if (!authLoading && !currentUser) {
            navigate('/login');
        }
    }, [currentUser, authLoading, navigate]);

    const [userProfile, setUserProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [postsLoading, setPostsLoading] = useState(true);
    const [totalPostsCount, setTotalPostsCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [showEditModal, setShowEditModal] = useState(false);
    const [activeTab, setActiveTab] = useState('posts');
    const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'
    const [connectionStatus, setConnectionStatus] = useState('none');
    const [requests, setRequests] = useState([]);
    const [connectionsList, setConnectionsList] = useState([]);
    const [showConnectModal, setShowConnectModal] = useState(false);
    const [showHelpModal, setShowHelpModal] = useState(false);
    const [showVideoOnly, setShowVideoOnly] = useState(false); // NEW: Video filter state
    const [savedPosts, setSavedPosts] = useState([]);
    const [replies, setReplies] = useState([]);
    const [mediaPosts, setMediaPosts] = useState([]);

    // 1. Initial State
    useEffect(() => {
        if (location.state?.justSignedUp) {
            setShowEditModal(true);
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    // 2. Main Profile & Posts Listener
    useEffect(() => {
        if (!userId) return;

        let unsubPosts = () => {};
        let unsubReplies = () => {};
        let unsubSaved = () => {};

        const fetchProfile = async () => {
            setLoading(true);
            try {
                // Try fetching by UID first
                const userRef = doc(db, 'users', userId);
                const docSnap = await getDoc(userRef);

                if (docSnap.exists()) {
                    setUserProfile({ id: docSnap.id, ...docSnap.data() });
                    unsubPosts = startPostsListener(docSnap.id);
                } else {
                    // Try fetching by username
                    const q = query(collection(db, 'users'), where('username', '==', userId), limit(1));
                    const usernameSnap = await getDocs(q);

                    if (!usernameSnap.empty) {
                        const foundDoc = usernameSnap.docs[0];
                        setUserProfile({ id: foundDoc.id, ...foundDoc.data() });
                        unsubPosts = startPostsListener(foundDoc.id);
                    } else {
                        // Fallback/Legacy
                        setUserProfile({
                            uid: userId,
                            displayName: 'Soul Traveler',
                            photoURL: null,
                            bio: 'No profile information found.',
                            socials: {}
                        });
                        unsubPosts = startPostsListener(userId);
                    }
                }
            } catch (err) {
                console.error("Profile fetch error:", err);
            } finally {
                setLoading(false);
            }
        };

        const startPostsListener = (targetUid) => {
            setPostsLoading(true);
            const postsQuery = query(
                collection(db, "posts"),
                where("authorId", "==", targetUid),
                orderBy("createdAt", "desc"),
                limit(300)
            );
            
            return onSnapshot(postsQuery, (snapshot) => {
                console.log(`📊 [Profile] Received ${snapshot.size} posts for ${targetUid}`);
                const userPosts = snapshot.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    .filter(post => !post.circleId)
                    .sort((a, b) => {
                        const timeA = a.createdAt?.seconds || (a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt).getTime()) || 0;
                        const timeB = b.createdAt?.seconds || (b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt).getTime()) || 0;
                        return timeB - timeA;
                    });
                
                setPosts(userPosts);
                setMediaPosts(userPosts.filter(p => (p.mediaItems && p.mediaItems.length > 0) || p.type === 'video' || p.videoUrl));
                setPostsLoading(false);
            }, (err) => {
                console.error("Posts listener error:", err);
                setPostsLoading(false);
            });
        };

        fetchProfile();

        // Listen to Replies (Comments by this user)
        const repliesQuery = query(
            collectionGroup(db, "replies"),
            where("authorId", "==", userId),
            orderBy("createdAt", "desc"),
            limit(20)
        );
        unsubReplies = onSnapshot(repliesQuery, (snapshot) => {
            setReplies(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }, () => setReplies([]));

        // Listen to Saved Posts (Only if isOwner)
        if (currentUser && currentUser.uid === userId) {
            const savedQuery = query(
                collection(db, `users/${userId}/saved_posts`),
                orderBy("savedAt", "desc"),
                limit(20)
            );
            unsubSaved = onSnapshot(savedQuery, async (snapshot) => {
                const savedList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                const actualPosts = await Promise.all(savedList.map(async (s) => {
                    const postRef = doc(db, 'posts', s.postId || s.id);
                    const docSnap = await getDoc(postRef);
                    if (docSnap.exists()) {
                        return { id: docSnap.id, ...docSnap.data(), savedAt: s.savedAt };
                    }
                    return null;
                }));
                setSavedPosts(actualPosts.filter(p => p !== null));
            }, () => setSavedPosts([]));
        }

        // Get Count
        const countQuery = query(
            collection(db, "posts"),
            where("authorId", "==", userId)
        );
        getCountFromServer(countQuery).then(snap => setTotalPostsCount(snap.data().count));

        return () => {
            unsubPosts();
            unsubReplies();
            unsubSaved();
        };
    }, [userId, currentUser]);

    // 3. Social Logic (Connections)
    useEffect(() => {
        const fetchConnectionsData = async () => {
            if (!userProfile || !currentUser) return;

            // Connection Status — fetch fresh from Firestore (not from auth object)
            if (currentUser.uid !== userId) {
                const myDoc = await getDoc(doc(db, 'users', currentUser.uid));
                const myData = myDoc.data() || {};
                const isConnected = myData.connections?.includes(userId) || userProfile.connections?.includes(currentUser.uid);
                const isSent = myData.sentRequests?.includes(userId) || userProfile.pendingRequests?.includes(currentUser.uid);
                const isReceived = myData.pendingRequests?.includes(userId) || userProfile.sentRequests?.includes(currentUser.uid);

                if (isConnected) setConnectionStatus('connected');
                else if (isSent) setConnectionStatus('pending');
                else if (isReceived) setConnectionStatus('received');
                else setConnectionStatus('none');
            }

            // Owner Details (Requests & List)
            if (currentUser.uid === userId) {
                const pendingIds = (userProfile.pendingRequests || []).filter(id => id !== currentUser.uid).slice(0, 10);
                if (pendingIds.length > 0) {
                    const reqSnaps = await Promise.all(pendingIds.map(id => getDoc(doc(db, 'users', id))));
                    setRequests(reqSnaps.map(s => ({ id: s.id, ...s.data() })));
                }

                const connIds = (userProfile.connections || []).filter(id => id !== currentUser.uid).slice(0, 20);
                if (connIds.length > 0) {
                    const connSnaps = await Promise.all(connIds.map(id => getDoc(doc(db, 'users', id))));
                    setConnectionsList(connSnaps.map(s => ({ id: s.id, ...s.data() })));
                }
            }
        };

        fetchConnectionsData();
    }, [userProfile, currentUser, userId]);

    // Open Modal
    const handleConnectClick = async () => {
        if (!currentUser) return navigate('/login');

        if (connectionStatus === 'connected') {
            try {
                const myRef = doc(db, 'users', currentUser.uid);
                const theirRef = doc(db, 'users', userId);
                await setDoc(myRef, { connections: arrayRemove(userId) }, { merge: true });
                await setDoc(theirRef, { connections: arrayRemove(currentUser.uid) }, { merge: true });
                setConnectionStatus('none');
            } catch (e) { console.error('Unfollow error', e); }
            return;
        }

        if (connectionStatus === 'pending') {
            try {
                const myRef = doc(db, 'users', currentUser.uid);
                const theirRef = doc(db, 'users', userId);
                await setDoc(myRef, { sentRequests: arrayRemove(userId) }, { merge: true });
                await setDoc(theirRef, { pendingRequests: arrayRemove(currentUser.uid) }, { merge: true });
                setConnectionStatus('none');
            } catch (e) { console.error('Cancel request error', e); }
            return;
        }

        // Open the ConnectModal to type a note
        setShowConnectModal(true);
    };

    const confirmConnect = async (note) => {
        try {
            const myRef = doc(db, 'users', currentUser.uid);
            const theirRef = doc(db, 'users', userId);
            await setDoc(myRef, { sentRequests: arrayUnion(userId) }, { merge: true });
            await setDoc(theirRef, { pendingRequests: arrayUnion(currentUser.uid) }, { merge: true });
            setConnectionStatus('pending');
            const isAnon = currentUser.isIncognito || currentUser.isAnonymous;
            await addDoc(collection(db, 'notifications'), {
                recipientId: userId,
                senderId: currentUser.uid,
                senderName: isAnon ? 'Someone' : (currentUser.displayName || 'Someone'),
                senderPhoto: isAnon ? '' : (currentUser.photoURL || ''),
                type: 'connection_request',
                message: note ? `${isAnon ? 'Someone' : (currentUser.displayName || 'Someone')} wants to connect: "${note}"` : `${isAnon ? 'Someone' : (currentUser.displayName || 'Someone')} wants to connect with you. Tap to accept.`,
                read: false,
                createdAt: serverTimestamp()
            });
            setShowConnectModal(false);
        } catch (e) { console.error('Connect error', e); }
    };

    const handleDeclineRequest = async () => {
        try {
            const myRef = doc(db, 'users', currentUser.uid);
            const theirRef = doc(db, 'users', userId);
            await setDoc(myRef, { pendingRequests: arrayRemove(userId) }, { merge: true });
            await setDoc(theirRef, { sentRequests: arrayRemove(currentUser.uid) }, { merge: true });
            setConnectionStatus('none');
        } catch (e) { console.error('Decline error', e); }
    };

    const handleAcceptRequest = async (requesterId) => {
        try {
            const myRef = doc(db, 'users', currentUser.uid);
            const theirRef = doc(db, 'users', requesterId);

            // PREVENT MULTIPLE ACCEPTANCES - Check current state first
            const myDoc = await getDoc(myRef);
            const myData = myDoc.data();

            // Check if already connected
            if (myData.connections?.includes(requesterId)) {
                alert('You are already connected with this user.');
                return;
            }

            // Check if request still exists
            if (!myData.pendingRequests?.includes(requesterId)) {
                alert('Connection request not found or already processed.');
                return;
            }

            await setDoc(myRef, {
                connections: arrayUnion(requesterId),
                pendingRequests: arrayRemove(requesterId)
            }, { merge: true });

            await setDoc(theirRef, {
                connections: arrayUnion(currentUser.uid),
                sentRequests: arrayRemove(currentUser.uid)
            }, { merge: true });

            // Send acceptance notification
            const isAnon = currentUser.isIncognito || currentUser.isAnonymous;
            await addDoc(collection(db, 'notifications'), {
                recipientId: requesterId,
                senderId: currentUser.uid,
                senderName: isAnon ? 'Someone' : (currentUser.displayName || 'Someone'),
                senderPhoto: isAnon ? 'https://api.dicebear.com/7.x/avataaars/svg?seed=anonymous' : currentUser.photoURL,
                type: 'connection_accepted',
                message: `${isAnon ? 'Someone' : (currentUser.displayName || 'Someone')} accepted your connection request.`,
                read: false,
                createdAt: serverTimestamp(),
                link: '/messages'
            });

            // CLEAN UP OLD NOTIFICATIONS - Delete the original connection request notification
            const notificationsRef = collection(db, 'notifications');
            const q = query(
                notificationsRef,
                where('recipientId', '==', currentUser.uid),
                where('senderId', '==', requesterId),
                where('type', '==', 'connection_request')
            );
            const snapshot = await getDocs(q);
            snapshot.forEach(doc => deleteDoc(doc.ref));

        } catch (e) { console.error(e); }
    };

    const handleRemoveConnection = async () => {
        if (!window.confirm("Are you sure you want to remove this connection?")) return;
        try {
            const myRef = doc(db, 'users', currentUser.uid);
            const theirRef = doc(db, 'users', userId);

            await setDoc(myRef, { connections: arrayRemove(userId) }, { merge: true });
            await setDoc(theirRef, { connections: arrayRemove(currentUser.uid) }, { merge: true });
            setConnectionStatus('none');
        } catch (error) {
            console.error("Error removing connection:", error);
            alert("Failed to remove connection.");
        }
    };

    const handleBlockUser = async () => {
        if (!window.confirm("Are you sure you want to block this user? They will not be able to contact you.")) return;
        try {
            const myRef = doc(db, 'users', currentUser.uid);
            await setDoc(myRef, {
                blockedUsers: arrayUnion(userId),
                connections: arrayRemove(userId),
                pendingRequests: arrayRemove(userId)
            }, { merge: true });
            setConnectionStatus('blocked');
            alert("User blocked.");
            navigate('/');
        } catch (error) {
            console.error("Error blocking user:", error);
            alert("Failed to block user.");
        }
    };
    const handleDeletePost = async (postId) => {
        if (!window.confirm('Remove this post from the sanctuary?')) return;
        try {
            await deleteDoc(doc(db, 'posts', postId));
            setPosts(prev => prev.filter(p => p.id !== postId));
        } catch (error) {
            console.error('Delete failed:', error);
            alert('Error: ' + error.message);
        }
    };

    if (loading || !userProfile) return <Skeleton height="300px" />;

    const isOwner = currentUser?.uid === userId;
    const anonymousHandle = userProfile.anonymousHandle || (userProfile.id ? `Soul${userProfile.id.slice(-4)}` : 'Soulxxxx');
    const isSuper = currentUser?.role === 'admin' || currentUser?.role === 'guide';

    // ABSOLUTE INCOGNITO CHECK: Only Owner or Admin can see an Incognito profile
    const isBlockedByMe = currentUser?.blockedUsers?.includes(userId);
    const hasBlockedMe = userProfile.blockedUsers?.includes(currentUser?.uid);
    // Be careful with isHidden - if it's too aggressive, users might not see their own posts
    const isHidden = (userProfile.isIncognito && (currentUser?.uid !== userId) && !isSuper) || (currentUser && !isSuper && (isBlockedByMe || hasBlockedMe));

    // ANONYMOUS ACCOUNT WALL: Block all visitors except the owner and admins
    if ((userProfile.isAnonymous || userProfile.isIncognito) && !isOwner && !isSuper) {
        return (
            <div className="container" style={{ textAlign: 'center', padding: '100px 20px' }}>
                <div style={{ color: 'var(--color-text-secondary)', marginBottom: '20px' }}>
                    <Lock size={64} />
                </div>
                <h2 style={{ color: 'var(--color-text-primary)', marginBottom: '12px' }}>This profile is private</h2>
                <p style={{ color: 'var(--color-text-secondary)', maxWidth: '320px', margin: '0 auto 24px', lineHeight: '1.6' }}>
                    This person has chosen to remain anonymous. Their identity and profile are fully protected.
                </p>
                <button
                    onClick={() => navigate('/')}
                    style={{
                        padding: '10px 24px',
                        background: 'var(--color-primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '24px',
                        cursor: 'pointer'
                    }}
                >
                    Return Home
                </button>
            </div>
        );
    }

    if (isHidden) {
        return (
            <div className="container" style={{ textAlign: 'center', padding: '100px 20px' }}>
                <h2 style={{ color: 'var(--color-text-primary)' }}>
                    {isBlockedByMe ? 'You have blocked this account' : 'Account unavailable'}
                </h2>
                <p style={{ color: 'var(--color-text-secondary)' }}>
                    {isBlockedByMe
                        ? 'To see their journey, you must unblock them in your Settings.'
                        : 'The profile you are looking for is currently private or restricted.'}
                </p>
                <button
                    onClick={() => navigate('/')}
                    style={{
                        marginTop: '20px',
                        padding: '10px 24px',
                        background: 'var(--color-primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '24px',
                        cursor: 'pointer'
                    }}
                >
                    Return Home
                </button>
            </div>
        );
    }

    return (
        <DesktopLayoutWrapper>
            <SEO 
                title={`${userProfile.displayName || 'Soul'} (@${userProfile.username || 'soul'}) | SoulThread`}
                description={userProfile.bio || `Explore ${userProfile.displayName}'s expressions, reflections, and mindful journey on SoulThread.`}
                image={userProfile.photoURL}
                url={`https://soulthread.in/profile/${userProfile.username || userId}`}
                schema={{
                    "@context": "https://schema.org",
                    "@type": "BreadcrumbList",
                    "itemListElement": [
                        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://soulthread.in/" },
                        { "@type": "ListItem", "position": 2, "name": "Profile", "item": `https://soulthread.in/profile/${userProfile.username || userId}` }
                    ]
                }}
            />
            <div className="container profile-page" style={{
                padding: '0 0 120px 0',
                animation: 'fadeIn 0.5s',
                maxWidth: 'var(--app-max-width)'
            }}>
                <Breadcrumbs />
                {/* PREMIUM PROFILE HEADER */}
                <div className="profile-hero-container">
                    <div className="profile-hero"></div>

                    <div className="profile-header-content">
                        {/* Avatar & Stats Row (Instagram Style) */}
                        <div className="profile-avatar-stats-row">
                            <div className="profile-avatar-wrapper" onClick={() => isOwner && setShowEditModal(true)}>
                                <div className="profile-avatar">
                                    <img 
                                        src={userProfile.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile.uid || 'soulthread'}`} 
                                        alt="" 
                                    />
                                </div>
                                <div className="profile-mood-badge">
                                    <MoodBadge moodKey={userProfile?.mood} showText={false} />
                                </div>
                            </div>

                            <div className="profile-stats">
                                <div className="stat-item">
                                    <div className="stat-value">{totalPostsCount}</div>
                                    <div className="stat-label">Insights</div>
                                </div>
                                <div className="stat-item">
                                    <div className="stat-value">{(userProfile.connections?.length || 0) + (userProfile.followingCount || 0)}</div>
                                    <div className="stat-label">Following</div>
                                </div>
                                <div className="stat-item">
                                    <div className="stat-value">{(userProfile.connections?.length || 0) + (userProfile.followersCount || 0)}</div>
                                    <div className="stat-label">Followers</div>
                                </div>
                            </div>
                        </div>

                        {/* Name & Bio Details (Instagram Style) */}
                        <div className="profile-info">
                            <div className="profile-name-row">
                                <h1 className="profile-display-name">@{anonymousHandle}</h1>
                                {userProfile.role === 'expert' && <span className="expert-badge">Expert</span>}
                            </div>
                            
                            {isOwner && (
                                <div className="profile-real-name-row" style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    marginTop: '4px',
                                    marginBottom: '8px',
                                    flexWrap: 'wrap'
                                }}>
                                    <span className="profile-real-name" style={{
                                        fontSize: '14px',
                                        fontWeight: '700',
                                        color: 'var(--color-text-secondary)'
                                    }}>
                                        {userProfile.displayName || 'SoulThread Member'}
                                    </span>
                                    <span className="profile-real-name-note" style={{
                                        fontSize: '11px',
                                        color: 'var(--color-text-muted)',
                                        background: 'var(--color-surface-soft)',
                                        padding: '2px 6px',
                                        borderRadius: '4px',
                                        fontWeight: '500'
                                    }}>
                                        🔒 Only you see your real name
                                    </span>
                                </div>
                            )}
                            
                            <div className="profile-bio">
                                {userProfile.bio || 'SoulThread Member • Exploring the depth of human experience.'}
                            </div>

                            {/* Social Links Section */}
                            <div className="profile-socials">
                                {userProfile.website && (
                                    <a href={userProfile.website.startsWith('http') ? userProfile.website : `https://${userProfile.website}`} target="_blank" rel="noopener noreferrer" className="social-link">
                                        <Link2 size={14} />
                                        {userProfile.website.replace(/^https?:\/\//, '').split('/')[0]}
                                    </a>
                                )}
                                {userProfile.instagram && (
                                    <a href={`https://instagram.com/${userProfile.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="social-link">
                                        <Share2 size={14} />
                                        {userProfile.instagram.startsWith('@') ? userProfile.instagram : `@${userProfile.instagram}`}
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons Row (Instagram Style) */}
                        <div className="profile-actions-row">
                            {isOwner ? (
                                <>
                                    <button onClick={() => setShowEditModal(true)} className="profile-action-btn">Edit Profile</button>
                                    <button onClick={async () => { await logout(); navigate('/'); }} className="profile-action-btn profile-logout-btn">Logout</button>
                                </>
                            ) : (
                                <>
                                    {connectionStatus === 'connected' ? (
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button onClick={() => navigate(`/messages?with=${userProfile.id || userId}&name=${encodeURIComponent(userProfile.displayName || 'User')}`)} className="profile-action-btn profile-action-btn-primary">💬 Message</button>
                                            <button onClick={handleConnectClick} className="profile-action-btn" style={{ fontSize: '12px', padding: '8px 12px', opacity: 0.6 }}>Connected ✓</button>
                                        </div>
                                    ) : connectionStatus === 'received' ? (
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button onClick={() => handleAcceptRequest(userId)} className="profile-action-btn profile-action-btn-primary">✨ Follow back</button>
                                            <button onClick={handleDeclineRequest} className="profile-action-btn" style={{ opacity: 0.6 }}>Decline</button>
                                        </div>
                                    ) : (
                                        <button onClick={handleConnectClick} className={`profile-action-btn ${connectionStatus !== 'pending' ? 'profile-action-btn-primary' : ''}`}>
                                            {connectionStatus === 'pending' ? 'Requested' : 'Connect'}
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="profile-tabs-wrapper">
                    <div className="profile-tabs">
                        {[
                            { id: 'posts', label: 'POSTS', icon: <LayoutGrid size={18} /> },
                            { id: 'saved', label: 'SAVED', icon: <Bookmark size={18} /> },
                            { id: 'series', label: 'SERIES', icon: <BookOpen size={18} /> },
                            { id: 'sessions', label: 'SESSIONS', icon: <span>📅</span> }
                        ].map((tab) => {
                            if ((tab.id === 'saved' || tab.id === 'sessions') && !isOwner) return null;
                            const isActive = activeTab === tab.id;
                            return (
                                <div
                                    key={tab.id}
                                    className={`tab-item ${isActive ? 'active' : ''}`}
                                    onClick={() => setActiveTab(tab.id)}
                                >
                                    {tab.icon}
                                    <span>{tab.label}</span>
                        {isActive && <div className="active-indicator" />}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="profile-content-area">
                    {activeTab === 'sessions' && isOwner && (
                    <MySessions />
                )}

                {activeTab === 'posts' && (
                        <>
                            <div className="view-toggle-bar">
                                <button 
                                    className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`} 
                                    onClick={() => setViewMode('grid')}
                                    title="Grid view"
                                >
                                    <LayoutGrid size={20} />
                                </button>
                                <button 
                                    className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`} 
                                    onClick={() => setViewMode('list')}
                                    title="List view"
                                >
                                    <List size={20} />
                                </button>
                            </div>

                            {postsLoading ? (
                                <div className="profile-posts-skeletons">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="post-skeleton animate-pulse" />
                                    ))}
                                </div>
                            ) : posts.filter(p => p.content?.trim().length > 0).length > 0 ? (
                                <div className={`profile-posts-${viewMode}`}>
                                    {posts
                                        .filter(p => p.content?.trim().length > 0)
                                        .map(p => (
                                        <ProfilePostCard
                                            key={p.id}
                                            post={p}
                                            isOwner={isOwner}
                                            viewMode={viewMode}
                                            onDelete={handleDeletePost}
                                            onNavigate={(id) => navigate(`/post/${id}`)}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-state">
                                    <div className="empty-icon"><PenTool size={48} /></div>
                                    <h3>No Posts Yet</h3>
                                    <p>This soul hasn't shared anything yet.</p>
                                </div>
                            )}
                        </>
                    )}

                    {activeTab === 'saved' && (
                        <div>
                            {postsLoading ? (
                                <div className="profile-posts-skeletons">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="post-skeleton animate-pulse" />
                                    ))}
                                </div>
                            ) : savedPosts.length > 0 ? (
                                <div className={`profile-posts-${viewMode}`}>
                                    {savedPosts.map(p => (
                                        <ProfilePostCard
                                            key={p.id}
                                            post={p}
                                            isOwner={false}
                                            viewMode={viewMode}
                                            onDelete={() => {}}
                                            onNavigate={(id) => navigate(`/post/${id}`)}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-state">
                                    <div className="empty-icon">
                                        <Bookmark size={48} />
                                    </div>
                                    <h3>Nothing saved yet</h3>
                                    <p>Save posts you want to revisit later.</p>
                                    <button onClick={() => navigate('/explore')} className="empty-state-cta">
                                        Browse Stories
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'series' && (
                        <div className="series-section">
                            <div className="series-header">
                                <h4 style={{ fontSize: '18px', fontWeight: '900', margin: '0 0 16px 0' }}>Learning Progress</h4>
                            </div>
                            {(userProfile.seriesProgress && Object.keys(userProfile.seriesProgress).length > 0) ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {Object.entries(userProfile.seriesProgress).map(([seriesId, rawProgress]) => {
                                        const completedDays = typeof rawProgress === 'object' ? (rawProgress.currentPost || 0) : (rawProgress || 0);
                                        const totalDays = typeof rawProgress === 'object' ? (rawProgress.totalPosts || 30) : 30;
                                        const percent = Math.round((completedDays / totalDays) * 100);
                                        const friendlyName = seriesId.replace(/-/g, ' ').toUpperCase();
                                        
                                        return (
                                            <div key={seriesId} className="series-progress-card" style={{
                                                background: 'var(--color-surface)',
                                                border: '1px solid var(--color-border)',
                                                borderRadius: '16px',
                                                padding: '16px'
                                            }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                    <span className="stat-label" style={{ fontWeight: '700', color: 'var(--color-text-primary)' }}>{friendlyName}</span>
                                                    <span style={{ fontWeight: '900', color: 'var(--color-primary)' }}>{percent}%</span>
                                                </div>
                                                <div className="progress-track" style={{
                                                    height: '6px',
                                                    background: 'var(--color-border)',
                                                    borderRadius: '3px',
                                                    overflow: 'hidden'
                                                }}>
                                                    <div className="progress-fill" style={{
                                                        width: `${percent}%`,
                                                        height: '100%',
                                                        background: 'var(--color-primary)'
                                                    }} />
                                                </div>
                                                <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: '700' }}>{completedDays}/{totalDays} Days</span>
                                                    <button onClick={() => navigate(`/${seriesId}-series`)} className="profile-btn-primary" style={{padding:'8px 16px', borderRadius:'12px', fontSize:'12px'}}>Resume</button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="empty-state">
                                    <div className="empty-icon">
                                        <Rocket size={48} />
                                    </div>
                                    <h3>No series started yet</h3>
                                    <p>Embark on mindfulness, neuro-focus, and mental resilience series.</p>
                                    <button onClick={() => navigate('/series')} className="empty-state-cta">
                                        Explore Series
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {showEditModal && (
                    <EditProfileModal
                        userProfile={userProfile}
                        onClose={() => setShowEditModal(false)}
                        onUpdate={(updated) => setUserProfile(prev => ({ ...prev, ...updated }))}
                    />
                )}

                {showConnectModal && (
                    <ConnectModal
                        targetName={userProfile.displayName || 'User'}
                        onConfirm={confirmConnect}
                        onClose={() => setShowConnectModal(false)}
                    />
                )}

                {showHelpModal && (
                    <div className="help-modal-overlay" onClick={() => setShowHelpModal(false)}>
                        <div className="help-modal-content" onClick={e => e.stopPropagation()}>
                            <h3 style={{ color: 'var(--color-primary)', fontWeight: '900' }}>Sanctuary Support</h3>
                            <p style={{ fontSize: '14px', opacity: 0.8, lineHeight: 1.6 }}>We're here to help you navigate this space safely.</p>
                            <div style={{ margin: '24px 0', padding: '20px', background: 'var(--color-surface-soft)', borderRadius: '16px' }}>
                                <div style={{ fontSize: '15px', fontWeight: '800' }}>support@soulthread.in</div>
                                <div style={{ fontSize: '15px', fontWeight: '800', marginTop: '8px' }}>+91 9169658628</div>
                            </div>
                            <button onClick={() => setShowHelpModal(false)} className="profile-btn-primary" style={{ width: '100%' }}>Close</button>
                        </div>
                    </div>
                )}
            </div>
        </DesktopLayoutWrapper>
    );
};

export default Profile;
