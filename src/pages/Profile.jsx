import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import useTheme from '../hooks/useTheme';
import {
    collection, doc, getDoc, getDocs, setDoc, updateDoc,
    addDoc, arrayUnion, arrayRemove, query, where,
    orderBy, limit, deleteDoc, getCountFromServer, onSnapshot,
    serverTimestamp
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

const GridImage = ({ src, content, postStyle, hasMultiple, onClick }) => {
    const [loaded, setLoaded] = useState(false);
    return (
        <div
            onClick={onClick}
            className="grid-item"
            style={{ 
                background: postStyle?.background || 'var(--color-surface-soft)',
                borderRadius: '8px' // Consistent with Profile.css grid-item
            }}
        >
            {src ? (
                <img
                    src={src}
                    alt=""
                    onLoad={() => setLoaded(true)}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        opacity: loaded ? 1 : 0,
                        transition: 'opacity 0.6s ease'
                    }}
                    loading="lazy"
                />
            ) : (
                <div className="grid-text-placeholder" style={{
                    width: '100%',
                    height: '100%',
                    padding: '16px',
                    fontSize: '12px',
                    lineHeight: '1.5',
                    overflow: 'hidden',
                    color: postStyle?.color || 'var(--color-text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    fontFamily: postStyle?.fontFamily || 'var(--font-main)',
                    fontWeight: '700'
                }}>
                    <span className="clamp-5">
                        {content}
                    </span>
                </div>
            )}
            {hasMultiple && (
                <div className="grid-multiple-badge">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z" />
                    </svg>
                </div>
            )}
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
            }, (err) => {
                console.error("Posts listener error:", err);
            });
        };

        fetchProfile();

        // Listen to Replies (Comments by this user)
        const repliesQuery = query(
            collection(db, "comments"),
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
                collection(db, `users/${userId}/savedPosts`),
                orderBy("savedAt", "desc"),
                limit(20)
            );
            unsubSaved = onSnapshot(savedQuery, (snapshot) => {
                setSavedPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
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

            // Connection Status
            if (currentUser.uid !== userId) {
                const isConnected = currentUser.connections?.includes(userId) || userProfile.connections?.includes(currentUser.uid);
                const isSent = currentUser.sentRequests?.includes(userId) || userProfile.pendingRequests?.includes(currentUser.uid);
                const isReceived = currentUser.pendingRequests?.includes(userId);

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
    const handleConnectClick = () => {
        if (!currentUser) return navigate('/login');
        setShowConnectModal(true);
    };

    // Actual Logic
    const confirmConnect = async (note) => {
        if (!currentUser) return;

        // PREVENT DUPLICATE REQUESTS
        if (connectionStatus === 'pending') {
            alert('Connection request already sent. Please wait for their response.');
            setShowConnectModal(false);
            return;
        }

        if (connectionStatus === 'connected') {
            alert('You are already connected with this user.');
            setShowConnectModal(false);
            return;
        }

        try {
            const theirRef = doc(db, 'users', userId);
            const myRef = doc(db, 'users', currentUser.uid);

            await setDoc(theirRef, { pendingRequests: arrayUnion(currentUser.uid) }, { merge: true });
            await setDoc(myRef, { sentRequests: arrayUnion(userId) }, { merge: true });

            const isAnon = currentUser.isIncognito || currentUser.isAnonymous;
            await addDoc(collection(db, 'notifications'), {
                recipientId: userId,
                senderId: currentUser.uid,
                senderName: isAnon ? 'Someone' : (currentUser.displayName || 'Someone'),
                senderPhoto: isAnon ? 'https://api.dicebear.com/7.x/avataaars/svg?seed=anonymous' : currentUser.photoURL,
                type: 'connection_request',
                message: `${isAnon ? 'Someone' : (currentUser.displayName || 'Someone')} wants to connect with you.`,
                note: note || '', // Personal Note
                read: false,
                createdAt: serverTimestamp()
            });

            setConnectionStatus('pending');
        } catch (e) {
            console.error(e);
            alert("Failed to send request.");
        } finally {
            setShowConnectModal(false);
        }
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

    if (loading || !userProfile) return <Skeleton height="300px" />;

    const isOwner = currentUser?.uid === userId;
    const isSuper = currentUser?.role === 'admin' || currentUser?.role === 'psychologist';

    // ABSOLUTE INCOGNITO CHECK: Only Owner or Admin can see an Incognito profile
    const isBlockedByMe = currentUser?.blockedUsers?.includes(userId);
    const hasBlockedMe = userProfile.blockedUsers?.includes(currentUser?.uid);
    // Be careful with isHidden - if it's too aggressive, users might not see their own posts
    const isHidden = (userProfile.isIncognito && (currentUser?.uid !== userId) && !isSuper) || (currentUser && !isSuper && (isBlockedByMe || hasBlockedMe));

    // ANONYMOUS ACCOUNT WALL: Block all visitors except the owner and admins
    if (userProfile.isAnonymous && !isOwner && !isSuper) {
        return (
            <div className="container" style={{ textAlign: 'center', padding: '100px 20px' }}>
                <div style={{ fontSize: '48px', marginBottom: '20px' }}>
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-secondary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
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
                maxWidth: 'var(--app-max-width)',
                background: 'var(--color-surface)'
            }}>
                <Breadcrumbs />
                {/* PREMIUM PROFILE HEADER */}
                <div className="profile-hero-container">
                    <div className="profile-hero"></div>

                    <div className="profile-header-content">
                        <div className="profile-avatar-row">
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

                            <div className="profile-actions">
                                {isOwner ? (
                                    <>
                                        <button onClick={() => setShowEditModal(true)} className="profile-btn">Edit Profile</button>
                                        <button onClick={async () => { await logout(); navigate('/'); }} className="profile-btn" style={{ opacity: 0.7 }}>Logout</button>
                                    </>
                                ) : (
                                    <>
                                        {connectionStatus === 'connected' ? (
                                            <button onClick={() => navigate(`/messages?chat=${userId}`)} className="profile-btn profile-btn-primary">Message</button>
                                        ) : (
                                            <button onClick={handleConnectClick} className={`profile-btn ${connectionStatus !== 'pending' ? 'profile-btn-primary' : ''}`}>
                                                {connectionStatus === 'pending' ? 'Request Sent' : 'Connect'}
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="profile-info">
                            <div className="profile-name-row">
                                <h1 className="profile-display-name">{userProfile.displayName || 'SoulThread Member'}</h1>
                                {userProfile.role === 'expert' && <span className="expert-badge">Expert</span>}
                            </div>
                            <div className="profile-username">@{userProfile.username || 'soul'}</div>
                            
                            <div className="profile-bio">
                                {userProfile.bio || 'SoulThread Member • Exploring the depth of human experience.'}
                            </div>

                            <div className="profile-stats">
                                <div className="stat-item">
                                    <div className="stat-value">{totalPostsCount}</div>
                                    <div className="stat-label">Insights</div>
                                </div>
                                <div className="stat-item" onClick={() => navigate(`/connections/${userId}?tab=following`)} style={{ cursor: 'pointer' }}>
                                    <div className="stat-value">{userProfile.followingCount || 0}</div>
                                    <div className="stat-label">Following</div>
                                </div>
                                <div className="stat-item" onClick={() => navigate(`/connections/${userId}?tab=followers`)} style={{ cursor: 'pointer' }}>
                                    <div className="stat-value">{userProfile.followersCount || 0}</div>
                                    <div className="stat-label">Followers</div>
                                </div>
                            </div>

                            {/* Social Links Section */}
                            <div className="profile-socials">
                                {userProfile.website && (
                                    <a href={userProfile.website.startsWith('http') ? userProfile.website : `https://${userProfile.website}`} target="_blank" rel="noopener noreferrer" className="social-link">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
                                        {userProfile.website.replace(/^https?:\/\//, '').split('/')[0]}
                                    </a>
                                )}
                                {userProfile.instagram && (
                                    <a href={`https://instagram.com/${userProfile.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="social-link">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
                                        {userProfile.instagram.startsWith('@') ? userProfile.instagram : `@${userProfile.instagram}`}
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="profile-tabs-wrapper">
                    <div className="profile-tabs">
                        {['POSTS', 'SAVED', 'SERIES'].map((tab) => {
                            const id = tab.toLowerCase();
                            if (id === 'saved' && !isOwner) return null;
                            const isActive = activeTab === id;
                            return (
                                <div
                                    key={id}
                                    className={`tab-item ${isActive ? 'active' : ''}`}
                                    onClick={() => setActiveTab(id)}
                                >
                                    <span>{tab}</span>
                                    {isActive && <div className="active-indicator" />}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="profile-content-area">
                    {activeTab === 'posts' && (
                        <>
                            <div className="view-toggle-bar">
                                <button 
                                    className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`} 
                                    onClick={() => setViewMode('grid')}
                                    title="Grid view"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
                                </button>
                                <button 
                                    className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`} 
                                    onClick={() => setViewMode('list')}
                                    title="List view"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>
                                </button>
                            </div>

                            {/* ── LIST VIEW ── */}
                            {viewMode === 'list' && (
                                <div className="profile-list">
                                    {posts.length > 0 ? (
                                        posts.map(p => {
                                            // Detect text-only Kafka-style posts and render beautifully
                                            const isTextPost = !p.mediaItems || p.mediaItems.length === 0;
                                            const lines = (p.content || '').split('\n');
                                            const numberLine = lines[lines.length - 1]?.trim();
                                            const isNumbered = /^\d+\/\d+$/.test(numberLine);
                                            const bodyLines = isNumbered ? lines.slice(0, -1) : lines;

                                            if (isTextPost) {
                                                return (
                                                    <div 
                                                        key={p.id} 
                                                        className="kafka-post"
                                                        style={{ background: p.style?.background || '#000', color: p.style?.color || '#fff' }}
                                                        onClick={() => navigate(`/post/${p.id}`)}
                                                    >
                                                        {/* Author row */}
                                                        <div className="kafka-author-row">
                                                            <div className="kafka-avatar">
                                                                <img 
                                                                    src={p.authorPhoto || `https://api.dicebear.com/7.x/personas/svg?seed=${p.authorId}`} 
                                                                    alt="" 
                                                                    style={{width:'100%', height:'100%', objectFit:'cover'}} 
                                                                />
                                                            </div>
                                                            <div style={{fontWeight:'800', fontSize:'13px', letterSpacing:'0.1em'}}>{p.authorName?.toUpperCase()}</div>
                                                        </div>
                                                        {/* Post body */}
                                                        <div className="kafka-body">
                                                            {bodyLines.map((line, i) => (
                                                                line.trim() === ''
                                                                    ? <br key={i} />
                                                                    : <div key={i} style={{ marginBottom: '8px' }}>{line}</div>
                                                            ))}
                                                        </div>
                                                        {/* Number badge */}
                                                        {isNumbered && <div style={{marginTop:'24px', opacity:0.4, fontWeight:'900', fontSize:'11px'}}>INSIGHT {numberLine}</div>}
                                                    </div>
                                                );
                                            }

                                            // Media/regular posts → use FeedItem
                                            return (
                                                <FeedItem
                                                    key={p.id}
                                                    post={p}
                                                    currentUser={currentUser}
                                                />
                                            );
                                        })
                                    ) : (
                                        <div className="empty-state">
                                            <div className="empty-icon">✍️</div>
                                            <h3>No Posts Yet</h3>
                                            <p>This soul hasn't shared anything yet.</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ── GRID VIEW ── */}
                            {viewMode === 'grid' && (
                                <div className="profile-grid">
                                    {posts.length > 0 ? (
                                        posts.map(p => (
                                            <GridImage
                                                key={p.id}
                                                src={p.mediaItems?.[0]?.url}
                                                content={p.content}
                                                postStyle={p.style}
                                                hasMultiple={p.mediaItems?.length > 1}
                                                onClick={() => navigate(`/post/${p.id}`)}
                                            />
                                        ))
                                    ) : (
                                        <div className="empty-state">
                                            <div className="empty-icon">📸</div>
                                            <h3>No Visuals Yet</h3>
                                            <p>When you share photos, they will appear here.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}

                    {activeTab === 'saved' && (
                        <div className="profile-grid">
                            {savedPosts.length > 0 ? (
                                savedPosts.map(p => (
                                    <GridImage
                                        key={p.id}
                                        src={p.mediaItems?.[0]?.url}
                                        content={p.content}
                                        hasMultiple={p.mediaItems?.length > 1}
                                        onClick={() => navigate(`/post/${p.id}`)}
                                    />
                                ))
                            ) : (
                                <div className="empty-state">
                                    <div className="empty-icon">🔖</div>
                                    <h3>Nothing Saved</h3>
                                    <p>Save posts you want to revisit later.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'series' && (
                        <div className="series-section">
                            <div className="series-header">
                                <h4 style={{ fontSize: '18px', fontWeight: '900', margin: 0 }}>Learning Progress</h4>
                                {isOwner && (
                                    <button onClick={() => navigate('/explore')} className="profile-btn" style={{padding:'8px 16px'}}>Browse Library</button>
                                )}
                            </div>
                            {(userProfile.seriesProgress && Object.keys(userProfile.seriesProgress).length > 0) ? (
                                Object.entries(userProfile.seriesProgress).map(([seriesId, rawProgress]) => {
                                    const completedDays = typeof rawProgress === 'object' ? (rawProgress.currentPost || 0) : (rawProgress || 0);
                                    const totalDays = typeof rawProgress === 'object' ? (rawProgress.totalPosts || 30) : 30;
                                    const percent = Math.round((completedDays / totalDays) * 100);
                                    const friendlyName = seriesId.replace(/-/g, ' ').toUpperCase();
                                    
                                    return (
                                        <div key={seriesId} className="series-progress-card">
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                <span className="stat-label">{friendlyName}</span>
                                                <span style={{ fontWeight: '900', color: 'var(--color-primary)' }}>{percent}%</span>
                                            </div>
                                            <div className="progress-track">
                                                <div className="progress-fill" style={{ width: `${percent}%` }} />
                                            </div>
                                            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: '700' }}>{completedDays}/{totalDays} Days</span>
                                                <button onClick={() => navigate(`/${seriesId}-series`)} className="profile-btn-primary" style={{padding:'8px 16px', borderRadius:'12px', fontSize:'12px'}}>Resume</button>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="empty-state">
                                    <div className="empty-icon">🚀</div>
                                    <h3>Start Your Journey</h3>
                                    <button onClick={() => navigate('/explore')} className="profile-btn-primary" style={{marginTop:'16px'}}>Explore Series</button>
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
