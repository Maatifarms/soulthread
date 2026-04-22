import React, { useState, useEffect } from 'react';
import { 
    collection, query, where, orderBy, onSnapshot, 
    doc, updateDoc, writeBatch, deleteDoc, 
    serverTimestamp, limit
} from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { BellOff } from 'lucide-react';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import Loading from '../components/common/Loading';

const Notifications = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, messages, interactions

    useEffect(() => {
        if (!currentUser) return;

        const q = query(
            collection(db, 'notifications'),
            where('recipientId', '==', currentUser.uid),
            orderBy('createdAt', 'desc'),
            limit(50)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const notifs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setNotifications(notifs);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching notifications:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser]);

    const handleNotifClick = async (notif) => {
        try {
            if (!notif.read) {
                await updateDoc(doc(db, 'notifications', notif.id), { read: true });
            }
            
            // Navigation logic based on type
            if (['new_post', 'like', 'comment', 'post_reaction', 'post_comment'].includes(notif.type)) {
                if (notif.postId) navigate(`/post/${notif.postId}`);
                else if (notif.senderId) navigate(`/profile/${notif.senderId}`);
            } else if (['connection_request', 'connection_accepted'].includes(notif.type)) {
                navigate(`/profile/${notif.senderId}`);
            } else if (notif.type === 'message') {
                navigate(`/messages${notif.chatId ? `?chat=${notif.chatId}` : ''}`);
            }
        } catch (error) {
            console.error("Error handling notification click:", error);
        }
    };

    const markAllAsRead = async () => {
        const unread = notifications.filter(n => !n.read);
        if (unread.length === 0) return;

        const batch = writeBatch(db);
        unread.forEach(n => {
            batch.update(doc(db, 'notifications', n.id), { read: true });
        });
        
        try {
            await batch.commit();
        } catch (error) {
            console.error("Error marking all as read:", error);
        }
    };

    const clearAllRead = async () => {
        const readNotifs = notifications.filter(n => n.read);
        if (readNotifs.length === 0) return;

        const batch = writeBatch(db);
        readNotifs.forEach(n => {
            batch.delete(doc(db, 'notifications', n.id));
        });

        try {
            await batch.commit();
        } catch (error) {
            console.error("Error clearing notifications:", error);
        }
    };

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'all') return true;
        if (filter === 'messages') return n.type === 'message';
        if (filter === 'interactions') return ['like', 'comment', 'post_reaction', 'post_comment'].includes(n.type);
        return true;
    });

    if (loading) return <Loading />;

    return (
        <div className="notifications-page animate-fade-in" style={{
            maxWidth: '640px',
            margin: '0 auto',
            padding: '24px 16px',
            minHeight: '100vh',
            background: 'var(--color-background)'
        }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px'
            }}>
                <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '800' }}>Notifications</h1>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                        onClick={markAllAsRead}
                        style={{
                            padding: '6px 12px',
                            borderRadius: '20px',
                            fontSize: '13px',
                            fontWeight: '600',
                            color: 'var(--color-primary)',
                            background: 'var(--color-primary-soft)',
                            border: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        Mark all as read
                    </button>
                    {notifications.some(n => n.read) && (
                        <button 
                            onClick={clearAllRead}
                            style={{
                                padding: '6px 12px',
                                borderRadius: '20px',
                                fontSize: '13px',
                                fontWeight: '600',
                                color: 'var(--color-text-muted)',
                                background: 'var(--color-surface-2)',
                                border: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            Clear read
                        </button>
                    )}
                </div>
            </div>

            {/* Filter Tabs */}
            <div style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '20px',
                overflowX: 'auto',
                paddingBottom: '8px',
                msOverflowStyle: 'none',
                scrollbarWidth: 'none'
            }}>
                {[
                    { id: 'all', label: 'All' },
                    { id: 'messages', label: 'Messages' },
                    { id: 'interactions', label: 'Interactions' }
                ].map(t => (
                    <button
                        key={t.id}
                        onClick={() => setFilter(t.id)}
                        style={{
                            padding: '8px 20px',
                            borderRadius: '99px',
                            fontSize: '14px',
                            fontWeight: '700',
                            whiteSpace: 'nowrap',
                            background: filter === t.id ? 'var(--color-primary)' : 'var(--color-surface)',
                            color: filter === t.id ? 'white' : 'var(--color-text-secondary)',
                            border: filter === t.id ? 'none' : '1px solid var(--color-border)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            boxShadow: filter === t.id ? 'var(--shadow-glow)' : 'var(--shadow-xs)'
                        }}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {filteredNotifications.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '64px 20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px', opacity: 0.2 }}>
                        <BellOff size={64} strokeWidth={1.5} />
                    </div>
                    <h3 style={{ margin: '0 0 8px', color: 'var(--color-text-primary)' }}>Your sanctuary is peaceful</h3>
                    <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>No notifications to display right now.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {filteredNotifications.map((n, idx) => (
                        <div 
                            key={n.id} 
                            onClick={() => handleNotifClick(n)}
                            className="premium-card"
                            style={{
                                padding: '16px',
                                display: 'flex',
                                gap: '16px',
                                alignItems: 'center',
                                background: n.read ? 'var(--color-surface)' : 'rgba(61,139,127,0.05)',
                                borderColor: n.read ? 'var(--color-border)' : 'var(--color-primary-light)',
                                animationDelay: `${idx * 0.05}s`,
                                cursor: 'pointer'
                            }}
                        >
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '50%',
                                flexShrink: 0,
                                background: 'linear-gradient(135deg, var(--color-primary-soft), var(--color-primary-light))',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: '800',
                                color: 'var(--color-primary-dark)',
                                fontSize: '18px',
                                boxShadow: 'var(--shadow-xs)'
                            }}>
                                {n.senderName ? n.senderName.charAt(0) : 'S'}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ 
                                    fontSize: '15px', 
                                    fontWeight: n.read ? '500' : '700', 
                                    color: 'var(--color-text-primary)',
                                    lineHeight: '1.5'
                                }}>
                                    {n.message}
                                </div>
                                <div style={{ 
                                    fontSize: '12px', 
                                    color: 'var(--color-text-muted)',
                                    marginTop: '4px'
                                }}>
                                    {n.createdAt?.toDate ? n.createdAt.toDate().toLocaleDateString(undefined, {
                                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                    }) : 'Just now'}
                                </div>
                            </div>
                            {!n.read && (
                                <div style={{
                                    width: '10px',
                                    height: '10px',
                                    borderRadius: '50%',
                                    background: 'var(--color-primary)',
                                    flexShrink: 0,
                                    boxShadow: '0 0 8px var(--color-primary)'
                                }} />
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Notifications;
