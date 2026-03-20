import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FeedList from '../components/feed/FeedList';
import CreatePost from '../components/post/CreatePost';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, limit, getDocs, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Capacitor } from '@capacitor/core';
import { useStreak } from '../hooks/useStreak';
import ReflectionWall from '../components/home/ReflectionWall';
import './Home.css';

// Extracted components
import HeroSection from '../components/home/HeroSection';
import DailyPrompt from '../components/home/DailyPrompt';
import MoodCheckIn from '../components/home/MoodCheckIn';
import SEO from '../components/common/SEO';

const isNativeApp = Capacitor.isNativePlatform();

const TOPIC_FILTERS = [
    { id: 'all', label: 'All' },
    { id: 'Mindset', label: 'Mindset' },
    { id: 'Anxiety', label: 'Anxiety' },
    { id: 'Growth', label: 'Growth' },
    { id: 'Focus', label: 'Focus' },
    { id: 'Relationships', label: 'Relationships' },
    { id: 'Spirituality', label: 'Spirituality' },
    { id: 'Self-discipline', label: 'Self-discipline' },
    { id: 'Motivation', label: 'Motivation' }
];

const Home = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const streak = useStreak();
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [dailyPrompt, setDailyPrompt] = useState(null);
    const [hasSubmittedMood, setHasSubmittedMood] = useState(true);
    const [selectedMood, setSelectedMood] = useState(null);

    const todayDateStr = new Date().toISOString().split('T')[0];

    useEffect(() => {
        const init = async () => {
            const tasks = [fetchDailyPrompt()];
            if (currentUser) tasks.push(checkUserMood());
            else setHasSubmittedMood(true);
            await Promise.all(tasks);
        };
        init();
    }, [currentUser, todayDateStr]);

    const fetchDailyPrompt = async () => {
        try {
            const q = query(collection(db, 'daily_prompts'), 
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

    const checkUserMood = async () => {
        try {
            const q = query(collection(db, 'daily_moods'), 
                where('userId', '==', currentUser.uid), 
                where('date', '==', todayDateStr), 
                limit(1)
            );
            const snap = await getDocs(q);
            setHasSubmittedMood(!snap.empty);
        } catch (e) { 
            console.error('Error checking mood:', e); 
        }
    };

    const handleMoodSelect = async (mood) => {
        try {
            setSelectedMood(mood);
            const moodId = `${currentUser.uid}_${todayDateStr}`;
            await setDoc(doc(db, 'daily_moods', moodId), { 
                userId: currentUser.uid, 
                mood, 
                date: todayDateStr, 
                createdAt: serverTimestamp() 
            });
            setTimeout(() => setHasSubmittedMood(true), 800);
        } catch (e) { 
            console.error('Mood save failed:', e);
            alert('Mood save failed: ' + e.message); 
        }
    };

    return (
        <div className="home-container">
            <SEO 
                title={currentUser ? "Peace of Mind | SoulThread Sanctuary" : "SoulThread: Mental Health Support Community & Anonymous Sanctuary"}
                description="The leading anonymous peer support community for mental health, anxiety relief, and psychological growth. Share stories, learn from experts, and find digital peace."
                image="https://soulthread.in/assets/seo/home_share.png"
                url="https://soulthread.in/"
                keywords="mental health support, anonymous therapy alternative, anxiety relief india, peer support community, mindset training, freud hindi, david goggins series"
                schema={{
                    "@context": "https://schema.org",
                    "@graph": [
                        {
                            "@type": "WebSite",
                            "name": "SoulThread",
                            "url": "https://soulthread.in/",
                            "potentialAction": {
                                "@type": "SearchAction",
                                "target": "https://soulthread.in/explore?q={search_term_string}",
                                "query-input": "required name=search_term_string"
                            }
                        },
                        {
                            "@type": "Organization",
                            "name": "SoulThread",
                            "url": "https://soulthread.in/",
                            "logo": "https://soulthread.in/logo.jpg",
                            "description": "A compassionate sanctuary for mental wellness and community storytelling.",
                            "contactPoint": {
                                "@type": "ContactPoint",
                                "contactType": "customer support",
                                "email": "support@soulthread.in"
                            }
                        }
                    ]
                }}
            />
            {/* ── Hero (logged out) ── */}
            {!currentUser && <HeroSection isNativeApp={isNativeApp} />}

            {/* ── Main Layout Wrapper ── */}
            <div className="feed-content">
                <div className="feed-column">

                    {/* Logged-in Welcome Bar - Desktop Only */}
                    {currentUser && !isNativeApp && (
                        <div className="welcome-bar animate-fade-in">
                            <div>
                                <h1 className="welcome-title">
                                    Peace of Mind{currentUser.displayName ? `, ${currentUser.displayName.split(' ')[0]}` : ''}
                                </h1>
                                <p className="welcome-subtitle">
                                    Explore the shared wisdom of our community today. 
                                    {streak > 1 && (
                                        <span className="streak-badge animate-pulse" style={{ 
                                            marginLeft: '12px', background: 'var(--color-accent)', 
                                            color: 'white', padding: '2px 10px', borderRadius: '12px',
                                            fontSize: '0.75rem', fontWeight: '900'
                                        }}>
                                            🔥 {streak} DAY STREAK
                                        </span>
                                    )}
                                </p>
                            </div>
                            <div className="welcome-actions">
                                <Link to="/crisis" className="premium-btn-link">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                    </svg>
                                    Expert Support
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* Daily Prompt - Desktop Only */}
                    {currentUser && dailyPrompt && !isNativeApp && (
                        <DailyPrompt dailyPrompt={dailyPrompt} />
                    )}

                    {/* Mood Check-in - Desktop Only */}
                    {currentUser && !hasSubmittedMood && !isNativeApp && (
                        <MoodCheckIn handleMoodSelect={handleMoodSelect} selectedMood={selectedMood} />
                    )}

                    {/* Topic Filters - Show on Native App and Mobile Web/Tablet */}
                    {(isNativeApp || (!isNativeApp && window.innerWidth <= 1024)) && (
                        <div className="topic-filters-scroll hide-scrollbar">
                            {TOPIC_FILTERS.map(topic => (
                                <button
                                    key={topic.id}
                                    onClick={() => setSelectedCategory(topic.id === 'all' ? null : topic.id)}
                                    className={`topic-filter-btn ${(selectedCategory === topic.id || (topic.id === 'all' && !selectedCategory)) ? 'active' : ''}`}
                                >
                                    {topic.label}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Post Composer - Top for ALL platforms (desktop, mobile web, APK) */}
                    <CreatePost />

                    {/* ── GLOBAL REFLECTION WALL (Phase 7) ── */}
                    <ReflectionWall />

                    {/* Main Posts Feed */}
                    <FeedList filterCategory={selectedCategory} />
                </div>
            </div>

            {/* ── Footer Sections (Web Only) ── */}
            {!isNativeApp && (
                <div style={{ marginTop: '40px' }}>
                    {/* Stats Bar */}
                    {!currentUser && (
                        <div className="stats-bar">
                            <div className="stats-grid">
                                {[
                                    { num: '10,000+', label: 'Stories Shared', icon: '💬' },
                                    { num: '50+', label: 'Psychologists', icon: '🧠' },
                                    { num: '100%', label: 'Confidential', icon: '🔒' },
                                ].map(stat => (
                                    <div key={stat.label}>
                                        <div className="stat-item-icon">{stat.icon}</div>
                                        <div className="stat-item-num">{stat.num}</div>
                                        <div className="stat-item-label">{stat.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* App Download Banner */}
                    <div className="app-download-banner">
                        <div className="download-content">
                            <div style={{ flex: 1, minWidth: '260px' }}>
                                <h2 className="download-title">Carry SoulThread in Your Pocket</h2>
                                <p className="download-text">Get the native Android app for a better mobile experience.</p>
                                <a href="/download/soulthread.apk" download="SoulThread.apk" className="download-link">
                                    Android APK Download
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* ── SEARCH ENGINE DOMINANCE FOOTER (Phase 8: Brand-Anchoring) ── */}
                    <footer className="seo-optimized-footer">
                        <div className="seo-footer-content">
                            <h3>SoulThread India – The Anonymous Mental Health Sanctuary</h3>
                            <p>
                                SoulThread (soulthread.in) is the leading anonymous peer support community for mental wellness in India. 
                                Our mission is to provide an anxiety-relief sanctuary for souls looking for growth, psychological peace, 
                                and mindset training. We are a specialized mental health community platform established to help Indians share 
                                stories of resilience, not a clothing or gym wear brand. Explore our "Never Finished" series, 
                                "Hyperfocus Architect" toolkit, and "Ego vs Id" psychology series today.
                            </p>
                            <nav className="seo-links">
                                <Link to="/hyperfocus-series">Hyperfocus Training</Link>
                                <Link to="/never-finished-series">Goggins Mental Toughness</Link>
                                <Link to="/ego-id-series">Freud & Psychology India</Link>
                                <a href="https://www.instagram.com/soulthread_community/" target="_blank" rel="noopener noreferrer">Community Stories</a>
                                <Link to="/explore">Anonymous Feed</Link>
                            </nav>
                        </div>
                    </footer>
                </div>
            )}
        </div>
    );
};

export default Home;
