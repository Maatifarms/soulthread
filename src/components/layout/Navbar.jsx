import React from 'react';
window.__SOULTHREAD_VERSION__ = '2026-03-07-V6';

import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import useTheme from '../../hooks/useTheme';
import {
    collection, query, where, onSnapshot, orderBy, limit,
    doc, updateDoc, addDoc, serverTimestamp
} from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Capacitor } from '@capacitor/core';

const Navbar = () => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const { isDarkMode, toggleTheme } = useTheme();
    const location = useLocation();
    const isNativeApp = Capacitor.isNativePlatform();

    const [notifications, setNotifications] = React.useState([]);
    const [unreadCount, setUnreadCount] = React.useState(0);
    const [unreadMessageCount, setUnreadMessageCount] = React.useState(0);
    const [showNotifs, setShowNotifs] = React.useState(false);
    const [showBreathe, setShowBreathe] = React.useState(false);
    const [breathePhase, setBreathePhase] = React.useState('Ready');
    const [showUserMenu, setShowUserMenu] = React.useState(false);
    const notifRef = React.useRef(null);
    const userMenuRef = React.useRef(null);

    const [toast, setToast] = React.useState(null);
    const [isInitialLoad, setIsInitialLoad] = React.useState(true);

    // BREATHE LOGIC
    React.useEffect(() => {
        let timer;
        if (showBreathe) {
            const phases = ['Inhale...', 'Hold...', 'Exhale...', 'Hold...'];
            let i = 0;
            setBreathePhase(phases[0]);
            timer = setInterval(() => {
                i = (i + 1) % phases.length;
                setBreathePhase(phases[i]);
            }, 4000);
        }
        return () => clearInterval(timer);
    }, [showBreathe]);

    // CLICK OUTSIDE
    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (notifRef.current && !notifRef.current.contains(event.target)) setShowNotifs(false);
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) setShowUserMenu(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // NOTIFICATIONS
    React.useEffect(() => {
        if (!currentUser) return;

        const q = query(
            collection(db, 'notifications'),
            where('recipientId', '==', currentUser.uid),
            orderBy('createdAt', 'desc'),
            limit(20)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added' && !isInitialLoad) {
                    const data = change.doc.data();
                    if (!data.read) {
                        setToast({ id: change.doc.id, title: data.type === 'message' ? 'New Message' : 'New Notification', message: data.message, type: data.type });
                        setTimeout(() => setToast(null), 4000);
                    }
                }
            });
            const notifs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            setNotifications(notifs);
            setUnreadCount(notifs.filter(n => !n.read).length);
            setIsInitialLoad(false);
        });

        const qMessages = query(collection(db, 'conversations'), where('participants', 'array-contains', currentUser.uid), where('read', '==', false));
        const unsubscribeMessages = onSnapshot(qMessages, (snapshot) => {
            setUnreadMessageCount(snapshot.docs.filter(d => d.data().lastMessageSenderId !== currentUser.uid).length);
        });

        return () => { unsubscribe(); unsubscribeMessages(); };
    }, [currentUser]);

    const handleRead = async (notif) => {
        try {
            await updateDoc(doc(db, 'notifications', notif.id), { read: true });
            if (['new_post', 'like', 'comment', 'post_reaction', 'post_comment'].includes(notif.type)) {
                navigate(notif.postId ? `/post/${notif.postId}` : `/profile/${notif.senderId}`);
            } else if (['connection_request', 'connection_accepted'].includes(notif.type)) {
                navigate(`/profile/${notif.senderId}`);
            } else if (notif.type === 'message') {
                navigate(`/messages${notif.chatId ? `?chat=${notif.chatId}` : ''}`);
            }
            setShowNotifs(false);
        } catch (error) { console.error(error); }
    };

    const handleAcceptRequest = async (e, notif) => {
        e.stopPropagation();
        try {
            const { arrayUnion } = await import('firebase/firestore');
            await updateDoc(doc(db, 'users', currentUser.uid), { connections: arrayUnion(notif.senderId) });
            await updateDoc(doc(db, 'users', notif.senderId), { connections: arrayUnion(currentUser.uid) });
            const isAnon = currentUser.isIncognito || currentUser.isAnonymous;
            await addDoc(collection(db, 'notifications'), {
                recipientId: notif.senderId,
                senderId: currentUser.uid,
                senderName: isAnon ? 'Someone' : (currentUser.displayName || 'Someone'),
                type: 'connection_accepted',
                message: `${isAnon ? 'Someone' : (currentUser.displayName || 'Someone')} accepted your connection request.`,
                read: false,
                createdAt: serverTimestamp()
            });
            await updateDoc(doc(db, 'notifications', notif.id), { read: true });
            alert(`Connected!`);
        } catch (error) { console.error(error); }
    };

    const handleLogout = async () => {
        try { await logout(); navigate('/'); setShowUserMenu(false); } catch (error) { console.error(error); }
    };

    const isActive = (path) => {
        if (path === '/') return location.pathname === '/' || location.pathname === '/feed';
        return location.pathname.startsWith(path);
    };

    const NavLink = ({ to, label, badge }) => {
        const active = isActive(to);
        return (
            <Link to={to} style={{
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 12px',
                borderRadius: '999px',
                fontWeight: active ? '700' : '600',
                fontSize: '14px',
                color: active ? 'var(--color-primary-dark)' : 'var(--color-text-secondary)',
                background: active ? 'var(--color-primary-soft)' : 'transparent',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
            }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'var(--color-surface-2)'; e.currentTarget.style.color = 'var(--color-text-primary)'; } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-text-secondary)'; } }}
            >
                {label}
                {badge > 0 && (
                    <span style={{
                        background: '#ff3b30', color: 'white', borderRadius: '10px',
                        minWidth: '16px', height: '16px', fontSize: '10px', fontWeight: '800',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        padding: '0 4px', lineHeight: 1,
                    }}>{badge > 9 ? '9+' : badge}</span>
                )}
            </Link>
        );
    };

    // Mobile bottom tab
    const TabItem = ({ to, label, badge, outlineIcon, filledIcon, highlightPath }) => {
        const active = isActive(highlightPath || to);
        return (
            <Link to={to} style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: '2px', padding: '8px 0 4px', textDecoration: 'none', position: 'relative',
                WebkitTapHighlightColor: 'transparent', transition: 'transform 0.15s ease',
            }}>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" style={{
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        fill: active ? 'var(--color-primary)' : 'none',
                        stroke: active ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                        strokeWidth: active ? '2.5' : '2',
                        transform: active ? 'scale(1.1) translateY(-2px)' : 'scale(1)',
                    }} strokeLinecap="round" strokeLinejoin="round">
                        {active ? filledIcon : outlineIcon}
                    </svg>
                    {badge > 0 && (
                        <span style={{
                            position: 'absolute', top: '-6px', right: '-10px',
                            background: '#ff3b30', color: 'white', borderRadius: '10px',
                            minWidth: '18px', height: '18px', fontSize: '11px', fontWeight: '800',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            padding: '0 4px', border: '2px solid var(--color-surface)',
                            animation: 'popIn 0.3s ease', zIndex: 2,
                        }}>{badge > 9 ? '9+' : badge}</span>
                    )}
                </div>
                <span style={{
                    fontSize: '10px', fontWeight: active ? '700' : '500',
                    color: active ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                    fontFamily: 'Outfit, sans-serif', transition: 'all 0.3s ease', marginTop: '2px',
                }}>{label}</span>
                <div style={{
                    position: 'absolute', bottom: '4px', width: '4px', height: '4px', borderRadius: '50%',
                    background: 'var(--color-primary)', transition: 'all 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28)',
                    opacity: active ? 1 : 0, transform: active ? 'scale(1)' : 'scale(0)',
                    boxShadow: '0 0 8px var(--color-primary)',
                }} />
            </Link>
        );
    };

    const avatarLetter = currentUser?.displayName ? currentUser.displayName.charAt(0).toUpperCase() : (currentUser?.email ? currentUser.email.charAt(0).toUpperCase() : 'U');

    return (
        <>
            {/* ── TOP NAVBAR ── */}
            {(true) && (
                <nav style={{
                    height: isNativeApp ? 'calc(72px + env(safe-area-inset-top, 0px))' : '72px',
                    paddingTop: isNativeApp ? 'env(safe-area-inset-top, 0px)' : '0',
                    display: 'flex', alignItems: 'center',
                    background: 'var(--color-surface)',
                    borderBottom: '1px solid var(--color-border)',
                    position: 'sticky', top: 0, zIndex: 1000, width: '100%',
                    boxShadow: 'var(--shadow-sm)',
                }}>
                    <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        height: '100%', padding: '0 24px', width: '100%', maxWidth: '1280px', margin: '0 auto',
                    }}>
                        {/* Logo */}
                        <Link to="/" style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '14px',
                            textDecoration: 'none',
                            transition: 'var(--transition-fast)',
                        }}>
                            <div style={{
                                width: '40px', height: '40px', borderRadius: '12px',
                                background: 'var(--grad-main)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: 'var(--shadow-glow)',
                                transform: 'rotate(-4deg)',
                            }}>
                                <span style={{ color: 'white', fontWeight: '900', fontSize: '20px' }}>S</span>
                            </div>
                            <span style={{
                                fontWeight: '900',
                                fontSize: '24px',
                                letterSpacing: '-0.04em',
                                color: 'var(--color-text-primary)',
                                fontFamily: 'var(--font-display)'
                            }}>SoulThread</span>
                        </Link>

                        {/* Desktop Navigation Links — Left of center */}
                        <div className="hide-mobile" style={{ display: 'flex', gap: '4px', marginLeft: '32px' }}>
                            <NavLink to="/" label="Home" />
                            <NavLink to="/series" label="Series" />
                            <NavLink to="/about" label="About" />
                            <NavLink to="/messages" label="Chat" badge={unreadMessageCount} />
                            <NavLink to="/crisis" label="Crisis" />
                        </div>

                        {/* Desktop Explore Search Bar — Center */}
                        <div className="hide-mobile" style={{ flex: 1, maxWidth: '440px', margin: '0 32px' }}>
                            <div style={{ position: 'relative', width: '100%' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-secondary)" strokeWidth="2.5" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5, transition: 'all 0.3s' }} id="nav-search-icon">
                                    <circle cx="11" cy="11" r="8"></circle>
                                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Explore threads..."
                                    style={{
                                        width: '100%',
                                        padding: '12px 24px 12px 48px',
                                        borderRadius: '16px',
                                        border: '1.5px solid var(--color-border)',
                                        background: 'var(--color-surface-2)',
                                        color: 'var(--color-text-primary)',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        fontFamily: 'Outfit, sans-serif',
                                        outline: 'none',
                                        transition: 'all 0.4s var(--transition-normal)',
                                        boxShadow: 'var(--shadow-inset)'
                                    }}
                                    onFocus={(e) => {
                                        e.currentTarget.style.borderColor = 'var(--color-primary)';
                                        e.currentTarget.style.background = 'var(--color-surface)';
                                        e.currentTarget.style.boxShadow = 'var(--shadow-glow)';
                                        document.getElementById('nav-search-icon').style.opacity = '1';
                                        document.getElementById('nav-search-icon').style.stroke = 'var(--color-primary)';
                                        if (location.pathname !== '/explore') navigate('/explore');
                                    }}
                                    onBlur={(e) => { 
                                        e.currentTarget.style.borderColor = 'var(--color-border)'; 
                                        e.currentTarget.style.background = 'var(--color-surface-2)';
                                        e.currentTarget.style.boxShadow = 'var(--shadow-inset)'; 
                                        document.getElementById('nav-search-icon').style.opacity = '0.5';
                                        document.getElementById('nav-search-icon').style.stroke = 'var(--color-text-secondary)';
                                    }}
                                    onClick={() => { if (location.pathname !== '/explore') navigate('/explore'); }}
                                />
                            </div>
                        </div>

                        {/* Right side */}
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
                            {/* Breathe */}
                            <button
                                onClick={() => setShowBreathe(true)}
                                style={{
                                    background: 'rgba(var(--color-primary-rgb), 0.1)',
                                    border: '1px solid var(--color-primary-soft)',
                                    cursor: 'pointer',
                                    padding: '7px 14px',
                                    borderRadius: '20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    color: 'var(--color-primary-dark)',
                                    fontWeight: '700',
                                    fontSize: '13px',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    boxShadow: 'var(--shadow-sm)'
                                }}
                                className="hide-mobile"
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(61,139,127,0.18)'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(61,139,127,0.1)'; }}
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" />
                                </svg>
                                Breathe
                            </button>

                            {/* Premium Theme Toggle */}
                            <button
                                onClick={toggleTheme}
                                aria-label="Toggle Theme"
                                style={{
                                    width: '42px', height: '42px', borderRadius: '50%',
                                    background: 'var(--color-surface-2)', border: '1px solid var(--color-border)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer', transition: 'all 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28)',
                                    boxShadow: 'var(--shadow-premium)',
                                    position: 'relative', overflow: 'hidden'
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.transform = 'rotate(15deg) scale(1.1)';
                                    e.currentTarget.style.borderColor = 'var(--color-primary-light)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.transform = 'rotate(0) scale(1)';
                                    e.currentTarget.style.borderColor = 'var(--color-border)';
                                }}
                            >
                                <div style={{
                                    transform: isDarkMode ? 'translateY(0)' : 'translateY(100%)',
                                    opacity: isDarkMode ? 1 : 0,
                                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                    position: 'absolute'
                                }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FDB813" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                                    </svg>
                                </div>
                                <div style={{
                                    transform: isDarkMode ? 'translateY(-100%)' : 'translateY(0)',
                                    opacity: isDarkMode ? 0 : 1,
                                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                    position: 'absolute'
                                }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3D8B7F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                                    </svg>
                                </div>
                            </button>

                            {/* Notifications */}
                            {currentUser && (
                                <div style={{ position: 'relative' }} ref={notifRef}>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowNotifs(!showNotifs);
                                        }}
                                        style={{
                                            position: 'relative',
                                            width: '42px',
                                            height: '42px',
                                            borderRadius: '50%',
                                            border: '1px solid var(--color-border)',
                                            background: showNotifs ? 'var(--color-primary-soft)' : 'rgba(var(--color-surface-rgb), 0.6)',
                                            backdropFilter: 'blur(10px)',
                                            WebkitBackdropFilter: 'blur(10px)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                            color: showNotifs ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                                            boxShadow: showNotifs ? '0 0 0 4px var(--color-primary-soft)' : 'var(--shadow-xs)',
                                        }}
                                        onMouseEnter={e => {
                                            if (!showNotifs) {
                                                e.currentTarget.style.transform = 'translateY(-1px)';
                                                e.currentTarget.style.background = 'var(--color-surface-2)';
                                                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                                            }
                                        }}
                                        onMouseLeave={e => {
                                            if (!showNotifs) {
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.background = 'rgba(var(--color-surface-rgb), 0.6)';
                                                e.currentTarget.style.boxShadow = 'var(--shadow-xs)';
                                            }
                                        }}
                                        aria-label="Notifications"
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: showNotifs ? 'var(--color-primary)' : 'var(--color-text-primary)' }}>
                                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                                            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                                        </svg>
                                        {unreadCount > 0 && (
                                            <span style={{
                                                position: 'absolute',
                                                top: '8px',
                                                right: '8px',
                                                width: '10px',
                                                height: '10px',
                                                background: '#ff3b30',
                                                borderRadius: '50%',
                                                border: '2px solid var(--color-surface)',
                                                animation: 'pulse-slow 2s infinite'
                                            }} />
                                        )}
                                    </button>

                                    {showNotifs && (
                                        <div style={{
                                            position: 'absolute', top: '50px', right: 0,
                                            width: 'min(360px, 92vw)', background: 'var(--color-surface)',
                                            boxShadow: 'var(--shadow-2xl)', borderRadius: '24px',
                                            border: '1px solid var(--color-border)', zIndex: 10000,
                                            maxHeight: '480px', overflowY: 'auto', animation: 'popIn 0.25s cubic-bezier(0.18, 0.89, 0.32, 1.28)',
                                        }}>
                                            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '800' }}>Notifications {unreadCount > 0 && <span style={{ fontSize: '12px', background: '#ff3b30', color: 'white', borderRadius: '6px', padding: '1px 7px', marginLeft: '6px' }}>{unreadCount}</span>}</h4>
                                                <button onClick={() => setShowNotifs(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: '18px', lineHeight: 1 }}>✕</button>
                                            </div>
                                            {notifications.length === 0
                                                ? <div style={{ padding: '36px 20px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '14px' }}>
                                                    <div style={{ fontSize: '28px', marginBottom: '8px' }}>🔔</div>All is quiet
                                                </div>
                                                : notifications.map(n => (
                                                    <div key={n.id} onClick={() => handleRead(n)} style={{
                                                        padding: '14px 18px', borderBottom: '1px solid var(--color-divider)',
                                                        background: n.read ? 'transparent' : 'rgba(61,139,127,0.05)',
                                                        cursor: 'pointer', display: 'flex', gap: '12px', alignItems: 'flex-start',
                                                        transition: 'background 0.15s',
                                                    }}
                                                        onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-2)'}
                                                        onMouseLeave={e => e.currentTarget.style.background = n.read ? 'transparent' : 'rgba(61,139,127,0.05)'}
                                                    >
                                                        <div style={{
                                                            width: '38px', height: '38px', borderRadius: '50%', flexShrink: 0,
                                                            background: 'linear-gradient(135deg, var(--color-primary-soft), var(--color-primary-light))',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            fontWeight: '800', color: 'var(--color-primary-dark)', fontSize: '14px',
                                                        }}>{n.senderName ? n.senderName.charAt(0) : 'S'}</div>
                                                        <div style={{ flex: 1, minWidth: 0 }}>
                                                            <div style={{ fontSize: '13px', fontWeight: n.read ? '500' : '700', color: 'var(--color-text-primary)', lineHeight: '1.4' }}>{n.message}</div>
                                                            {n.type === 'connection_request' && !n.read && (
                                                                <button onClick={(e) => handleAcceptRequest(e, n)} style={{
                                                                    marginTop: '8px', background: 'var(--color-primary)', color: 'white',
                                                                    border: 'none', borderRadius: '20px', padding: '5px 16px',
                                                                    fontWeight: '700', fontSize: '12px', cursor: 'pointer',
                                                                }}>Accept</button>
                                                            )}
                                                        </div>
                                                        {!n.read && <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--color-primary)', marginTop: '5px', flexShrink: 0 }} />}
                                                    </div>
                                                ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* User avatar / menu */}
                            {currentUser ? (
                                <div style={{ position: 'relative' }} ref={userMenuRef} className="hide-mobile">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowUserMenu(!showUserMenu);
                                        }}
                                        style={{
                                            width: '42px',
                                            height: '42px',
                                            borderRadius: '50%',
                                            border: '1px solid var(--color-border)',
                                            overflow: 'hidden',
                                            cursor: 'pointer',
                                            background: showUserMenu ? 'var(--color-primary-soft)' : 'rgba(var(--color-surface-rgb), 0.6)',
                                            backdropFilter: 'blur(10px)',
                                            WebkitBackdropFilter: 'blur(10px)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            padding: 0,
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                            boxShadow: showUserMenu ? '0 0 0 4px var(--color-primary-soft)' : 'var(--shadow-xs)',
                                        }}
                                        onMouseEnter={e => {
                                            if (!showUserMenu) {
                                                e.currentTarget.style.transform = 'translateY(-1px)';
                                                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                                            }
                                        }}
                                        onMouseLeave={e => {
                                            if (!showUserMenu) {
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.boxShadow = 'var(--shadow-xs)';
                                            }
                                        }}
                                        aria-label="Profile menu"
                                    >
                                        {currentUser.photoURL
                                            ? <img src={currentUser.photoURL} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            : <div style={{
                                                width: '100%',
                                                height: '100%',
                                                background: 'linear-gradient(135deg, var(--color-primary-soft), var(--color-primary-light))',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontWeight: '800',
                                                color: 'var(--color-primary-dark)',
                                                fontSize: '15px'
                                            }}>{avatarLetter}</div>}
                                    </button>
                                    {showUserMenu && (
                                        <div style={{
                                            position: 'absolute', top: '44px', right: 0, width: '200px',
                                            background: 'var(--color-surface)', boxShadow: '0 8px 40px rgba(0,0,0,0.15)',
                                            borderRadius: '16px', border: '1px solid var(--color-border)',
                                            zIndex: 2000, overflow: 'hidden', animation: 'popIn 0.2s ease',
                                        }}>
                                            <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--color-border)' }}>
                                                <div style={{ fontWeight: '800', fontSize: '14px', color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentUser.displayName || 'Your Profile'}</div>
                                                <div style={{ fontWeight: '500', fontSize: '12px', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentUser.email || ''}</div>
                                            </div>
                                            {[
                                                { to: `/profile/${currentUser.uid}`, label: 'My Profile' },
                                                { to: '/pricing', label: 'Subscription' },
                                                { to: '/settings', label: 'Settings' },
                                                ...(currentUser?.role === 'admin' ? [{ to: '/admin', label: 'Admin Panel' }] : []),
                                                ...(currentUser?.role === 'psychologist' ? [{ to: '/counselor-dashboard', label: 'Counselor Panel' }] : []),
                                            ].map(item => (
                                                <Link key={item.to} to={item.to} onClick={() => setShowUserMenu(false)} style={{
                                                    display: 'block', padding: '11px 16px', fontSize: '14px', fontWeight: '600',
                                                    color: 'var(--color-text-primary)', textDecoration: 'none', transition: 'background 0.15s',
                                                }}
                                                    onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-2)'}
                                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                                >{item.label}</Link>
                                            ))}
                                            <button onClick={handleLogout} style={{
                                                display: 'block', width: '100%', textAlign: 'left', padding: '11px 16px',
                                                fontSize: '14px', fontWeight: '700', color: '#ef4444', background: 'none',
                                                border: 'none', cursor: 'pointer', borderTop: '1px solid var(--color-border)', transition: 'background 0.15s',
                                            }}
                                                onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'none'}
                                            >Log Out</button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="hide-mobile" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    {!isNativeApp && (
                                        <a href="/download/soulthread.apk" download="SoulThread.apk" style={{
                                            display: 'inline-flex', alignItems: 'center', gap: '5px',
                                            color: 'var(--color-text-secondary)', fontWeight: '600', fontSize: '13px',
                                            background: 'var(--color-surface-2)', padding: '7px 14px', borderRadius: '20px',
                                            textDecoration: 'none', border: '1px solid var(--color-border)', transition: 'all 0.2s',
                                        }}>
                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                                            </svg>
                                            App
                                        </a>
                                    )}
                                    <Link to="/login" style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                                        background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
                                        color: 'white', padding: '8px 20px', borderRadius: '20px', fontWeight: '700',
                                        fontSize: '14px', textDecoration: 'none', boxShadow: '0 4px 12px rgba(61,139,127,0.3)',
                                        transition: 'all 0.2s',
                                    }}
                                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(61,139,127,0.4)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(61,139,127,0.3)'; }}
                                    >
                                        Enter Sanctuary
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </nav>
            )}

            {/* ── BREATHE OVERLAY ── */}
            {showBreathe && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: isDarkMode ? 'rgba(10,22,20,0.97)' : 'rgba(255,255,255,0.97)',
                    backdropFilter: 'blur(24px)', zIndex: 3000,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                }}>
                    <button onClick={() => setShowBreathe(false)} style={{
                        position: 'absolute', top: '30px', right: '30px', border: 'none',
                        fontSize: '15px', fontWeight: '700', cursor: 'pointer', color: 'var(--color-text-primary)',
                        padding: '8px 16px', borderRadius: '20px', background: 'var(--color-surface-2)',
                    }}>✕ Close</button>
                    <div style={{
                        width: '200px', height: '200px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--color-primary-light), var(--color-primary))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '22px', fontWeight: '700', color: 'white',
                        animation: 'breathing-pulse 4s ease-in-out infinite',
                        boxShadow: '0 0 60px rgba(77,139,129,0.4)',
                    }}>{breathePhase}</div>
                    <p style={{ marginTop: '40px', fontSize: '18px', textAlign: 'center', color: 'var(--color-text-secondary)', lineHeight: '1.6', maxWidth: '280px' }}>
                        Slow down. Follow the pulse.<br />You are safe. You are here.
                    </p>
                </div>
            )}

            {/* ── MOBILE BOTTOM TAB BAR ── */}
            <div className="mobile-bottom-nav" style={{
                position: 'fixed', bottom: 0, left: 0, right: 0, display: 'none',
                alignItems: 'flex-start', paddingTop: '6px',
                paddingBottom: 'env(safe-area-inset-bottom, 0px)',
                background: isDarkMode ? '#0d0e12' : '#ffffff',
                borderTop: '1.5px solid var(--color-border)',
                zIndex: 1000, minHeight: '60px',
            }}>
                {currentUser ? (
                    <>
                        <TabItem to="/" label="Home"
                            outlineIcon={<><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></>}
                            filledIcon={<><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill="var(--color-primary)" stroke="none" /><polyline points="9 22 9 12 15 12 15 22" stroke="white" strokeWidth="1.5" /></>}
                        />
                        <TabItem to="/explore" label="Explore"
                            outlineIcon={<><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></>}
                            filledIcon={<><circle cx="11" cy="11" r="8" fill="var(--color-primary-soft)" stroke="var(--color-primary)" strokeWidth="3" /><path d="m21 21-4.3-4.3" stroke="var(--color-primary)" strokeWidth="3" /></>}
                        />
                        <TabItem to="/series" label="Series"
                            outlineIcon={<><path d="M12 2L2 7l10 5 10-5-10-5zM2 12l10 5 10-5M2 17l10 5 10-5" /></>}
                            filledIcon={<><path d="M12 2L2 7l10 5 10-5-10-5z" fill="var(--color-primary)" stroke="none" /><path d="M2 12l10 5 10-5M2 17l10 5 10-5" stroke="var(--color-primary)" strokeWidth="2.5" /></>}
                        />
                        <TabItem to="/messages" label="Chat" badge={unreadMessageCount}
                            outlineIcon={<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />}
                            filledIcon={<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" fill="var(--color-primary)" stroke="none" />}
                        />
                        <TabItem to="/crisis" label="Crisis"
                            outlineIcon={<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />}
                            filledIcon={<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill="var(--color-primary)" stroke="none" />}
                        />
                        <TabItem to={`/profile/${currentUser.uid}`} label="Profile" highlightPath="/profile"
                            outlineIcon={<><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>}
                            filledIcon={<><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" fill="var(--color-primary)" stroke="none" /><circle cx="12" cy="7" r="4" fill="var(--color-primary)" stroke="none" /></>}
                        />
                    </>
                ) : (
                    <Link to="/login" style={{
                        margin: 'auto', padding: '10px 30px', borderRadius: '30px', fontSize: '15px',
                        fontWeight: '700', textDecoration: 'none', color: 'white',
                        background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
                    }}>Enter Sanctuary</Link>
                )}
            </div>

            {/* ── TOAST ── */}
            {toast && (
                <div onClick={() => { if (toast.type === 'message') navigate('/messages'); else setShowNotifs(true); setToast(null); }}
                    style={{
                        position: 'fixed', top: '72px', left: '50%', transform: 'translateX(-50%)',
                        width: 'min(360px, 94vw)', background: 'var(--color-surface)',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.15)', border: '1px solid var(--color-primary-light)',
                        borderRadius: '16px', padding: '12px 16px', zIndex: 10000,
                        display: 'flex', alignItems: 'center', gap: '12px',
                        animation: 'popDown 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28)', cursor: 'pointer',
                    }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: 'var(--color-primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', flexShrink: 0 }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--color-primary-dark)', marginBottom: '2px' }}>{toast.title}</div>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{toast.message}</div>
                    </div>
                </div>
            )}

            <style>{`
                @media (max-width: 1024px) {
                    .hide-mobile { display: none !important; }
                    .mobile-bottom-nav { display: flex !important; }
                }
                .native-app .mobile-bottom-nav {
                    display: flex !important;
                }
                .native-app .hide-mobile {
                    display: none !important;
                }
                .dark-mode .mobile-bottom-nav {
                    background: rgba(13, 26, 24, 0.98) !important;
                    border-top: 0.5px solid rgba(255,255,255,0.08) !important;
                }
                @keyframes popDown {
                    from { transform: translate(-50%, -100%); opacity: 0; }
                    to { transform: translate(-50%, 0); opacity: 1; }
                }
                @keyframes popIn {
                    0% { transform: scale(0.9) translateY(10px); opacity: 0; }
                    100% { transform: scale(1) translateY(0); opacity: 1; }
                }
                @keyframes pulse-slow {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.2); opacity: 0.8; }
                    100% { transform: scale(1); opacity: 1; }
                }
                @keyframes breathing-dot {
                    0%, 100% { transform: scale(1); opacity: 0.5; }
                    50% { transform: scale(1.5); opacity: 1; }
                }
                @keyframes breathing-pulse {
                    0%, 100% { transform: scale(1); opacity: 0.9; }
                    50% { transform: scale(1.15); opacity: 1; }
                }
            `}</style>
        </>
    );
};

export default Navbar;
