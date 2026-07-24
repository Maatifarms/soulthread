// Home — main feed page: greeting, mood check-in, compose bar, post feed
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, query, where, limit, getDocs, getCountFromServer, doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { Capacitor } from '@capacitor/core';
import FeedList from '../components/feed/FeedList';
import CreatePost from '../components/post/CreatePost';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../services/firebase';
import GuestLanding from '../components/home/GuestLanding';
import DailyPrompt from '../components/home/DailyPrompt';
import SEO from '../components/common/SEO';
import { CATEGORY_LIST } from '../config/issueCategories';
import { 
    Sparkles,
    HeartPulse,
    Volume2,
    Wrench,
    Rainbow,
    Users,
    Heart,
    Flame,
    PenLine,
    Sprout,
    Layout,
    MessageCircle,
    Brain,
    ShieldCheck,
    Search,
    Sun,
    Moon,
    Bell,
    User,
    LogOut,
    Wind,
    Fingerprint,
    Download,
    Plus,
    X
} from 'lucide-react';

const ICON_MAP = {
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
    Layout,
    ShieldCheck,
    MessageCircle
};
import './Home.css';

const isNativeApp = Capacitor.isNativePlatform();

const MORNING_QUOTES = [
  "Start your day gently. You don't have to carry everything all at once.",
  "A brand new day to focus on breathing and healing. Take it one hour at a time.",
  "Be kind to yourself today. You are doing the best you can."
];
const AFTERNOON_QUOTES = [
  "Pause for a moment. Take a deep breath. Check in with your shoulders and jaw.",
  "You've made it through the morning. Let go of whatever didn't go perfectly.",
  "A quiet breath in, a slow breath out. You are safe here."
];
const EVENING_QUOTES = [
  "The day is winding down. Give yourself permission to rest and reflect.",
  "You survived another day, and that is enough. Rest your mind tonight.",
  "Soft thoughts only. Let the worries of today dissolve into the evening."
];

const SUPPORTIVE_MOODS = {
  Anxious: {
    emoji: '🧠',
    reply: "Anxiety is like a storm, but you are the sky. It will pass. Let's take slow, deep breaths together.",
    color: '#0d9488',
    bg: 'rgba(13,148,136,0.1)'
  },
  Lonely: {
    emoji: '👤',
    reply: "Even in silence, you are not alone here. There are hearts listening. Thank you for showing up today.",
    color: '#8b5cf6',
    bg: 'rgba(139,92,246,0.1)'
  },
  Overwhelmed: {
    emoji: '🌊',
    reply: "You don't need to figure out the whole path right now. Just focus on the very next step.",
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.1)'
  },
  Done: {
    emoji: '🛑',
    reply: "It is okay to rest, to stop trying, and to just sit with yourself. You've fought hard today.",
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.1)'
  },
  Grateful: {
    emoji: '☀️',
    reply: "Holding onto light attracts more of it. Thank you for sharing your positive energy with the sanctuary.",
    color: '#22c55e',
    bg: 'rgba(34,197,94,0.1)'
  },
  Healing: {
    emoji: '🌱',
    reply: "Healing is not a straight line, but every step counts. Celebrate your quiet progress.",
    color: '#ec4899',
    bg: 'rgba(236,72,153,0.1)'
  }
};

const MOOD_TO_CATEGORY = {
  Anxious: 'mental_health',
  Lonely: 'mental_health',
  Overwhelmed: 'mental_health',
  Done: 'mental_health',
  Grateful: null,
  Grief: 'mental_health',
  Burnout: 'career',
};

function getSanctuaryGreeting() {
  const hr = new Date().getHours();
  if (hr < 12) return { text: "Good morning", quotes: MORNING_QUOTES };
  if (hr < 17) return { text: "Good afternoon", quotes: AFTERNOON_QUOTES };
  return { text: "Good evening", quotes: EVENING_QUOTES };
}

