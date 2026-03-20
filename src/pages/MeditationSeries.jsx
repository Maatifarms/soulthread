import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { SUBSCRIPTION_TIERS, sustainability } from '../services/sustainabilityModel';
import { paymentService } from '../services/paymentService';
import DesktopLayoutWrapper from '../components/layout/DesktopLayoutWrapper';
import SEO from '../components/common/SEO';
import Breadcrumbs from '../components/common/Breadcrumbs';
import './MeditationSeries.css';

const meditationTracks = [
    {
        level: 1,
        title: "Level 1: The Still Seed",
        subtitle: "For the absolute beginner.",
        description: "A 5-minute introduction to the art of noticing. No pressure, no judgment—just presence.",
        duration: "5:00",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", // Placeholder
        perk: "Low impact, high awareness."
    },
    {
        level: 2,
        title: "Level 2: The Growing Vine",
        subtitle: "For the occasional practitioner.",
        description: "A 10-minute deep dive into breathwork and body scans. Learn to anchor yourself in the now.",
        duration: "10:00",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3", // Placeholder
        perk: "Building emotional resilience."
    },
    {
        level: 3,
        title: "Level 3: The Radiant Forest",
        subtitle: "For the practiced mind.",
        description: "A 15-minute visualization journey. Expanding your compassion and inner light.",
        duration: "15:00",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3", // Placeholder
        perk: "Spiritual cultivation & metta."
    }
];

const MeditationSeries = () => {
    const { currentUser } = useAuth();
    const [isPro, setIsPro] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activeTrack, setActiveTrack] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const audioRef = useRef(new Audio());

    useEffect(() => {
        const checkAccess = async () => {
            if (currentUser) {
                const hasPro = await sustainability.verifyAccess(currentUser, SUBSCRIPTION_TIERS.PRO);
                setIsPro(hasPro);
            }
            setLoading(false);
        };
        checkAccess();

        return () => {
            audioRef.current.pause();
            audioRef.current.src = "";
        };
    }, [currentUser]);

    const handlePlayTrack = (track) => {
        if (!isPro) return;
        
        if (activeTrack?.level === track.level) {
            if (isPlaying) {
                audioRef.current.pause();
                setIsPlaying(false);
            } else {
                audioRef.current.play();
                setIsPlaying(true);
            }
        } else {
            audioRef.current.pause();
            audioRef.current.src = track.url;
            audioRef.current.play();
            setActiveTrack(track);
            setIsPlaying(true);
        }
    };

    useEffect(() => {
        const audio = audioRef.current;
        const updateProgress = () => {
            setProgress((audio.currentTime / audio.duration) * 100);
        };
        audio.addEventListener('timeupdate', updateProgress);
        audio.addEventListener('ended', () => setIsPlaying(false));
        return () => {
            audio.removeEventListener('timeupdate', updateProgress);
        };
    }, []);

    if (loading) return <div className="zen-loader">Inhaling...</div>;

    return (
        <DesktopLayoutWrapper>
            <SEO 
                title="Inner Bloom: Meditation Series | SoulThread" 
                description="Experience a sensory journey from the neon of Seoul to the serenity of the countryside. 3 levels of professional meditation for the modern seeker."
            />
            <Breadcrumbs />
            
            <div className="meditation-page">
                {/* Hero Header */}
                <motion.header 
                    className="meditation-hero"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.2 }}
                >
                    <div className="hero-content">
                        <span className="hero-kicker">Inner Bloom Journey</span>
                        <h1>Phase 4: The Art of Silence</h1>
                        <p>A guided sensory experience for the restless mind.</p>
                    </div>
                    <div className="hero-visual">
                        <img src="file:///C:/Users/acer/.gemini/antigravity/brain/ae86f859-48ac-4dd2-a4db-e994a781d018/seoul_to_zen_journey_1773946340115.png" alt="Seoul to Zen Journey" />
                    </div>
                </motion.header>

                <div className="meditation-main">
                    {/* Levels Section */}
                    <section className="levels-section">
                        <div className="levels-header">
                            <h2>The Resilience Path</h2>
                            <p>Three levels of practice, each designed to cultivate a specific layer of your inner sanctuary.</p>
                        </div>

                        <div className="levels-grid">
                            {meditationTracks.map((track) => (
                                <motion.div 
                                    key={track.level}
                                    className={`level-card ${activeTrack?.level === track.level ? 'active' : ''}`}
                                    whileHover={{ scale: 1.02 }}
                                    onClick={() => handlePlayTrack(track)}
                                >
                                    <div className={`level-badge level-${track.level}`}>LEVEL {track.level}</div>
                                    <h3>{track.title}</h3>
                                    <p className="level-subtitle">{track.subtitle}</p>
                                    <p className="level-desc">{track.description}</p>
                                    <div className="level-footer">
                                        <span className="duration">⏳ {track.duration}</span>
                                        <button className="play-circle-btn">
                                            {activeTrack?.level === track.level && isPlaying ? '⏸' : '▶'}
                                        </button>
                                    </div>
                                    
                                    {!isPro && (
                                        <div className="level-lock">
                                            <span>🛡️ Pro Member Exclusive</span>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </section>

                    {/* Immersive Player / Breath Guide */}
                    <AnimatePresence>
                        {activeTrack && (
                            <motion.section 
                                className="immersive-player-box"
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 50 }}
                            >
                                <div className="player-layout">
                                    <div className="breath-guide-container">
                                        <motion.div 
                                            className="breath-circle"
                                            animate={{
                                                scale: isPlaying ? [1, 1.4, 1] : 1,
                                                opacity: isPlaying ? [0.4, 0.8, 0.4] : 0.4
                                            }}
                                            transition={{
                                                duration: 8,
                                                repeat: Infinity,
                                                ease: "easeInOut"
                                            }}
                                        />
                                        <div className="breath-text">
                                            {isPlaying ? 'Breathe with the light' : 'Awaken the seed'}
                                        </div>
                                    </div>

                                    <div className="player-controls">
                                        <div className="now-playing-info">
                                            <span className="now-playing-label">Now Practicing</span>
                                            <h4>{activeTrack.title}</h4>
                                        </div>
                                        <div className="progress-bar-container">
                                            <div className="progress-bar" style={{ width: `${progress}%` }} />
                                        </div>
                                        <div className="player-btns">
                                            <button 
                                                className="btn-play-prime"
                                                onClick={() => handlePlayTrack(activeTrack)}
                                            >
                                                {isPlaying ? 'PAUSE' : 'RESUME'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.section>
                        )}
                    </AnimatePresence>

                    {!isPro && (
                        <div className="meditation-upsell">
                            <div className="upsell-card-zen">
                                <h2>Unlock the Full Bloom</h2>
                                <p>Deep meditation tracks, expert circles, and unlimited growth series—all in one membership.</p>
                                <button className="zen-upgrade-btn" onClick={() => window.location.href='/pricing'}>
                                    Upgrade to Soul Pro — ₹499/mo
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DesktopLayoutWrapper>
    );
};

export default MeditationSeries;
