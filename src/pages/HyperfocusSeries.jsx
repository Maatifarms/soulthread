import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useSpring } from 'framer-motion';
import { analytics } from '../services/analytics';
import { db } from '../services/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { SUBSCRIPTION_TIERS, sustainability } from '../services/sustainabilityModel';
import { paymentService } from '../services/paymentService';
import SEO from '../components/common/SEO';
import Breadcrumbs from '../components/common/Breadcrumbs';
import './HyperfocusSeries.css';

const postsData = [
    {
        id: 1,
        title: "THE ATTENTION FILTER",
        insight: "Your brain doesn't see the world. It filters it. Focus is the art of exclusion.",
        takeaway: "Action: Identify one distraction to cut TODAY.",
        image: "/assets/hyperfocus/post_01.png"
    },
    {
        id: 2,
        title: "THE GATEKEEPER (RAS)",
        insight: "The Reticular Activating System decides what reaches your conscious mind.",
        takeaway: "Action: Write down your #1 goal to 'tune' your RAS.",
        image: "/assets/hyperfocus/post_02.png"
    },
    {
        id: 3,
        title: "OBSERVATION VS SEEING",
        insight: "Seeing is passive. Observation is an active interrogation of reality.",
        takeaway: "Action: Describe a common object in 10 unique details.",
        image: "/assets/hyperfocus/post_03.png"
    },
    {
        id: 4,
        title: "EVOLUTIONARY FOCUS",
        insight: "Your brain evolved for survival, not spreadsheets. Understand your biology.",
        takeaway: "Action: Work in 90-minute 'ultradian' cycles.",
        image: "/assets/hyperfocus/post_04.png"
    },
    {
        id: 5,
        title: "THE DISTRACTION CRISIS",
        insight: "Modern tech is designed to bypass your prefrontal cortex. You are the target.",
        takeaway: "Action: Put your phone in another room for 2 hours.",
        image: "/assets/hyperfocus/post_05.png"
    },
    {
        id: 6,
        title: "SELECTIVE ATTENTION",
        insight: "The brain can only handle bits of data at once. Choose your bits wisely.",
        takeaway: "Action: Focus only on the sound of your breath for 5 mins.",
        image: "/assets/hyperfocus/post_06.png"
    },
    {
        id: 7,
        title: "NEURAL MAPS",
        insight: "Neurons that fire together, wire together. Focus builds your brain's hardware.",
        takeaway: "Action: Practice one difficult skill with total intensity.",
        image: "/assets/hyperfocus/post_07.png"
    },
    {
        id: 8,
        title: "THE CHEMISTRY OF FOCUS",
        insight: "Acetylcholine marks neurons for change. Norepinephrine provides the energy.",
        takeaway: "Action: Use cold water exposure to spike focus neurochemicals.",
        image: "/assets/hyperfocus/post_08.png"
    },
    {
        id: 9,
        title: "THE DOPAMINE TRAP",
        insight: "Dopamine is for seeking, not satisfaction. Novelty is the enemy of depth.",
        takeaway: "Action: Do one 'boring' task without any background noise.",
        image: "/assets/hyperfocus/post_09.png"
    },
    {
        id: 10,
        title: "HYPER AWARENESS",
        insight: "Elevate your baseline awareness. Notice the 'invisible' patterns around you.",
        takeaway: "Action: Try to sense the air temperature on your skin now.",
        image: "/assets/hyperfocus/post_10.png"
    },
    {
        id: 11,
        title: "PATTERN RECOGNITION",
        insight: "Masters see patterns where others see chaos. Focus is the lens.",
        takeaway: "Action: Identify a recurring habit in your daily routine.",
        image: "/assets/hyperfocus/post_11.png"
    },
    {
        id: 12,
        title: "SENSORY INTELLIGENCE",
        insight: "Use your senses to anchor your mind to the present moment.",
        takeaway: "Action: Eat one meal in total silence and focus on taste.",
        image: "/assets/hyperfocus/post_12.png"
    },
    {
        id: 13,
        title: "SELECTIVE IGNORING",
        insight: "Elite focus is defined more by what you ignore than by what you do.",
        takeaway: "Action: Say 'No' to one low-value request today.",
        image: "/assets/hyperfocus/post_13.png"
    },
    {
        id: 14,
        title: "THE MENTAL LABORATORY",
        insight: "Treat every day as an experiment. Test your limits, find your breaking points, and push past them.",
        takeaway: "Action: Try a challenge that you are likely to fail. Learn from the friction.",
        image: "/assets/hyperfocus/post_14.png"
    },
    {
        id: 15,
        title: "CREATE YOUR SAVAGE ALTER EGO",
        insight: "When things get dark, you need a different version of yourself to take the wheel. Someone who loves the rain.",
        takeaway: "Action: Give a name to your most disciplined self. Call on them when it's hard.",
        image: "/assets/hyperfocus/post_15.png"
    },
    {
        id: 16,
        title: "COMFORT IS THE ENEMY",
        insight: "Comfort is the ultimate drug. It kills your ambition and rots your potential.",
        takeaway: "Action: Do something today that makes you feel awkward or uncomfortable.",
        image: "/assets/hyperfocus/post_16.png"
    },
    {
        id: 17,
        title: "DISCIPLINE CHANGES YOUR DNA",
        insight: "Consistency rewires your subconscious. After enough reps, the 'hard' thing becomes your new normal.",
        takeaway: "Action: Pick one small habit and commit to it for 7 days without fail.",
        image: "/assets/hyperfocus/post_17.png"
    },
    {
        id: 18,
        title: "STOP SEEKING SYMPATHY",
        insight: "Sympathy validates your weakness. Stop looking for people to feel sorry for you.",
        takeaway: "Action: For the next 24 hours, do not complain about anything to anyone.",
        image: "/assets/hyperfocus/post_18.png"
    },
    {
        id: 19,
        title: "HUMILITY BUILDS REAL STRENGTH",
        insight: "The second you think you're 'elite', you stop growing. Stay at the bottom of the mountain mentally.",
        takeaway: "Action: Ask someone for feedback on one of your weaknesses.",
        image: "/assets/hyperfocus/post_19.png"
    },
    {
        id: 20,
        title: "THE WAR AGAINST NOISE",
        insight: "Your environment is either a sanctuary or a battleground. Clear the clutter.",
        takeaway: "Action: Delete one app that drains your time today.",
        image: "/assets/hyperfocus/post_20.png"
    },
    {
        id: 21,
        title: "DEEP WORK DEPTHS",
        insight: "Deep work is a superpower in a distracted world. Go where others can't follow.",
        takeaway: "Action: Set a timer for 60 minutes and do only ONE task.",
        image: "/assets/hyperfocus/post_21.png"
    },
    {
        id: 22,
        title: "THE POWER OF BOREDOM",
        insight: "Boredom is where creativity lives. Stop filling every gap with your phone.",
        takeaway: "Action: Sit for 10 minutes with zero stimulation. Just sit.",
        image: "/assets/hyperfocus/post_22.png"
    },
    {
        id: 23,
        title: "FORGE YOUR ATTENTION SPAN",
        insight: "Attention is a muscle. You train it every time you choose to refocus.",
        takeaway: "Action: Read a physical book for 20 minutes without stopping.",
        image: "/assets/hyperfocus/post_23.png"
    },
    {
        id: 24,
        title: "THE ARCHITECT'S VISION",
        insight: "Don't just live in the world. Design how you perceive it.",
        takeaway: "Action: Sketch a plan for your perfect deep-focus workspace.",
        image: "/assets/hyperfocus/post_24.png"
    },
    {
        id: 25,
        title: "ELIMINATE THE VIBRATION",
        insight: "Ghost notifications and phantom vibrations are signs of digital addiction.",
        takeaway: "Action: Turn off ALL non-human notifications on your phone.",
        image: "/assets/hyperfocus/post_25.png"
    },
    {
        id: 26,
        title: "TOTAL OWNERSHIP OF TIME",
        insight: "Time is the only asset you cannot buy back. Stop spending it on garbage.",
        takeaway: "Action: Track every 30-minute block of your day tomorrow.",
        image: "/assets/hyperfocus/post_26.png"
    },
    {
        id: 27,
        title: "THE FLOW STATE TRIGGER",
        insight: "Flow requires a clear goal and immediate feedback. Set the stage.",
        takeaway: "Action: Define exactly what 'finished' looks like for your next task.",
        image: "/assets/hyperfocus/post_27.png"
    },
    {
        id: 28,
        title: "RESILIENT CONCENTRATION",
        insight: "Life will try to break your focus. Be the rock that doesn't move.",
        takeaway: "Action: Practice focus in a noisy environment (like a cafe).",
        image: "/assets/hyperfocus/post_28.png"
    },
    {
        id: 29,
        title: "THE ENDLESS ASCENT",
        insight: "Mastery is not a destination. It is a way of walking. Never stop climbing.",
        takeaway: "Action: Share one thing you learned from this series with a friend.",
        image: "/assets/hyperfocus/post_29.png"
    },
    {
        id: 30,
        title: "BEYOND THE LIMITS",
        insight: "You are the architect of your own reality. Go build something great.",
        takeaway: "Action: Commit to the 30-day focus challenge starting NOW.",
        image: "/assets/hyperfocus/post_30.png"
    }
];