const Home = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [selectedCategory, setSelectedCategory] = useState(currentUser?.feedFocus !== 'all' ? currentUser?.feedFocus : null);
    const [dailyPrompt, setDailyPrompt] = useState(null);
    const [livePostCount, setLivePostCount] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Give the compose modal a history entry so the hardware/WebView back button
    // closes it instead of falling through to backgrounding the whole app.
    useEffect(() => {
        if (!showCreateModal) return;
        window.history.pushState({ modal: 'compose' }, '');
        const handlePopState = () => setShowCreateModal(false);
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [showCreateModal]);

    const closeCreateModal = () => {
        if (window.history.state?.modal === 'compose') {
            window.history.back();
        } else {
            setShowCreateModal(false);
        }
    };

    // Redefined Dashboard States
    const [activeMood, setActiveMood] = useState(null);
    const [showBreathingModal, setShowBreathingModal] = useState(false);
    const [breathePhase, setBreathePhase] = useState('Ready');
    const [breatheSeconds, setBreatheSeconds] = useState(4);

    const [monthlySharesCount, setMonthlySharesCount] = useState(0);

    // Fetch user shares in the current calendar month
    useEffect(() => {
        if (!currentUser) return;
        
        const fetchMonthlyShares = async () => {
            try {
                const now = new Date();
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                
                const qShares = query(
                    collection(db, 'posts'),
                    where('authorId', '==', currentUser.uid),
                    where('createdAt', '>=', startOfMonth)
                );
                
                const snap = await getDocs(qShares);
                setMonthlySharesCount(snap.size);
            } catch (e) {
                console.error('Error fetching monthly shares:', e);
            }
        };

        fetchMonthlyShares();
    }, [currentUser]);

    const greeting = getSanctuaryGreeting();
    const quoteIndex = new Date().getDate() % greeting.quotes.length;
    const activeQuote = greeting.quotes[quoteIndex];

    useEffect(() => {
        if (!showBreathingModal) return;
        setBreathePhase('Inhale');
        setBreatheSeconds(4);

        let phase = 'Inhale';
        let secs = 4;

        const timer = setInterval(() => {
            secs--;
            if (secs <= 0) {
                if (phase === 'Inhale') {
                    phase = 'Hold';
                    secs = 4;
                } else if (phase === 'Hold') {
                    phase = 'Exhale';
                    secs = 4;
                } else {
                    phase = 'Inhale';
                    secs = 4;
                }
                setBreathePhase(phase);
            }
            setBreatheSeconds(secs);
        }, 1000);

        return () => clearInterval(timer);
    }, [showBreathingModal]);

    const todayDateStr = new Date().toISOString().split('T')[0];

    useEffect(() => {
        // Defer secondary data (count & prompt) to prioritize the post feed
        const loadSecondary = () => {
            fetchDailyPrompt();
            fetchPostCount();
        };

        const idleId = window.requestIdleCallback ? requestIdleCallback(loadSecondary) : setTimeout(loadSecondary, 2000);
        return () => window.cancelIdleCallback ? cancelIdleCallback(idleId) : clearTimeout(idleId);
    }, [todayDateStr]);

    const fetchPostCount = async () => {
        try {
            const snap = await getCountFromServer(collection(db, 'posts'));
            setLivePostCount(snap.data().count);
        } catch (e) {
            // silently fail
        }
    };

    const fetchDailyPrompt = async () => {
        try {
            const q = query(
                collection(db, 'daily_prompts'),
                where('isActive', '==', true),
                where('activeDate', '==', todayDateStr),
                limit(1)
            );
            const snap = await getDocs(q);
            if (!snap.empty) {
                setDailyPrompt({ id: snap.docs[0].id, ...snap.docs[0].data() });
            }
        } catch (e) {
            console.error('Error fetching daily prompt:', e);
        }
    };

    return (
        <div className="home-container">
            <SEO
                title={currentUser ? 'Peace of Mind | SoulThread Sanctuary' : 'Mental Health Support & Anonymous Venting Sanctuary | SoulThread'}
                description={currentUser ? 'Your active anonymous mental health support feed.' : 'SoulThread is the first anonymous mental health support platform made for all age groups, built entirely on real-life data and lived experiences. Vent anonymously, connect with peer support, and find peace without judgment or names.'}
                image="https://soulthread.in/logo.jpg"
                url="https://soulthread.in/"
                keywords="mental health support, anonymous mental health app, free peer support, vent anonymously online, anxiety and depression support community, emotional sharing platform, teen and adult mental health, real-life mental health experiences"
                schema={{
                    '@context': 'https://schema.org',
                    '@graph': [
                        {
                            '@type': 'WebSite',
                            name: 'SoulThread',
                            url: 'https://soulthread.in/',
                            description: 'The first anonymous mental health support platform based on real-life data and experiences.',
                            potentialAction: {
                                '@type': 'SearchAction',
                                target: 'https://soulthread.in/explore?q={search_term_string}',
                                'query-input': 'required name=search_term_string'
                            }
                        },
                        {
                            '@type': 'Organization',
                            name: 'SoulThread',
                            url: 'https://soulthread.in/',
                            logo: 'https://soulthread.in/logo.jpg',
                            description: 'SoulThread is the first anonymous mental health support platform made for all age groups, based on real-life data and lived experiences. Share what is on your mind, connect with peers, and get support without revealing who you are.',
                            contactPoint: {
                                '@type': 'ContactPoint',
                                contactType: 'customer support',
                                email: 'support@soulthread.in'
                            }
                        },
                        {
                            '@type': 'FAQPage',
                            'mainEntity': [
                                {
                                    '@type': 'Question',
                                    'name': 'Is it actually anonymous?',
                                    'acceptedAnswer': {
                                        '@type': 'Answer',
                                        'text': 'Yes. No real name, no email shown to anyone, no way for other users to figure out who you are. You get a random made-up name when you sign up, and screenshots are blocked inside the app.'
                                    }
                                },
                                {
                                    '@type': 'Question',
                                    'name': 'How can I talk to someone anonymously online?',
                                    'acceptedAnswer': {
                                        '@type': 'Answer',
                                        'text': 'Join SoulThread, pick an anonymous name, and post what\'s on your mind. Real people and peer mentors respond, and nothing you share is ever tied back to your real identity.'
                                    }
                                },
                                {
                                    '@type': 'Question',
                                    'name': 'Is SoulThread free to use?',
                                    'acceptedAnswer': {
                                        '@type': 'Answer',
                                        'text': 'Yes — posting, venting, and connecting with the community costs nothing and always will. Optional in-depth series are available if you want more structured guidance.'
                                    }
                                }
                            ]
                        }
                    ]
                }}
            />

            {!currentUser ? (
                <GuestLanding isNativeApp={isNativeApp} />
            ) : (
                <>
                    <div style={{ maxWidth: '680px', margin: '0 auto', padding: '8px 0 140px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {/* 1. Greeting Card */}
                    <div style={{ padding: '8px 4px 4px' }}>
                        <h1 className="welcome-headline-premium" style={{ fontFamily: 'var(--font-display)' }}>
                            {greeting.text}{currentUser.displayName ? `, ${currentUser.displayName.split(' ')[0]}` : ''}
                        </h1>
                        <p className="sanctuary-quote">"{activeQuote}"</p>
                        {monthlySharesCount > 0 && (
                            <div style={{
                                marginTop: '12px',
                                fontSize: '13px',
                                color: 'var(--color-text-secondary)',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}>
                                <span>🌱</span>
                                <span>You've shared {monthlySharesCount} {monthlySharesCount === 1 ? 'time' : 'times'} this month</span>
                            </div>
                        )}
                    </div>

                    {/* 2. Mood check-in */}
                    <div className="sanctuary-mood-panel">
                        <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontStyle: 'italic', marginBottom: '10px', fontWeight: '400' }}>
                          how's your heart right now?
                        </p>
                        <div className="mood-chips-container no-scrollbar">
                            {Object.entries(SUPPORTIVE_MOODS).map(([moodKey, mVal]) => (
                                <button
                                    key={moodKey}
                                    type="button"
                                    onClick={() => {
                                        const next = activeMood === moodKey ? null : moodKey;
                                        setActiveMood(next);
                                        if (next && MOOD_TO_CATEGORY[next]) {
                                            setSelectedCategory(MOOD_TO_CATEGORY[next]);
                                        } else if (next === null) {
                                            setSelectedCategory(null);
                                        }
                                    }}
                                    className={`mood-chip-btn ${activeMood === moodKey ? 'active' : ''}`}
                                    style={activeMood === moodKey ? {
                                        background: mVal.bg,
                                        borderColor: mVal.color,
                                        color: mVal.color,
                                        boxShadow: `0 0 12px ${mVal.bg}`,
                                        borderLeft: `4px solid ${mVal.color}`
                                    } : { borderLeft: '4px solid transparent' }}
                                >
                                    {mVal.emoji} {moodKey}
                                </button>
                            ))}
                        </div>
                        {activeMood && (
                            <div className="mood-reply-box animate-fade-in" style={{ borderColor: SUPPORTIVE_MOODS[activeMood].color }}>
                                <p className="mood-reply-text">{SUPPORTIVE_MOODS[activeMood].reply}</p>
                            </div>
                        )}
                        {activeMood && (
                          <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: '6px 0 0 2px', fontStyle: 'italic' }}>
                            Showing posts related to how you're feeling
                          </p>
                        )}
                    </div>
                    {/* 4. Slim Compose Bar */}
                    <div 
                        className="slim-compose-bar"
                        onClick={() => setShowCreateModal(true)}
                        style={{ margin: 0 }}
                    >
                        <img 
                            src={currentUser?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.uid || 'anon'}`} 
                            alt="avatar" 
                            className="compose-avatar" 
                        />
                        <span className="compose-placeholder">What's on your mind?</span>
                        <button className="compose-post-btn" onClick={e => { e.stopPropagation(); setShowCreateModal(true); }}>Post</button>
                    </div>
                    
                    {/* 5. Category Filter */}
                    <div className="feed-category-filter no-scrollbar" style={{ margin: 0 }}>
                        <button
                            className={`feed-cat-btn ${!selectedCategory ? 'active' : ''}`}
                            onClick={() => setSelectedCategory(null)}
                        >
                            All
                        </button>
                        {CATEGORY_LIST.map(cat => (
                            <button
                                key={cat.id}
                                className={`feed-cat-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                                style={{}}
                                onClick={() => setSelectedCategory(prev => prev === cat.id ? null : cat.id)}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    {/* 6. Feed List */}
                    <FeedList filterCategory={selectedCategory} />
                </div>

                    <div className="secondary-content-section">
                        {dailyPrompt && !isNativeApp && (
                            <div style={{ marginTop: '20px' }}>
                                <DailyPrompt dailyPrompt={dailyPrompt} isGuest={false} />
                            </div>
                        )}
                    </div>

                    {!isNativeApp && (
                        <div className="home-footer-content">
                            <div className="app-download-banner">
                                <div className="download-content">
                                    <div style={{ flex: 1, minWidth: '260px' }}>
                                        <h2 className="download-title">Executive Access Anytime.</h2>
                                        <p className="download-text">Secure the native Android sanctuary for a seamless, encrypted mobile experience.</p>
                                        <a href="/download/soulthread.apk" download="SoulThread.apk" className="download-link">
                                            <Download size={20} />
                                            <span>Download SoulThread Early Access</span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Floating Compose Button */}
                    <button className="floating-share-btn" onClick={() => setShowCreateModal(true)}>
                        <Plus size={20} className="floating-share-plus" />
                        <span className="floating-share-text">Share a thought</span>
                        <div className="floating-share-arrow-wrapper">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                                <polyline points="12 5 19 12 12 19"></polyline>
                            </svg>
                        </div>
                    </button>

                    {/* Compose Modal */}
                    {showCreateModal && (
                        <div className="create-post-modal-overlay" onClick={closeCreateModal}>
                            <div className="create-post-modal-content" onClick={(e) => e.stopPropagation()}>
                                <button className="create-post-modal-close" onClick={closeCreateModal}>
                                    <X size={20} />
                                </button>
                                <CreatePost onPostCreated={closeCreateModal} />
                            </div>
                        </div>
                    )}
                    {/* ── BREATHE OVERLAY (LOCAL TO DASHBOARD) ── */}
                    {showBreathingModal && (
                        <div style={{
                            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                            background: 'rgba(10,22,20,0.98)',
                            backdropFilter: 'blur(24px)', zIndex: 3000,
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <button onClick={() => setShowBreathingModal(false)} style={{
                                position: 'absolute', top: '30px', right: '30px',
                                fontSize: '13px', fontWeight: '700', cursor: 'pointer', color: 'white',
                                padding: '10px 20px', borderRadius: '30px', background: 'rgba(255,255,255,0.08)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                display: 'flex', alignItems: 'center', gap: '8px'
                            }}>
                                <X size={14} />
                                Exit
                            </button>
                            <div className="breathing-circle-wrapper" style={{
                                width: '200px', height: '200px', borderRadius: '50%',
                                background: 'linear-gradient(135deg, #0d9488 0%, #8b5cf6 100%)',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                fontSize: '22px', fontWeight: '700', color: 'white',
                                animation: 'breathing-pulse 4s ease-in-out infinite',
                                boxShadow: '0 0 60px rgba(13,148,136,0.3)',
                            }}>
                                <span style={{ fontSize: '24px', fontWeight: '800' }}>{breathePhase}</span>
                                <span style={{ fontSize: '14px', opacity: 0.8, marginTop: '4px' }}>{breatheSeconds}s</span>
                            </div>
                            <p style={{ marginTop: '40px', fontSize: '18px', textAlign: 'center', color: 'rgba(255,255,255,0.7)', lineHeight: '1.6', maxWidth: '280px' }}>
                                Slow down. Follow the pulse.<br />You are safe. You are here.
                            </p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default React.memo(Home);
