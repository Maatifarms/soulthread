import { useState, useEffect, useRef, useCallback, memo } from 'react';
import {
    collection, query, where, onSnapshot, addDoc, orderBy,
    serverTimestamp, doc, updateDoc,
    deleteDoc, getDocs, writeBatch, limit
} from 'firebase/firestore';
import { useLocation, useNavigate } from 'react-router-dom';
import { db, functions } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { httpsCallable } from 'firebase/functions';

import './Chat.css';

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatTimestamp = (ts) => {
    if (!ts) return '';
    const date = ts.toDate ? ts.toDate() : new Date(ts);
    const now = new Date();
    const diffDays = Math.floor((now - date) / 86400000);
    if (diffDays === 0) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return date.toLocaleDateString([], { weekday: 'short' });
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const formatMsgTime = (ts) => {
    if (!ts) return '';
    const date = ts.toDate ? ts.toDate() : new Date(ts);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// ── Delete confirmation inline banner ────────────────────────────────────────

const DeleteConfirm = ({ label, onConfirm, onCancel }) => (
    <div className="delete-confirm-bar">
        <span>{label}</span>
        <div className="delete-confirm-actions">
            <button className="dc-cancel" onClick={onCancel}>Cancel</button>
            <button className="dc-confirm" onClick={onConfirm}>Delete</button>
        </div>
    </div>
);

// ── Avatar ────────────────────────────────────────────────────────────────────

const Avatar = ({ user, size = 44 }) => {
    const [imgError, setImgError] = useState(false);
    if (user?.photoURL && !imgError) {
        return (
            <img
                src={user.photoURL}
                alt={user.displayName}
                className="chat-avatar-img"
                style={{ width: size, height: size }}
                onError={() => setImgError(true)}
            />
        );
    }
    return (
        <div className="chat-avatar-letter" style={{ width: size, height: size, fontSize: size * 0.38 }}>
            {user?.displayName?.charAt(0)?.toUpperCase() || '?'}
        </div>
    );
};

// ── Message bubble ────────────────────────────────────────────────────────────

const MessageBubble = memo(({ msg, isMe, onDelete, onEdit }) => {
    const [showMenu, setShowMenu] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const menuRef = useRef(null);
    const longPressTimer = useRef(null);

    // Close menu on outside click
    useEffect(() => {
        if (!showMenu) return;
        const handler = (e) => {
            if (!menuRef.current?.contains(e.target)) setShowMenu(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [showMenu]);

    const handleLongPressStart = () => {
        longPressTimer.current = setTimeout(() => setShowMenu(true), 400);
    };
    const handleLongPressEnd = () => clearTimeout(longPressTimer.current);

    if (confirmDelete) {
        return (
            <div className={`msg-wrapper ${isMe ? 'me' : 'them'}`}>
                <DeleteConfirm
                    label="Delete this message?"
                    onConfirm={() => { onDelete(msg.id); setConfirmDelete(false); }}
                    onCancel={() => setConfirmDelete(false)}
                />
            </div>
        );
    }

    return (
        <motion.div
            className={`msg-wrapper ${isMe ? 'me' : 'them'}`}
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.18 }}
        >
            <div
                className="msg-row"
                onTouchStart={handleLongPressStart}
                onTouchEnd={handleLongPressEnd}
                onTouchMove={handleLongPressEnd}
            >
                <div
                    className="msg-bubble"
                    onDoubleClick={() => isMe && setShowMenu(true)}
                >
                    {msg.replyTo && (
                        <div className="msg-reply-preview">{msg.replyTo.text}</div>
                    )}
                    {msg.type === 'image' ? (
                        <img src={msg.imageUrl} alt="img" className="msg-image" />
                    ) : (
                        <span>{msg.text}</span>
                    )}
                    {msg.edited && <span className="msg-edited"> · edited</span>}
                </div>

                {isMe && (
                    <div className="msg-actions-wrapper" ref={menuRef}>
                        <button
                            className="msg-more-btn"
                            onClick={() => setShowMenu(v => !v)}
                            aria-label="Message options"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                <circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/>
                            </svg>
                        </button>

                        <AnimatePresence>
                            {showMenu && (
                                <motion.div
                                    className="msg-menu"
                                    initial={{ opacity: 0, scale: 0.9, y: 4 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, y: 4 }}
                                    transition={{ duration: 0.12 }}
                                >
                                    <button onClick={() => { onEdit(msg); setShowMenu(false); }}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                        Edit
                                    </button>
                                    <button className="danger" onClick={() => { setConfirmDelete(true); setShowMenu(false); }}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                                        Delete
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            <div className={`msg-time ${isMe ? 'me' : 'them'}`}>
                {formatMsgTime(msg.createdAt)}
                {isMe && (
                    <span className="msg-tick">
                        {msg.readAt ? (
                            <svg width="14" height="10" viewBox="0 0 24 12" fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="1,6 5,10 11,2"/><polyline points="8,6 12,10 18,2"/>
                            </svg>
                        ) : (
                            <svg width="14" height="10" viewBox="0 0 16 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="1,5 5,9 15,1"/>
                            </svg>
                        )}
                    </span>
                )}
            </div>
        </motion.div>
    );
});

// ── Conversation Item ─────────────────────────────────────────────────────────

const ConvoItem = memo(({ chat, isActive, currentUserId, onSelect, onDelete }) => {
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef(null);

    const participant = (() => {
        if (!chat?.participantDetails) return { displayName: 'Someone' };
        const otherId = chat.participants?.find(p => p !== currentUserId);
        return chat.participantDetails[otherId] || { displayName: 'Someone' };
    })();

    const isUnread = chat.read === false && chat.lastMessageSenderId !== currentUserId;

    useEffect(() => {
        if (!showMenu) return;
        const handler = (e) => {
            if (!menuRef.current?.contains(e.target)) setShowMenu(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [showMenu]);

    if (confirmDelete) {
        return (
            <div className="chat-convo-item" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                <DeleteConfirm
                    label={`Delete chat with ${participant.displayName}?`}
                    onConfirm={() => onDelete(chat.id)}
                    onCancel={() => setConfirmDelete(false)}
                />
            </div>
        );
    }

    return (
        <div className={`chat-convo-item ${isActive ? 'active' : ''}`} onClick={() => onSelect(chat)}>
            <div className="chat-avatar-wrapper">
                <Avatar user={participant} size={48} />
                {isUnread && <div className="unread-dot" />}
            </div>

            <div className="chat-item-info">
                <div className="chat-item-header">
                    <span className={`chat-item-name ${isUnread ? 'bold' : ''}`}>
                        {participant.displayName}
                    </span>
                    <span className="chat-item-time">{formatTimestamp(chat.lastMessageAt)}</span>
                </div>
                <div className={`chat-item-preview ${isUnread ? 'unread' : ''}`}>
                    {chat.lastMessage || 'Start a conversation'}
                </div>
            </div>

            <div className="convo-more-wrapper" ref={menuRef} onClick={e => e.stopPropagation()}>
                <button className="convo-more-btn" onClick={() => setShowMenu(v => !v)} aria-label="More options">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/>
                    </svg>
                </button>
                <AnimatePresence>
                    {showMenu && (
                        <motion.div
                            className="convo-menu"
                            initial={{ opacity: 0, scale: 0.9, y: -4 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.12 }}
                        >
                            <button className="danger" onClick={() => { setConfirmDelete(true); setShowMenu(false); }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                                Delete chat
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
});

// ── Main Chat Component ───────────────────────────────────────────────────────

const Chat = () => {
    const { currentUser } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const [conversations, setConversations] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [showChatView, setShowChatView] = useState(false);
    const [editingMessage, setEditingMessage] = useState(null);
    const [isOtherTyping, setIsOtherTyping] = useState(false);
    const [confirmDeleteChatId, setConfirmDeleteChatId] = useState(null);
    const [isRefining, setIsRefining] = useState(false);

    const MESSAGES_PER_PAGE = 50;
    const typingTimerRef = useRef(null);
    const dummyRef = useRef(null);
    const textareaRef = useRef(null);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (dummyRef.current && !editingMessage) {
            dummyRef.current.scrollIntoView({ behavior: messages.length <= 1 ? 'auto' : 'smooth' });
        }
    }, [messages.length, editingMessage]);

    // Fetch conversations
    useEffect(() => {
        if (!currentUser) return;
        const q = query(
            collection(db, 'conversations'),
            where('participants', 'array-contains', currentUser.uid)
        );
        return onSnapshot(q, (snapshot) => {
            const convos = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            convos.sort((a, b) => (b.lastMessageAt?.toMillis() || 0) - (a.lastMessageAt?.toMillis() || 0));
            setConversations(convos);
            setLoading(false);
        }, () => setLoading(false));
    }, [currentUser]);

    // Deep link
    useEffect(() => {
        if (loading || !currentUser) return;
        const chatId = new URLSearchParams(location.search).get('chat');
        if (chatId) {
            const found = conversations.find(c => c.id === chatId);
            if (found) { setSelectedChat(found); setShowChatView(true); }
        }
    }, [loading, location.search, conversations, currentUser]);

    // Fetch messages
    useEffect(() => {
        if (!selectedChat || selectedChat.isNew) {
            if (selectedChat?.isNew) setMessages([]);
            return;
        }
        const q = query(
            collection(db, 'conversations', selectedChat.id, 'messages'),
            orderBy('createdAt', 'desc'),
            limit(MESSAGES_PER_PAGE)
        );
        return onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(d => ({ id: d.id, ...d.data() })).reverse();
            setMessages(msgs);

            // Auto-mark as read if we are looking at the chat
            if (msgs.length > 0) {
                const lastMsg = msgs[msgs.length - 1];
                if (lastMsg.senderId !== currentUser.uid && !lastMsg.readAt) {
                    // Mark msg as read
                    updateDoc(doc(db, 'conversations', selectedChat.id, 'messages', lastMsg.id), {
                        readAt: serverTimestamp()
                    }).catch(() => {});
                    // Mark convo as read
                    updateDoc(doc(db, 'conversations', selectedChat.id), {
                        read: true
                    }).catch(() => {});
                    
                    // Mark notifications as read too
                    const markNotifs = async () => {
                        const nq = query(collection(db, 'notifications'), 
                            where('recipientId', '==', currentUser.uid),
                            where('chatId', '==', selectedChat.id),
                            where('read', '==', false));
                        const ns = await getDocs(nq);
                        if (!ns.empty) {
                            const b = writeBatch(db);
                            ns.docs.forEach(d => b.update(d.ref, { read: true }));
                            await b.commit();
                        }
                    };
                    markNotifs();
                }
            }
        });
    }, [selectedChat]);

    // Typing
    const handleTyping = async () => {
        if (!selectedChat || selectedChat.isNew) return;
        try {
            await updateDoc(doc(db, 'conversations', selectedChat.id), {
                [`typing.${currentUser.uid}`]: true
            });
        } catch (_) {}
        clearTimeout(typingTimerRef.current);
        typingTimerRef.current = setTimeout(async () => {
            try {
                await updateDoc(doc(db, 'conversations', selectedChat.id), {
                    [`typing.${currentUser.uid}`]: false
                });
            } catch (_) {}
        }, 3000);
    };

    // Send / Edit
    const handleSendMessage = async (e) => {
        e.preventDefault();
        const content = newMessage.trim();
        if (!content || !selectedChat) return;

        setNewMessage('');
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.focus();
        }

        const chatId = selectedChat.id;

        if (editingMessage) {
            await updateDoc(doc(db, 'conversations', chatId, 'messages', editingMessage.id), {
                text: content, edited: true, updatedAt: serverTimestamp()
            }).catch(console.error);
            setEditingMessage(null);
            return;
        }

        try {
            await addDoc(collection(db, 'conversations', chatId, 'messages'), {
                text: content, type: 'text',
                senderId: currentUser.uid,
                senderName: currentUser.displayName || 'Anonymous',
                createdAt: serverTimestamp(), readAt: null
            });
            await updateDoc(doc(db, 'conversations', chatId), {
                lastMessage: content,
                lastMessageAt: serverTimestamp(),
                lastMessageSenderId: currentUser.uid,
                read: false
            });
        } catch (err) { console.error("Send error:", err); }
    };

    const handleAIAssist = async () => {
        if (!newMessage.trim() || isRefining) return;
        
        setIsRefining(true);
        try {
            // Get last 2 messages for context
            const contextMsgs = messages.slice(-2).map(m => `${m.senderName}: ${m.text}`).join('\n');
            const refine = httpsCallable(functions, 'refineContent');
            const result = await refine({ 
                text: newMessage, 
                context: contextMsgs 
            });
            
            if (result.data?.refined) {
                setNewMessage(result.data.refined);
                if (textareaRef.current) {
                   setTimeout(() => {
                        textareaRef.current.style.height = 'auto';
                        textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
                   }, 0);
                }
            }
        } catch (err) {
            console.error("AI Assist error:", err);
        } finally {
            setIsRefining(false);
        }
    };

    const handleDeleteMessage = async (msgId) => {
        if (!selectedChat) return;
        await deleteDoc(doc(db, 'conversations', selectedChat.id, 'messages', msgId)).catch(console.error);
    };

    // Delete conversation + all messages (batch)
    const handleDeleteConversation = async (chatId) => {
        try {
            const msgsRef = collection(db, 'conversations', chatId, 'messages');
            const snap = await getDocs(msgsRef);
            const batch = writeBatch(db);
            snap.docs.forEach(d => batch.delete(d.ref));
            batch.delete(doc(db, 'conversations', chatId));
            await batch.commit();
        } catch (err) {
            console.error("Delete conversation error:", err);
        }
        if (selectedChat?.id === chatId) {
            setSelectedChat(null);
            setShowChatView(false);
        }
    };

    const handleSelectChat = async (chat) => {
        setSelectedChat(chat);
        setShowChatView(true);
        setEditingMessage(null);
        setNewMessage('');

        // Mark conversation as read
        if (chat.read === false && chat.lastMessageSenderId !== currentUser.uid) {
            try {
                await updateDoc(doc(db, 'conversations', chat.id), { read: true });
            } catch (err) { console.error("Error marking convo read:", err); }
        }

        // Also mark all 'message' notifications for this chat as read
        try {
            const notifQ = query(
                collection(db, 'notifications'),
                where('recipientId', '==', currentUser.uid),
                where('chatId', '==', chat.id),
                where('read', '==', false)
            );
            const snaps = await getDocs(notifQ);
            if (!snaps.empty) {
                const batch = writeBatch(db);
                snaps.docs.forEach(d => batch.update(d.ref, { read: true }));
                await batch.commit();
            }
        } catch (err) { console.warn("Error marking notifs read:", err); }
    };

    const handleBack = () => {
        setShowChatView(false);
        setEditingMessage(null);
        setNewMessage('');
    };

    const getOtherParticipant = (chat) => {
        if (!chat?.participantDetails) return { displayName: 'Someone' };
        const otherId = chat.participants?.find(p => p !== currentUser.uid);
        return chat.participantDetails[otherId] || { displayName: 'Someone' };
    };

    if (!currentUser) {
        return (
            <div className="chat-gate">
                <div className="chat-gate-icon">💬</div>
                <h3>Sign in to access messages</h3>
                <button className="btn-primary" onClick={() => navigate('/login')}>Sign In</button>
            </div>
        );
    }

    const otherUser = selectedChat ? getOtherParticipant(selectedChat) : null;

    return (
        <div className="chat-layout">
            {/* ── Sidebar ── */}
            <aside className={`chat-sidebar ${isMobile && showChatView ? 'hidden' : ''}`}>
                <header className="chat-sidebar-header">
                    <h2 className="chat-sidebar-title">Messages</h2>
                </header>

                <div className="chat-convo-list">
                    {loading ? (
                        Array(5).fill(0).map((_, i) => (
                            <div key={i} className="chat-skeleton-item">
                                <div className="chat-skeleton-circle" />
                                <div className="chat-skeleton-text">
                                    <div className="chat-skeleton-line" style={{ width: '50%' }} />
                                    <div className="chat-skeleton-line" style={{ width: '75%' }} />
                                </div>
                            </div>
                        ))
                    ) : conversations.length === 0 ? (
                        <div className="chat-empty-state">
                            <div style={{ fontSize: 48, opacity: 0.3 }}>💬</div>
                            <p style={{ fontWeight: 700, color: 'var(--color-text-secondary)' }}>No messages yet</p>
                            <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Visit someone's profile to start a conversation</p>
                        </div>
                    ) : (
                        conversations.map(chat => (
                            <ConvoItem
                                key={chat.id}
                                chat={chat}
                                isActive={selectedChat?.id === chat.id}
                                currentUserId={currentUser.uid}
                                onSelect={handleSelectChat}
                                onDelete={handleDeleteConversation}
                            />
                        ))
                    )}
                </div>
            </aside>

            {/* ── Main ── */}
            <main className={`chat-main ${isMobile && !showChatView ? 'hidden' : ''}`}>
                {selectedChat ? (
                    <>
                        {/* Header */}
                        <header className="chat-main-header">
                            <button className="chat-back-btn" onClick={handleBack} aria-label="Back">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="15 18 9 12 15 6"/>
                                </svg>
                            </button>

                            <Avatar user={otherUser} size={40} />

                            <div className="chat-active-info">
                                <div className="chat-active-name">{otherUser?.displayName}</div>
                                <div className="chat-active-status">
                                    {isOtherTyping ? (
                                        <span className="typing-indicator">
                                            <span /><span /><span />
                                        </span>
                                    ) : 'Active'}
                                </div>
                            </div>

                            {/* Header menu */}
                            <HeaderMenu
                                onDelete={() => {
                                    handleDeleteConversation(selectedChat.id);
                                }}
                            />
                        </header>

                        {/* Messages */}
                        <div className="chat-messages">
                            <AnimatePresence initial={false}>
                                {messages.map(msg => (
                                    <MessageBubble
                                        key={msg.id}
                                        msg={msg}
                                        isMe={msg.senderId === currentUser.uid}
                                        onDelete={handleDeleteMessage}
                                        onEdit={(m) => { setEditingMessage(m); setNewMessage(m.text); textareaRef.current?.focus(); }}
                                    />
                                ))}
                            </AnimatePresence>
                            <div ref={dummyRef} style={{ height: 1 }} />
                        </div>

                        {/* Input */}
                        <form className="chat-input-bar" onSubmit={handleSendMessage}>
                            {editingMessage && (
                                <div className="chat-editing-bar">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                    <span>Editing message</span>
                                    <button type="button" onClick={() => { setEditingMessage(null); setNewMessage(''); }}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                    </button>
                                </div>
                            )}
                            <div className="chat-input-row">
                                <div className="chat-input-container">
                                    <textarea
                                        ref={textareaRef}
                                        className="chat-textarea"
                                        placeholder="Message..."
                                        value={newMessage}
                                        onInput={(e) => {
                                            const ta = textareaRef.current;
                                            if (ta) { ta.style.height = 'auto'; ta.style.height = Math.min(ta.scrollHeight, 120) + 'px'; }
                                            setNewMessage(e.target.value);
                                            handleTyping();
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(e); }
                                        }}
                                        rows="1"
                                    />
                                </div>
                                <button 
                                    type="button" 
                                    className={`chat-ai-btn ${isRefining ? 'loading' : ''}`}
                                    onClick={handleAIAssist}
                                    disabled={!newMessage.trim() || isRefining}
                                    title="Refine with AI"
                                >
                                    <Sparkles size={18} />
                                </button>
                                <button type="submit" className={`chat-send-btn ${newMessage.trim() ? 'active' : ''}`} disabled={!newMessage.trim() || isRefining} aria-label="Send">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="22" y1="2" x2="11" y2="13"/>
                                        <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                                    </svg>
                                </button>
                            </div>
                        </form>
                    </>
                ) : (
                    <div className="chat-empty-state centered">
                        <div style={{ fontSize: 56, opacity: 0.15 }}>💬</div>
                        <p style={{ fontWeight: 700, color: 'var(--color-text-secondary)', marginTop: 16 }}>Select a conversation</p>
                        <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Choose from the list to start messaging</p>
                    </div>
                )}
            </main>
        </div>
    );
};

// ── Header More Menu ──────────────────────────────────────────────────────────

const HeaderMenu = ({ onDelete }) => {
    const [open, setOpen] = useState(false);
    const [confirm, setConfirm] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        if (!open) return;
        const h = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, [open]);

    if (confirm) {
        return (
            <DeleteConfirm
                label="Delete this conversation?"
                onConfirm={() => { onDelete(); setConfirm(false); setOpen(false); }}
                onCancel={() => setConfirm(false)}
            />
        );
    }

    return (
        <div className="header-more-wrapper" ref={ref}>
            <button className="header-more-btn" onClick={() => setOpen(v => !v)} aria-label="More options">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/>
                </svg>
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div
                        className="header-menu"
                        initial={{ opacity: 0, scale: 0.9, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.12 }}
                    >
                        <button className="danger" onClick={() => { setConfirm(true); setOpen(false); }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                            Delete conversation
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default memo(Chat);
