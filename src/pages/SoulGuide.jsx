import { motion, AnimatePresence } from 'framer-motion';
import { Users, Flame, Sparkles, Lock, Brain, Ban, SendHorizontal } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../services/firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import DesktopLayoutWrapper from '../components/layout/DesktopLayoutWrapper';
import SEO from '../components/common/SEO';
import './SoulGuide.css';

const SoulGuide = () => {
    const { currentUser } = useAuth();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isOptedIn, setIsOptedIn] = useState(false);
    const [checkingOptIn, setCheckingOptIn] = useState(true);
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);

    // Initial load: Check opt-in and fetch history
    useEffect(() => {
        if (!currentUser) return;

        const checkOptIn = async () => {
            try {
                const sessionRef = doc(db, 'soulguide_sessions', `sg_${currentUser.uid}`);
                const snap = await getDoc(sessionRef);
                
                if (snap.exists()) {
                    const data = snap.data();
                    setIsOptedIn(!!data.optIn);
                    if (data.messages && data.messages.length > 0) {
                        setMessages(data.messages);
                    } else {
                        // Default greeting if no history
                        setMessages([{ 
                            role: 'model', 
                            content: "Welcome to SoulGuide. I'm here to offer a safe, non-judgmental space for your thoughts and feelings. How are you carrying yourself today?" 
                        }]);
                    }
                } else {
                    setIsOptedIn(false);
                }
            } catch (err) {
                console.error("SoulGuide Opt-in Check Error:", err);
            } finally {
                setCheckingOptIn(false);
            }
        };

        checkOptIn();
    }, [currentUser]);

    const handleOptIn = async () => {
        if (!currentUser) return;
        setIsLoading(true);
        try {
            const sessionRef = doc(db, 'soulguide_sessions', `sg_${currentUser.uid}`);
            await setDoc(sessionRef, {
                optIn: true,
                optInAt: serverTimestamp(),
                messages: [{ 
                    role: 'model', 
                    content: "Welcome to SoulGuide. I'm here to offer a safe, non-judgmental space for your thoughts and feelings. How are you carrying yourself today?" 
                }]
            }, { merge: true });
            
            setIsOptedIn(true);
            setMessages([{ 
                role: 'model', 
                content: "Welcome to SoulGuide. I'm here to offer a safe, non-judgmental space for your thoughts and feelings. How are you carrying yourself today?" 
            }]);
        } catch (err) {
            console.error("Opt-in Error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleSend = async (e) => {
        if (e) e.preventDefault();
        const content = input.trim();
        if (!content || isLoading) return;

        setInput('');
        if (textareaRef.current) textareaRef.current.style.height = 'auto';
        
        setMessages(prev => [...prev, { role: 'user', content }]);
        setIsLoading(true);

        try {
            const askSoulGuide = httpsCallable(functions, 'askSoulGuide');
            const result = await askSoulGuide({ message: content });
            
            if (result.data.error === 'permission-denied') {
                setIsOptedIn(false);
                return;
            }

            setMessages(prev => [...prev, { role: 'model', content: result.data.response }]);
        } catch (error) {
            console.error("SoulGuide Error:", error);
            setMessages(prev => [...prev, { 
                role: 'model', 
                content: "I'm having a quiet moment of reflection. While I find my words, remember that you are not alone. Please try again in a moment, or visit our 'Care' page if you need urgent support." 
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSuggestion = (text) => {
        setInput(text);
        if (textareaRef.current) textareaRef.current.focus();
    };

    if (!currentUser) {
        return (
            <div className="guide-container">
                <div className="guide-optin">
                    <div className="guide-optin-icon">
                        <Users size={48} strokeWidth={1.5} color="var(--color-primary)" />
                    </div>
                    <h2>SoulGuide Companion</h2>
                    <p>Unlock a private, empathetic AI space built to support your mental wellbeing. Sign in to start your journey with SoulGuide.</p>
                    <button className="guide-optin-btn" onClick={() => window.location.href = '/login'}>Sign In to Start</button>
                </div>
            </div>
        );
    }

    if (checkingOptIn) {
        return (
            <div className="guide-container">
                <div className="loading-spinner large" />
            </div>
        );
    }

    return (
        <DesktopLayoutWrapper>
            <SEO 
                title="SoulGuide | Your AI Emotional Companion"
                description="Speak freely and anonymously with SoulThread Guide. An AI-powered companion designed for empathy, clarity, and mental support."
            />
            <div className="guide-container">
                <div className="guide-glass-shell">
                    <header className="guide-header">
                        <div className="guide-avatar">
                            <div className="guide-avatar-inner">
                                <Flame size={24} strokeWidth={2} color="white" />
                            </div>
                        </div>
                        <div className="guide-header-text">
                            <h1>SoulGuide</h1>
                            <p>AI Emotional Companion</p>
                        </div>
                    </header>

                    <AnimatePresence mode="wait">
                        {!isOptedIn ? (
                            <motion.div 
                                key="optin"
                                className="guide-optin"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <div className="guide-optin-icon">
                                    <Sparkles size={48} strokeWidth={1.5} color="var(--color-primary)" />
                                </div>
                                <h2>A Safe Space for Your Mind</h2>
                                <p>
                                    SoulGuide is an empathetic companion that listens and supports you. 
                                    Your conversations are private and used only to help you navigate your emotional landscape.
                                </p>
                                
                                <div className="guide-trust-badges">
                                    <div className="trust-badge"><Lock size={14} /> End-to-End Privacy</div>
                                    <div className="trust-badge"><Brain size={14} /> Empathy First AI</div>
                                    <div className="trust-badge"><Ban size={14} /> Zero Judgment</div>
                                </div>

                                <button 
                                    className="guide-optin-btn" 
                                    onClick={handleOptIn}
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Preparing Your Space...' : 'I Understand, Let\'s Talk'}
                                </button>
                                <div style={{ marginTop: '20px', fontSize: '12px', color: 'var(--color-text-muted)', maxWidth: '300px' }}>
                                    SoulGuide is not a substitute for professional medical advice or emergency services.
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="chat"
                                className="chat-content-stack"
                                style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <div className="guide-chat-window">
                                    {messages.map((msg, idx) => (
                                        <div key={idx} className={`guide-bubble-wrapper ${msg.role === 'user' ? 'user' : 'guide'}`}>
                                            <div className="guide-bubble">
                                                {msg.content}
                                            </div>
                                        </div>
                                    ))}
                                    {isLoading && (
                                        <div className="guide-bubble-wrapper guide">
                                            <div className="guide-bubble loading">
                                                <span className="dot"></span>
                                                <span className="dot"></span>
                                                <span className="dot"></span>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} style={{ height: 1 }} />
                                </div>

                                <div className="guide-suggestions">
                                    <button onClick={() => handleSuggestion("I'm feeling a bit overwhelmed today.")}>Feeling Overwhelmed</button>
                                    <button onClick={() => handleSuggestion("How can I build more mental toughness?")}>Mental Toughness</button>
                                    <button onClick={() => handleSuggestion("I need help with focus.")}>Focus Help</button>
                                </div>

                                <form className="guide-input-area" onSubmit={handleSend}>
                                    <textarea
                                        ref={textareaRef}
                                        placeholder="Share your thoughts..."
                                        value={input}
                                        onChange={(e) => {
                                            setInput(e.target.value);
                                            e.target.style.height = 'auto';
                                            e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSend();
                                            }
                                        }}
                                        rows="1"
                                        disabled={isLoading}
                                    />
                                    <button type="submit" disabled={!input.trim() || isLoading}>
                                        <SendHorizontal size={22} strokeWidth={2.5} />
                                    </button>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </DesktopLayoutWrapper>
    );
};

export default SoulGuide;
