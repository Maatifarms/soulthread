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
import { 
    Settings, 
    LayoutDashboard,
    Zap,
    Download,
    Terminal,
    X,
    Heart,
    Compass,
    Layers,
    MessageSquare,
    Home,
    User,
    Sparkles,
    Fingerprint,
    Search,
    Wind,
    Sun,
    Moon,
    Bell,
    LogOut
} from 'lucide-react';
import './Navbar.css';

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
    const [scrolled, setScrolled] = React.useState(false);
    const [visible, setVisible] = React.useState(true);
    const lastScrollY = React.useRef(0);

    React.useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            const threshold = 10;
            const delta = Math.abs(currentScrollY - lastScrollY.current);
            const isMobile = window.innerWidth <= 1024;

            // Scrolled state for glass background
            setScrolled(currentScrollY > 20);

            // Update visible state for bottom navigation "Smart Hide"
            if (delta > threshold) {
                const isScrollingDown = currentScrollY > lastScrollY.current;
                const isNavVisible = !isScrollingDown || currentScrollY < 100;
                
                setVisible(isNavVisible);
                lastScrollY.current = currentScrollY;
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Reset on unmount
    React.useEffect(() => {
        return () => document.documentElement.style.setProperty('--nav-visible', '1');
    }, []);

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

    // Toast auto-hide
    React.useEffect(() => {
        if (!toast) return;
        const timer = setTimeout(() => setToast(null), 4500);
        return () => clearTimeout(timer);
    }, [toast?.id]);

    // NOTIFICATIONS — deferred to after first paint (non-critical)
    React.useEffect(() => {
        if (!currentUser) return;

        let unsubscribe = () => {};
        let unsubscribeMessages = () => {};

        const setupListeners = () => {
            const q = query(
                collection(db, 'notifications'),
                where('recipientId', '==', currentUser.uid),
                orderBy('createdAt', 'desc'),
                limit(20)
            );

            unsubscribe = onSnapshot(q, (snapshot) => {
                snapshot.docChanges().forEach((change) => {
                    if (change.type === 'added' && !isInitialLoad) {
                        const data = change.doc.data();
                        const currentChatId = new URLSearchParams(location.search).get('chat');
                        const isMainNotifPage = location.pathname === '/notifications';
                        const isActiveChat = data.chatId && data.chatId === currentChatId;

                        if (!data.read && !isMainNotifPage && !isActiveChat && document.hasFocus()) {
                            setToast({ id: change.doc.id, title: data.type === 'message' ? 'New Message' : 'New Notification', message: data.message, type: data.type });
                        }
                    }
                });
                const notifs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
                setNotifications(notifs);
                setUnreadCount(notifs.filter(n => !n.read).length);
                setIsInitialLoad(false);
            });

            const qMessages = query(
                collection(db, 'conversations'),
                where('participants', 'array-contains', currentUser.uid),
                where('read', '==', false)
            );
            unsubscribeMessages = onSnapshot(qMessages, (snapshot) => {
                setUnreadMessageCount(snapshot.docs.filter(d => d.data().lastMessageSenderId !== currentUser.uid).length);
            });
        };

        // Defer notifications until after first paint to not block LCP
        let idleCb;
        if ('requestIdleCallback' in window) {
            idleCb = requestIdleCallback(setupListeners, { timeout: 3000 });
        } else {
            const t = setTimeout(setupListeners, 2000);
            return () => { clearTimeout(t); };
        }

        return () => {
            if (idleCb) cancelIdleCallback(idleCb);
            unsubscribe();
            unsubscribeMessages();
        };
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

    const markAllNotifsRead = async (e) => {
        e?.stopPropagation();
        if (notifications.filter(n => !n.read).length === 0) return;
        try {
            const { writeBatch } = await import('firebase/firestore');
            const batch = writeBatch(db);
            notifications.filter(n => !n.read).forEach(n => {
                batch.update(doc(db, 'notifications', n.id), { read: true });
            });
            await batch.commit();
        } catch (error) { console.error(error); }
    };

    const handleLogout = async () => {
        try { await logout(); navigate('/'); setShowUserMenu(false); } catch (error) { console.error(error); }
    };

    const isActive = (path) => {
        if (path === '/') return location.pathname === '/' || location.pathname === '/feed';
        return location.pathname.startsWith(path);
    };

    const NavLink = ({ to, label, badge, icon: Icon }) => {
        const active = isActive(to);
        return (
            <Link to={to} className={`nav-link-item ${active ? 'active' : ''}`}>
                {Icon && <Icon size={16} />}
                <span>{label}</span>
                {badge > 0 && <span className="nav-badge">{badge > 9 ? '9+' : badge}</span>}
            </Link>
        );
    };

    // Mobile bottom tab
    const TabItem = ({ to, label, badge, icon: Icon, highlightPath }) => {
        const active = isActive(highlightPath || to);
        return (
            <Link to={to} style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: '2px', padding: '8px 0 4px', textDecoration: 'none', position: 'relative',
                WebkitTapHighlightColor: 'transparent', transition: 'transform 0.15s ease',
            }}>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {active ? (
                        <Icon size={24} fill="var(--color-primary)" stroke="var(--color-primary)" strokeWidth={2.5} style={{ transform: 'scale(1.1) translateY(-2px)' }} />
                    ) : (
                        <Icon size={24} stroke="var(--color-text-secondary)" strokeWidth={2} />
                    )}
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
                    fontSize: '10px', fontWeight: active ? '800' : '750', // Toughened weight for authority
                    color: active ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                    fontFamily: 'Outfit, sans-serif', transition: 'all 0.3s ease', marginTop: '2px',
                    letterSpacing: '0.02em'
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
            <nav className={`nav-root ${scrolled ? 'scrolled' : ''} ${!visible ? 'nav-hidden' : ''}`}>
                <div className="nav-container">
                    {/* Logo */}
                    <Link to="/" className="nav-logo-link">
                        <Fingerprint className="nav-logo-icon" size={28} color="var(--color-primary)" />
                        <span className="nav-logo-text">SoulThread</span>
                    </Link>

                    {/* Desktop Navigation Links */}
                    <div className="nav-links-desktop">
                        <NavLink to="/" label="Home" />
                        <NavLink to="/series" label="Series" />
                        <NavLink to="/about" label="Sanctuary" />
                        <NavLink to="/messages" label="Oracle" badge={unreadMessageCount} />
                    </div>

                    {/* Desktop Search */}
                    <div className="nav-search-wrapper">
                        <Search size={18} className="nav-search-icon" />
                        <input
                            type="text"
                            placeholder="Search the sanctuary..."
                            className="nav-search-input"
                            onClick={() => { if (location.pathname !== '/explore') navigate('/explore'); }}
                        />
                    </div>

                    {/* Right side actions */}
                    <div className="nav-actions">
                        <button
                            onClick={() => setShowBreathe(true)}
                            className="nav-btn-icon hide-mobile"
                            title="Breathe"
                        >
                            <Wind size={20} />
                        </button>

                        <button
                            onClick={toggleTheme}
                            className="nav-btn-icon"
                            aria-label="Toggle Theme"
                        >
                            {isDarkMode ? <Sun size={20} color="#FDB813" /> : <Moon size={20} color="var(--color-primary)" />}
                        </button>

                        {currentUser && (
                            <div style={{ position: 'relative' }} ref={notifRef}>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setShowNotifs(!showNotifs); }}
                                    className="nav-btn-icon"
                                    aria-label="Notifications"
                                >
                                    <Bell size={20} />
                                    {unreadCount > 0 && <span className="nav-notif-dot" />}
                                </button>

                                {showNotifs && (
                                    <div className="nav-dropdown-menu">
                                        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '800' }}>Narratives {unreadCount > 0 && <span className="nav-badge">{unreadCount}</span>}</h4>
                                            <button onClick={() => setShowNotifs(false)} style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                                                <X size={18} />
                                            </button>
                                        </div>
                                        <div className="nav-notif-scroll hide-scrollbar" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                            {notifications.length === 0 ? (
                                                <div style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-muted)' }}>Peaceful silence here.</div>
                                            ) : (
                                                notifications.map(n => (
                                                    <div key={n.id} onClick={() => handleRead(n)} style={{
                                                        padding: '12px 16px', borderBottom: '1px solid var(--color-border)',
                                                        background: n.read ? 'transparent' : 'var(--color-primary-soft)',
                                                        cursor: 'pointer', display: 'flex', gap: '12px', alignItems: 'center'
                                                    }}>
                                                        <div style={{ flex: 1 }}>
                                                            <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-primary)' }}>{n.message}</p>
                                                        </div>
                                                        {!n.read && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-primary)' }} />}
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                        <Link to="/notifications" className="nav-menu-link-all" style={{ display: 'block', padding: '12px', textAlign: 'center', fontSize: '13px', background: 'var(--color-surface-2)', textDecoration: 'none', color: 'var(--color-primary)', fontWeight: '700' }}>View All</Link>
                                    </div>
                                )}
                            </div>
                        )}

                        {currentUser ? (
                            <div style={{ position: 'relative' }} ref={userMenuRef} className="hide-mobile">
                                <button
                                    onClick={(e) => { e.stopPropagation(); setShowUserMenu(!showUserMenu); }}
                                    className="nav-btn-icon"
                                    style={{ padding: 0 }}
                                >
                                    {currentUser.photoURL ? (
                                        <img src={currentUser.photoURL} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ fontSize: '15px', fontWeight: '800' }}>{avatarLetter}</div>
                                    )}
                                </button>
                                {showUserMenu && (
                                    <div className="nav-dropdown-menu" style={{ width: '220px' }}>
                                        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--color-border)' }}>
                                            <div style={{ fontWeight: '800', fontSize: '14px', color: 'var(--color-text-primary)' }}>{currentUser.displayName || 'Narrator'}</div>
                                            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{currentUser.email}</div>
                                        </div>
                                        <div style={{ padding: '8px 0' }}>
                                            {[
                                                { to: `/profile/${currentUser.uid}`, label: 'My Identity', icon: User },
                                                { to: '/settings', label: 'Preferences', icon: Settings },
                                                ...(currentUser?.role === 'admin' ? [{ to: '/admin', label: 'Nexus Control', icon: Terminal }] : []),
                                            ].map(item => (
                                                <Link key={item.to} to={item.to} onClick={() => setShowUserMenu(false)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', color: 'var(--color-text-primary)', textDecoration: 'none', fontSize: '14px', fontWeight: '600' }} className="nav-menu-item-link">
                                                    <item.icon size={16} color="var(--color-text-secondary)" />
                                                    {item.label}
                                                </Link>
                                            ))}
                                            <button onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', color: '#ef4444', background: 'none', border: 'none', fontSize: '14px', fontWeight: '700', cursor: 'pointer', borderTop: '1px solid var(--color-border)', marginTop: '4px' }}>
                                                <LogOut size={16} />
                                                Disconnect
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link to="/login" className="nav-btn-enter">
                                Join Sanctuary
                            </Link>
                        )}
                    </div>
                </div>
            </nav>

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
                        fontSize: '13px', fontWeight: '700', cursor: 'pointer', color: 'var(--color-text-primary)',
                        padding: '10px 20px', borderRadius: '30px', background: 'var(--color-surface)',
                        boxShadow: 'var(--shadow-md)', display: 'flex', alignItems: 'center', gap: '8px'
                    }}>
                        <X size={14} />
                        Exit
                    </button>
                    <div style={{
                        width: '200px', height: '200px', borderRadius: '50%',
                        background: 'var(--grad-primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '22px', fontWeight: '700', color: 'white',
                        animation: 'breathing-pulse 4s ease-in-out infinite',
                        boxShadow: '0 0 60px rgba(15,23,42,0.3)',
                    }}>{breathePhase}</div>
                    <p style={{ marginTop: '40px', fontSize: '18px', textAlign: 'center', color: 'var(--color-text-secondary)', lineHeight: '1.6', maxWidth: '280px' }}>
                        Slow down. Follow the pulse.<br />You are safe. You are here.
                    </p>
                </div>
            )}

            <div className="mobile-bottom-nav">
                {currentUser ? (
                    <>
                        <TabItem to="/" label="Home" icon={Home} />
                        <TabItem to="/explore" label="Explore" icon={Compass} />
                        <TabItem to="/series" label="Series" icon={Layers} />
                        <TabItem to="/messages" label="Chat" badge={unreadMessageCount} icon={MessageSquare} />
                        <TabItem to="/crisis" label="Crisis" icon={Heart} />
                        <TabItem to={`/profile/${currentUser.uid}`} label="Profile" highlightPath="/profile" icon={User} />
                    </>
                ) : (
                    <Link to="/login" className="mobile-login-btn">Enter Sanctuary</Link>
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
                        <MessageSquare size={20} />
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
