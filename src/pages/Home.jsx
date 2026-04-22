import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, limit, getDocs, getCountFromServer } from 'firebase/firestore';
import { Capacitor } from '@capacitor/core';
import FeedList from '../components/feed/FeedList';
import CreatePost from '../components/post/CreatePost';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../services/firebase';
import HeroSection from '../components/home/HeroSection';
import SanctuaryPillars from '../components/home/SanctuaryPillars';
import DailyPrompt from '../components/home/DailyPrompt';
import SEO from '../components/common/SEO';
import { CATEGORIES } from '../data/categories';
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
    Download
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

const HOME_CATEGORIES = [{ id: 'all', label: 'All', icon: 'Layout' }, ...CATEGORIES];

const Home = () => {
    const { currentUser } = useAuth();
    const [selectedCategory, setSelectedCategory] = useState(currentUser?.feedFocus !== 'all' ? currentUser?.feedFocus : null);
    const [dailyPrompt, setDailyPrompt] = useState(null);
    const [livePostCount, setLivePostCount] = useState(null);

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
                title={currentUser ? 'Peace of Mind | SoulThread Sanctuary' : 'Anonymous Emotional Support & Safe Space | SoulThread'}
                description="Need a safe space to talk anonymously? Join SoulThread, the leading online venting platform for emotional support, anxiety relief, and mental wellness conversations."
                image="https://soulthread.in/assets/seo/home_share.png"
                url="https://soulthread.in/"
                keywords="anonymous emotional support, venting platform, safe space to talk anonymously, find emotional support online, mental health community, anonymous therapy alternative"
                schema={{
                    '@context': 'https://schema.org',
                    '@graph': [
                        {
                            '@type': 'WebSite',
                            name: 'SoulThread',
                            url: 'https://soulthread.in/',
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
                            description: 'A compassionate sanctuary for mental wellness and community storytelling.',
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
                                    'name': 'Is SoulThread truly anonymous?',
                                    'acceptedAnswer': {
                                        '@type': 'Answer',
                                        'text': 'Yes, SoulThread is designed from the ground up to be a safe, anonymous space. You can share your story without revealing your identity.'
                                    }
                                },
                                {
                                    '@type': 'Question',
                                    'name': 'How can I get emotional support online?',
                                    'acceptedAnswer': {
                                        '@type': 'Answer',
                                        'text': 'You can join the SoulThread community to share your journey anonymously and receive support from peers and experts in a safe sanctuary.'
                                    }
                                },
                                {
                                    '@type': 'Question',
                                    'name': 'Is there a cost to use SoulThread?',
                                    'acceptedAnswer': {
                                        '@type': 'Answer',
                                        'text': 'SoulThread offers many free community features including anonymous posting and peer support. We also offer premium expert-led series and sessions.'
                                    }
                                }
                            ]
                        }
                    ]
                }}
            />

            {!currentUser ? (
                /* ── GUEST DISCOVERY JOURNEY ── */
                <div className="guest-hero-shell">
                    <HeroSection isNativeApp={isNativeApp} />
                    
                    {!isNativeApp && (
                        <>
                            <div className="stats-bar-integrated">
                                <div className="stats-grid">
                                    {[
                                        { 
                                            num: livePostCount ? `${livePostCount.toLocaleString()}+` : '12k+', 
                                            label: 'Safe Narratives', 
                                            icon: <MessageCircle size={22} color="var(--color-primary)" /> 
                                        },
                                        { 
                                            num: '50+', 
                                            label: 'Verified Clinicians', 
                                            icon: <Brain size={22} color="var(--color-primary)" /> 
                                        },
                                        { 
                                            num: '100%', 
                                            label: 'Privacy Protocol', 
                                            icon: <ShieldCheck size={22} color="var(--color-primary)" /> 
                                        },
                                    ].map((stat) => (
                                        <div key={stat.label} className="stat-pill">
                                            <div className="stat-pill-icon">{stat.icon}</div>
                                            <div className="stat-pill-info">
                                                <span className="stat-pill-num">{stat.num}</span>
                                                <span className="stat-pill-label">{stat.label}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <SanctuaryPillars />
                        </>
                    )}
                </div>
            ) : (
                /* ── MEMBER EXECUTIVE HUB ── */
                <div className="member-welcome-shell">
                    {!isNativeApp && (
                        <div className="welcome-header">
                            <div>
                                <div className="discovery-section-label" style={{ textAlign: 'left', marginBottom: '8px' }}>Active Sanctuary</div>
                                <h1 className="welcome-headline">
                                    Peace of Mind{currentUser.displayName ? `, ${currentUser.displayName.split(' ')[0]}` : ''}
                                </h1>
                                <p className="welcome-subline">Continue your narrative within the circle.</p>
                            </div>
                            <Link to="/crisis" className="premium-action-btn">
                                <Sparkles size={16} />
                                <span>Expert Support</span>
                            </Link>
                        </div>
                    )}
                    <div className="hero-post-box-container">
                        <CreatePost />
                    </div>
                </div>
            )}

            <div className="home-content-body">
                <div className="discovery-section-label">Rising Narratives</div>
                
                <div className="home-topic-filter-shell">
                    <div className="topic-filters-scroll hide-scrollbar">
                        {HOME_CATEGORIES.map((topic) => (
                            <button
                                key={topic.id}
                                onClick={() => setSelectedCategory(topic.id === 'all' ? 'all' : topic.id)}
                                className={`topic-filter-btn ${(selectedCategory === topic.id || (topic.id === 'all' && !selectedCategory)) ? 'active' : ''}`}
                                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                            >
                                {topic.icon && ICON_MAP[topic.icon] && React.createElement(ICON_MAP[topic.icon], { size: 14 })}
                                <span>{topic.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <FeedList filterCategory={selectedCategory} />
            </div>

            <div className="secondary-content-section">
                {dailyPrompt && !isNativeApp && (
                    <div style={{ marginTop: '20px' }}>
                        <DailyPrompt dailyPrompt={dailyPrompt} isGuest={!currentUser} />
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
        </div>
    );
};

export default React.memo(Home);
