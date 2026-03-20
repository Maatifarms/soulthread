import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { 
    collection, query, where, onSnapshot, addDoc, orderBy, 
    serverTimestamp, doc, setDoc, getDoc, updateDoc, 
    deleteDoc, getDocs, writeBatch, limit, arrayUnion 
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useLocation, useNavigate } from 'react-router-dom';
import { db, storage } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import Skeleton from '../components/common/Skeleton';
import VoiceRecorder from '../components/chat/VoiceRecorder';
import DesktopLayoutWrapper from '../components/layout/DesktopLayoutWrapper';
import { motion, AnimatePresence } from 'framer-motion';

import './Chat.css';

const Chat = () => {
    const { currentUser } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    
    // State
    const [conversations, setConversations] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [showChatView, setShowChatView] = useState(false);
    const [replyTo, setReplyTo] = useState(null);
    const [isOtherTyping, setIsOtherTyping] = useState(false);
    const [chatMediaUploading, setChatMediaUploading] = useState(false);
    const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
    
    // Virtualization / Pagination state
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const MESSAGES_PER_PAGE = 50;

    // Refs
    const chatFileInputRef = useRef(null);
    const typingTimerRef = useRef(null);
    const dummyRef = useRef(null);
    const textareaRef = useRef(null);

    // Mobile detection
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Auto-scroll to bottom
    useEffect(() => {
        if (dummyRef.current) {
            dummyRef.current.scrollIntoView({ behavior: messages.length <= 1 ? 'auto' : 'smooth' });
        }
    }, [messages.length]);

    // Auto-expand textarea
    const handleTextareaInput = (e) => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
        }
        setNewMessage(e.target.value);
    };

    // Fetch Conversations
    useEffect(() => {
        if (!currentUser) return;

        const q = query(
            collection(db, 'conversations'),
            where('participants', 'array-contains', currentUser.uid)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const convos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            convos.sort((a, b) => {
                const timeA = a.lastMessageAt?.toMillis() || 0;
                const timeB = b.lastMessageAt?.toMillis() || 0;
                return timeB - timeA;
            });
            setConversations(convos);
            setLoading(false);
        }, (error) => {
            console.error("Chat subscription error:", error);
            setLoading(false);
        });

        return unsubscribe;
    }, [currentUser]);

    // Handle deep links and initial chat selection
    useEffect(() => {
        if (loading || !currentUser) return;
        
        const params = new URLSearchParams(location.search);
        const chatId = params.get('chat');
        if (chatId) {
            const found = conversations.find(c => c.id === chatId);
            if (found) {
                setSelectedChat(found);
                setShowChatView(true);
            }
        }
    }, [loading, location.search, conversations, currentUser]);

    // Fetch Messages
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

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const newMsgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).reverse();
            setMessages(newMsgs);
            if (snapshot.docs.length < MESSAGES_PER_PAGE) setHasMore(false);
        });

        return unsubscribe;
    }, [selectedChat]);

    // Typing activity
    const handleTypingBroadcast = async () => {
        if (!selectedChat || selectedChat.isNew) return;
        try {
            await updateDoc(doc(db, 'conversations', selectedChat.id), {
                [`typing.${currentUser.uid}`]: true
            });
        } catch (e) { /* ignore */ }

        clearTimeout(typingTimerRef.current);
        typingTimerRef.current = setTimeout(async () => {
            try {
                await updateDoc(doc(db, 'conversations', selectedChat.id), {
                    [`typing.${currentUser.uid}`]: false
                });
            } catch (e) { /* ignore */ }
        }, 3000);
    };

    // Send logic
    const handleSendMessage = async (e) => {
        e.preventDefault();
        const content = newMessage.trim();
        if (!content || !selectedChat) return;

        setNewMessage('');
        if (textareaRef.current) textareaRef.current.style.height = 'auto';

        const chatId = selectedChat.id;
        const msgData = {
            text: content,
            type: 'text',
            senderId: currentUser.uid,
            senderName: currentUser.displayName || 'Anonymous',
            createdAt: serverTimestamp(),
            readAt: null
        };

        try {
            await addDoc(collection(db, 'conversations', chatId, 'messages'), msgData);
            await updateDoc(doc(db, 'conversations', chatId), {
                lastMessage: content,
                lastMessageAt: serverTimestamp(),
                lastMessageSenderId: currentUser.uid,
                read: false
            });
        } catch (err) {
            console.error("Msg send error:", err);
        }
    };

    const getOtherParticipant = (chat) => {
        if (!chat?.participantDetails) return { displayName: 'Someone' };
        const otherId = chat.participants?.find(p => p !== currentUser.uid);
        return chat.participantDetails[otherId] || { displayName: 'Someone' };
    };

    const formatTimestamp = (ts) => {
        if (!ts) return '';
        const date = ts.toDate ? ts.toDate() : new Date(ts);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (!currentUser) return <div className="chat-empty"><p>Please log in to use Chat Sanctuary.</p></div>;

    return (
        <DesktopLayoutWrapper hideRightSidebar={true}>
            <div className={`chat-hero`}>
                {/* Sidebar */}
                <aside className={`chat-sidebar ${isMobile && showChatView ? 'hidden' : ''}`}>
                    <header className="chat-sidebar-header">
                        <h2 className="chat-sidebar-title">Messages</h2>
                    </header>

                    <div className="chat-convo-list smooth-scroll">
                        {loading ? (
                            Array(5).fill(0).map((_, i) => (
                                <div key={i} className="chat-skeleton-item">
                                    <div className="chat-skeleton-circle" />
                                    <div className="chat-skeleton-text">
                                        <div className="chat-skeleton-line" style={{ width: '40%' }} />
                                        <div className="chat-skeleton-line" style={{ width: '70%' }} />
                                    </div>
                                </div>
                            ))
                        ) : conversations.length === 0 ? (
                            <div className="chat-empty">
                                <div className="chat-empty-icon">🛋️</div>
                                <h3 className="chat-empty-title">Silence is golden</h3>
                                <p>But connections are soul-filling.</p>
                            </div>
                        ) : (
                            conversations.map(chat => {
                                const participant = getOtherParticipant(chat);
                                const isUnread = chat.read === false && chat.lastMessageSenderId !== currentUser.uid;
                                return (
                                    <div 
                                        key={chat.id} 
                                        className={`chat-convo-item ${selectedChat?.id === chat.id ? 'active' : ''}`}
                                        onClick={() => {
                                            setSelectedChat(chat);
                                            setShowChatView(true);
                                        }}
                                    >
                                        <div className="chat-avatar-wrapper">
                                            <div className="chat-avatar">
                                                {participant.displayName?.charAt(0) || '?'}
                                            </div>
                                            {isUnread && <div className="unread-indicator" />}
                                        </div>
                                        <div className="chat-item-info">
                                            <div className="chat-item-header">
                                                <span className="chat-item-name">{participant.displayName}</span>
                                                <span className="chat-item-time">{formatTimestamp(chat.lastMessageAt)}</span>
                                            </div>
                                            <div className={`chat-item-preview ${isUnread ? 'unread' : ''}`}>
                                                {chat.lastMessage}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </aside>

                {/* Main View */}
                <main className={`chat-main ${isMobile && !showChatView ? 'hidden' : ''}`}>
                    {selectedChat ? (
                        <>
                            <header className="chat-main-header">
                                <button className="chat-back-btn" onClick={() => setShowChatView(false)}>←</button>
                                <div className="chat-avatar" style={{ width: '42px', height: '42px', fontSize: '15px' }}>
                                    {getOtherParticipant(selectedChat).displayName?.charAt(0)}
                                </div>
                                <div className="chat-active-info">
                                    <div className="chat-active-name">{getOtherParticipant(selectedChat).displayName}</div>
                                    <div className="chat-active-status">
                                        {isOtherTyping ? 'Typing peaceful vibes...' : 'Active in Sanctuary'}
                                    </div>
                                </div>
                            </header>

                            <div className="chat-messages smooth-scroll">
                                {messages.map(msg => {
                                    const isMe = msg.senderId === currentUser.uid;
                                    return (
                                        <div key={msg.id} className={`msg-wrapper ${isMe ? 'me' : 'them'}`}>
                                            <div className="msg-bubble">
                                                {msg.text}
                                            </div>
                                            <div className="msg-meta">
                                                {formatTimestamp(msg.createdAt)}
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={dummyRef} />
                            </div>

                            <form className="chat-input-bar" onSubmit={handleSendMessage}>
                                <div className="chat-input-container">
                                    <textarea 
                                        ref={textareaRef}
                                        className="chat-textarea"
                                        placeholder="Speak your truth..."
                                        value={newMessage}
                                        onInput={handleTextareaInput}
                                        onKeyDown={(e) => {
                                            if(e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendMessage(e);
                                            }
                                        }}
                                        rows="1"
                                    />
                                    <button 
                                        type="button" 
                                        className="chat-action-btn"
                                        onClick={() => chatFileInputRef.current?.click()}
                                    >
                                        📎
                                    </button>
                                </div>
                                <button type="submit" className="chat-send-btn" disabled={!newMessage.trim()}>
                                    🕊️
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="chat-empty">
                            <div className="chat-empty-icon">✨</div>
                            <h3 className="chat-empty-title">Select a Conversation</h3>
                            <p>Reconnect with a soul you've encountered.</p>
                        </div>
                    )}
                </main>
            </div>
            <input 
                type="file" 
                ref={chatFileInputRef} 
                style={{ display: 'none' }} 
                onChange={(e) => {/* Handle media upload logic if needed */}} 
            />
        </DesktopLayoutWrapper>
    );
};

export default memo(Chat);
