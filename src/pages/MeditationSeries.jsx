import React, { useState, useEffect, useRef } from 'react';
import { Clock, Play, Pause, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { SUBSCRIPTION_TIERS, sustainability } from '../services/sustainabilityModel';
import { paymentService } from '../services/paymentService';
import DesktopLayoutWrapper from '../components/layout/DesktopLayoutWrapper';
import SEO from '../components/common/SEO';
import Breadcrumbs from '../components/common/Breadcrumbs';
import SeriesPaywall from '../components/series/SeriesPaywall';
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
    const navigate = useNavigate();
    const [isPremium, setIsPremium] = useState(false);
    const [isFreeUnlocked, setIsFreeUnlocked] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentError, setPaymentError] = useState('');
    const [loading, setLoading] = useState(true);
    const [activeTrack, setActiveTrack] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const audioRef = useRef(new Audio());

    const handleUnlock = async (isFree = false) => {
        if (isFree) {
            setIsFreeUnlocked(true);
            return;
        }

        setPaymentError('');
        if (!currentUser) {
            navigate('/login');
            return;
        }

        setIsProcessing(true);
        try {
            const tier = sustainability.getTierDetails(SUBSCRIPTION_TIERS.BASIC);
            await paymentService.initializeRazorpay(currentUser, { ...tier, id: SUBSCRIPTION_TIERS.BASIC }, tier.price);
            setIsPremium(true);
        } catch (error) {
            console.error("Unlock failed:", error);
            setPaymentError('Payment was cancelled or failed. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    useEffect(() => {
        const checkAccess = async () => {
            if (currentUser) {
                const hasAccess = await sustainability.verifyAccess(currentUser, SUBSCRIPTION_TIERS.BASIC);
                setIsPremium(hasAccess);
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
        const midPoint = Math.floor(meditationTracks.length / 2);
        const isLocked = track.level > (midPoint + 1) && !isPremium && !isFreeUnlocked && !currentUser?.isAdmin;
        
        if (isLocked) return;
        
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
                        <img src="https://images.unsplash.com/photo-1545389336-cf090694435e?auto=format&fit=crop&q=80&w=1200" alt="Seoul to Zen Journey" />
                    </div>
                </motion.header>

                <div className="meditation-main">
                    <section className="levels-section">
                        <div className="levels-header">
                            <h2>The Resilience Path</h2>
                            <p>Three levels of practice, each designed to cultivate a specific layer of your inner sanctuary.</p>
                        </div>

                        <div className="levels-grid">
                            {meditationTracks.map((track) => {
                                const midPoint = Math.floor(meditationTracks.length / 2);
                                const isLocked = track.level > (midPoint + 1) && !isPremium && !isFreeUnlocked && !currentUser?.isAdmin;
                                return (
                                    <motion.div 
                                        key={track.level}
                                        className={`level-card ${activeTrack?.level === track.level ? 'active' : ''} ${isLocked ? 'locked' : ''}`}
                                        whileHover={{ scale: 1.02 }}
                                        onClick={() => handlePlayTrack(track)}
                                    >
                                        <div className={`level-badge level-${track.level}`}>LEVEL {track.level}</div>
                                        <h3>{track.title}</h3>
                                        <p className="level-subtitle">{track.subtitle}</p>
                                        <p className="level-desc">{track.description}</p>
                                        <div className="level-footer">
                                            <span className="duration" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Clock size={14} /> {track.duration}
                                            </span>
                                            <button className="play-circle-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                {activeTrack?.level === track.level && isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
                                            </button>
                                        </div>
                                        
                                        {isLocked && (
                                            <div className="level-lock" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <ShieldCheck size={16} /> <span>Pro Member Exclusive</span>
                                            </div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>
                    </section>

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
                                        {(() => {
                                            const midPoint = Math.floor(meditationTracks.length / 2);
                                            const isLocked = activeTrack.level > (midPoint + 1) && !isPremium && !isFreeUnlocked && !currentUser?.isAdmin;
                                            return isLocked ? (
                                                <SeriesPaywall
                                                    seriesId="the-void-meditation"
                                                    seriesTitle="The Void: Advanced Meditation"
                                                    onUnlock={handleUnlock}
                                                    isProcessing={isProcessing}
                                                    paymentError={paymentError}
                                                />
                                            ) : (
                                                <>
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
                                                </>
                                            );
                                        })()}
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

                    {!isPremium && !isFreeUnlocked && (
                        <div className="meditation-upsell">
                            <div className="upsell-card-zen">
                                <h2>Unlock the Full Bloom</h2>
                                <p>Deep meditation tracks, expert circles, and unlimited growth series—all in one membership.</p>
                                <button className="zen-upgrade-btn" onClick={handleUnlock}>
                                    Upgrade to Soul Basic — ₹199/mo
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
