import React, { useState, useEffect, useRef } from 'react';
import { companionApi } from '../../services/aiCompanion';

const PersonalAiCoach = () => {
    const [messages, setMessages] = useState([
        { id: '1', role: 'assistant', text: "Good morning! I noticed your sleep was a bit restless last night. Would you like to try a 3-minute guided breathing exercise before starting your work?" }
    ]);
    const [input, setInput] = useState("");
    const [isThinking, setIsThinking] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isThinking]);

    const handleSend = async (e) => {
        e?.preventDefault();
        if (!input.trim() || isThinking) return;

        const userMsg = { id: Date.now().toString(), role: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsThinking(true);

        try {
            const response = await companionApi.sendMessage(input);
            const botMsg = { id: (Date.now() + 1).toString(), role: 'assistant', text: response.text };
            setMessages(prev => [...prev, botMsg]);
        } catch (error) {
            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', text: "I'm having a little trouble connecting. Let's take a deep breath together while I fix this." }]);
        } finally {
            setIsThinking(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.coachHeader}>
                <div style={styles.avatar}>🤖</div>
                <div>
                    <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800' }}>Wellness Coach</h2>
                    <p style={styles.status}>Online • Ready to listen</p>
                </div>
            </div>

            <div style={styles.chatWindow}>
                {messages.map((msg) => (
                    <div key={msg.id} style={msg.role === 'user' ? styles.messageUser : styles.messageBot}>
                        {msg.text}
                    </div>
                ))}
                {isThinking && (
                    <div style={styles.thinking}>
                        <span></span><span></span><span></span>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} style={styles.inputArea}>
                <textarea
                    style={styles.input}
                    placeholder="Describe your feelings..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={1}
                />
                <button type="submit" style={styles.sendBtn} disabled={!input.trim() || isThinking}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                </button>
            </form>
        </div>
    );
};

const styles = {
    container: {
        background: 'var(--color-background)',
        minHeight: 'calc(100vh - 120px)',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px',
        maxWidth: 'var(--max-width-feed)',
        margin: '0 auto',
        fontFamily: "'Outfit', sans-serif"
    },
    coachHeader: {
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        padding: '16px',
        background: 'var(--color-surface)',
        borderRadius: '16px',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: '20px'
    },
    avatar: {
        width: '48px',
        height: '48px',
        background: 'var(--color-primary-soft)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px'
    },
    status: { fontSize: '12px', color: '#10b981', margin: '2px 0 0', fontWeight: '700' },
    chatWindow: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        marginBottom: '20px',
        overflowY: 'auto',
        padding: '4px'
    },
    messageBot: {
        background: 'var(--color-surface)',
        padding: '14px 18px',
        borderRadius: '16px 16px 16px 4px',
        fontSize: '15px',
        maxWidth: '85%',
        alignSelf: 'flex-start',
        border: '1px solid var(--color-border)',
        color: 'var(--color-text-primary)'
    },
    messageUser: {
        background: 'var(--color-primary)',
        color: 'white',
        padding: '14px 18px',
        borderRadius: '16px 16px 4px 16px',
        fontSize: '15px',
        maxWidth: '85%',
        alignSelf: 'flex-end',
        fontWeight: '500'
    },
    thinking: {
        padding: '12px',
        display: 'flex',
        gap: '4px',
        alignSelf: 'flex-start',
        '& span': {
            width: '8px',
            height: '8px',
            background: 'var(--color-text-muted)',
            borderRadius: '50%',
            animation: 'bounce 1.4s infinite ease-in-out'
        }
    },
    inputArea: {
        display: 'flex',
        gap: '10px',
        background: 'var(--color-surface)',
        padding: '12px',
        borderRadius: '20px',
        border: '1.5px solid var(--color-border)',
        boxShadow: 'var(--shadow-md)'
    },
    input: {
        flex: 1,
        border: 'none',
        background: 'transparent',
        fontSize: '15px',
        color: 'var(--color-text-primary)',
        outline: 'none',
        resize: 'none',
        paddingTop: '8px'
    },
    sendBtn: {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        background: 'var(--color-primary)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'transform 0.2s',
        '&:disabled': { opacity: 0.5 }
    }
};

export default PersonalAiCoach;