const HyperfocusSeries = () => {
    const { currentUser } = useAuth();
    const [currentPostIndex, setCurrentPostIndex] = useState(0);
    const [completed, setCompleted] = useState(false);
    const [isPremium, setIsPremium] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const seriesRef = useRef(null);

    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    useEffect(() => {
        window.scrollTo(0, 0);

        const checkAccess = async () => {
            const hasAccess = await sustainability.verifyAccess(currentUser, SUBSCRIPTION_TIERS.BASIC);
            setIsPremium(hasAccess);
        };
        checkAccess();

        analytics.logEvent('series_start', { series: 'hyperfocus_architect' });

        document.body.classList.add('hyperfocus-mode');
        return () => {
            document.body.classList.remove('hyperfocus-mode');
        };
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY + window.innerHeight / 2;
            const posts = document.querySelectorAll('.post-block');

            posts.forEach((post, index) => {
                const rect = post.getBoundingClientRect();
                const absoluteTop = rect.top + window.scrollY;
                if (scrollPosition >= absoluteTop && scrollPosition < absoluteTop + rect.height) {
                    if (index !== currentPostIndex) {
                        setCurrentPostIndex(index);
                        analytics.logEvent('post_scroll_progress', {
                            series: 'hyperfocus_architect',
                            post_id: index + 1,
                            post_title: postsData[index].title
                        });

                        // Save progress
                        if (currentUser) {
                            const userRef = doc(db, 'users', currentUser.uid);
                            updateDoc(userRef, {
                                [`seriesProgress.hyperfocus-architect`]: index + 1
                            }).catch(e => console.error("Error saving progress:", e));
                        }
                    }
                }
            });

            // Completion check
            const bottomCta = document.querySelector('.bottom-cta');
            if (bottomCta) {
                const rect = bottomCta.getBoundingClientRect();
                if (rect.top < window.innerHeight && !completed) {
                    setCompleted(true);
                    analytics.logEvent('series_completion', { series: 'hyperfocus_architect' });
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [currentPostIndex, completed, currentUser]);

    const scrollToPost = (index) => {
        const posts = document.querySelectorAll('.post-block');
        if (posts[index]) {
            posts[index].scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const handleUnlock = async () => {
        if (!currentUser) {
            alert("Please login to unlock full training.");
            return;
        }

        setIsProcessing(true);
        try {
            const tier = sustainability.getTierDetails(SUBSCRIPTION_TIERS.BASIC);
            await paymentService.initializeRazorpay(currentUser, { ...tier, id: SUBSCRIPTION_TIERS.BASIC }, tier.price);
            setIsPremium(true);
            analytics.logEvent('series_unlock_success', { series: 'hyperfocus_architect' });
        } catch (error) {
            console.error("Unlock failed:", error);
            alert("Payment failed or cancelled. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="hyperfocus-page">
            <SEO 
                title="Hyperfocus Architect: Neuroscience-based Attention Training"
                description="Master your focus and attention through 30 chapters of neuroscience-backed psychological training. Build a high-performance mental operating system."
                image="/assets/hyperfocus/post_01.png"
                url="https://soulthread.in/hyperfocus-series"
                type="article"
                schema={{
                    "@context": "https://schema.org",
                    "@type": "Course",
                    "name": "Hyperfocus Architect",
                    "description": "Neuroscience-based attention training to upgrade your mental operating system.",
                    "provider": {
                        "@type": "Organization",
                        "name": "SoulThread",
                        "sameAs": "https://soulthread.in"
                    }
                }}
            />
            <Breadcrumbs />
            <header className="sticky-header">
                <div className="header-content">
                    <Link to="/" className="logo-link">
                        <span className="logo-text">SOULTHREAD</span>
                    </Link>
                    <div className="series-title-mini">Hyperfocus Architect</div>
                    <div className="progress-text">
                        Section {currentPostIndex + 1} / 30
                    </div>
                </div>
                <motion.div className="progress-bar" style={{ scaleX }} />
            </header>

            <section className="hero-section">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    HYPERFOCUS ARCHITECT
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    A deep dive into neuroscience and the mechanics of human attention.
                </motion.p>
                <motion.button
                    className="start-btn"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => scrollToPost(0)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    BEGIN TRAINING
                </motion.button>
            </section>

            <main className="series-container" ref={seriesRef}>
                <div className="series-intro">
                    <h2>Mastering Attention</h2>
                    <p className="subtitle">30 Daily Insights into Neuroscience & Focus</p>
                    <p className="description">
                        This series is designed to be read sequentially. Each post provides a scientific insight into how your brain processes focus and a practical action to reclaim your attention in a world designed to steal it.
                    </p>
                </div>

                <div className="posts-list">
                    {postsData.map((post, index) => {
                        const isLocked = index >= 5 && !isPremium;

                        return (
                            <motion.div
                                key={post.id}
                                className={`post-block ${isLocked ? 'locked-block' : ''}`}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.6 }}
                            >
                                {isLocked ? (
                                    <div className="locked-overlay">
                                        <div className="lock-content">
                                            <div className="lock-icon">🔒</div>
                                            <span className="post-number">POST {post.id} / 30</span>
                                            <h3 className="blurred-text">{post.title}</h3>
                                            <div className="paywall-card">
                                                <h4>Training Restricted</h4>
                                                <p>To access Chapters 6-30 of the Hyperfocus Architect curriculum, you need a <strong>Soul Basic</strong> membership.</p>
                                                <ul className="premium-perks">
                                                    <li>Full access to all 30 Chapters</li>
                                                    <li>Unlock Never Finished & Ego-ID Series</li>
                                                    <li>Exclusive Wellness Tools</li>
                                                </ul>
                                                <button 
                                                    className="unlock-btn" 
                                                    onClick={handleUnlock}
                                                    disabled={isProcessing}
                                                >
                                                    {isProcessing ? 'Connecting...' : 'Upgrade To Unlock — ₹199'}
                                                </button>
                                                <p className="secure-text">Secure 256-bit encrypted payment via Razorpay</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="post-header">
                                            <span className="post-number">POST {post.id} / 30</span>
                                            <h3>{post.title}</h3>
                                        </div>

                                        <div className="post-image-container">
                                            <img
                                                src={post.image}
                                                alt={post.title}
                                                loading="lazy"
                                                className="post-image"
                                            />
                                        </div>

                                        <div className="post-content">
                                            <p className="insight">{post.insight}</p>
                                            <div className="takeaway-box">
                                                <p className="takeaway">{post.takeaway}</p>
                                            </div>
                                            <p className="caption-text">
                                                This is Post {post.id}/30 of the Hyperfocus Architect Series. Finish one post per day for maximum neural rewiring.
                                            </p>
                                        </div>

                                        <div className="post-navigation">
                                            <button
                                                className="nav-btn prev"
                                                disabled={index === 0}
                                                onClick={() => scrollToPost(index - 1)}
                                            >
                                                ← Previously
                                            </button>
                                            <button
                                                className="nav-btn next"
                                                disabled={index === postsData.length - 1}
                                                onClick={() => {
                                                    if (index === 4 && !isPremium) {
                                                        alert("The next phase of training is restricted to Soul Basic members.");
                                                        scrollToPost(5);
                                                    } else {
                                                        scrollToPost(index + 1);
                                                    }
                                                }}
                                            >
                                                Continue →
                                            </button>
                                        </div>
                                    </>
                                )}

                                {index < postsData.length - 1 && <div className="post-divider" />}
                            </motion.div>
                        );
                    })}
                </div>
            </main>

            <section className="bottom-cta" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '60px' }}>
                <div style={{ marginBottom: '32px' }}>
                    <p style={{ opacity: 0.7, marginBottom: '12px' }}>Mastered your attention? Now master your mind.</p>
                    <h2 style={{ fontSize: '2rem', marginBottom: '24px' }}>Continue with Mental Toughness</h2>
                    <Link to="/never-finished-series" className="explore-btn" style={{ background: 'var(--color-primary)', color: 'white', border: 'none' }}>
                        Start Never Finished Bootamp →
                    </Link>
                </div>
                <div style={{ marginTop: '40px' }}>
                    <p>Or return to the library to explore other topics.</p>
                    <Link to="/series" className="explore-btn" style={{ marginTop: '16px' }}>
                        Browse All Series
                    </Link>
                </div>
            </section>

            <footer className="series-footer">
                <p>© 2026 SoulThread. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default HyperfocusSeries;
