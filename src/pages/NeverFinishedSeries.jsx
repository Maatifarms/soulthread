import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useSpring } from 'framer-motion';
import { analytics } from '../services/analytics';
import { db } from '../services/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { SUBSCRIPTION_TIERS, sustainability } from '../services/sustainabilityModel';
import { paymentService } from '../services/paymentService';
import { useSeriesProgress } from '../hooks/useSeriesProgress';
import SEO from '../components/common/SEO';
import { 
    Check, 
    ArrowLeft, 
    ArrowRight 
} from 'lucide-react';
import SeriesPaywall from '../components/series/SeriesPaywall';
import './NeverFinishedSeries.css';

const postsData = [
    {
        id: 1,
        title: "THE WORLD CREATES YOUR LIMITS",
        insight: "The world is designed to keep you small. If you listen to society, you'll never see your true potential.",
        takeaway: "Action: List 3 things you believe are impossible for you, then question why.",
        image: "/assets/neverfinished/post_01.png"
    },
    {
        id: 2,
        title: "THE SOLO MISSION OF SELF MASTERY",
        insight: "Nobody is coming to save you. Mastery is a private, lonely war against your own laziness.",
        takeaway: "Action: Spend 30 minutes in total silence today, no phone.",
        image: "/assets/neverfinished/post_02.png"
    },
    {
        id: 3,
        title: "HOPE VS REAL BELIEF",
        insight: "Hope is a gamble for the weak. Real belief only comes from doing the work when you don't want to.",
        takeaway: "Action: Do one task you've been dreading for at least 15 minutes.",
        image: "/assets/neverfinished/post_03.png"
    },
    {
        id: 4,
        title: "PAIN CREATES REAL CONFIDENCE",
        insight: "You cannot buy confidence. You build it by enduring suffering and realizing you didn't die.",
        takeaway: "Action: Take a 2-minute cold shower. Observe the panic, then the control.",
        image: "/assets/neverfinished/post_04.png"
    },
    {
        id: 5,
        title: "STOP BLAMING YOUR PAST",
        insight: "Your trauma can be a crutch or a rocket. You decide if your story justifies your failure or fuels your success.",
        takeaway: "Action: Write down a past failure and one strength it gave you.",
        image: "/assets/neverfinished/post_05.png"
    },
    {
        id: 6,
        title: "RESPONSIBILITY CREATES FREEDOM",
        insight: "Blame is a cage. When you take 100% responsibility for everything, you gain 100% control.",
        takeaway: "Action: Apologize for something you've been blaming someone else for.",
        image: "/assets/neverfinished/post_06.png"
    },
    {
        id: 7,
        title: "THE GOLDEN HOUR OF LIFE",
        insight: "The first hour of your day is the most important. Win the morning, win the war.",
        takeaway: "Action: Wake up 30 minutes earlier tomorrow. No phone for the first hour.",
        image: "/assets/neverfinished/post_07.png"
    },
    {
        id: 8,
        title: "STOP LIVING INSIDE YOUR STORY",
        insight: "You are not the victim of your life unless you choose to be. Rewrite your narrative today.",
        takeaway: "Action: Write a 'Savage' version of your bio where you overcome every obstacle.",
        image: "/assets/neverfinished/post_08.png"
    },
    {
        id: 9,
        title: "PROCESS YOUR PAIN OR IT OWNS YOU",
        insight: "Unprocessed pain turns into toxic habits. Face it, feel it, and move through it.",
        takeaway: "Action: Journal about a recurring negative emotion you have.",
        image: "/assets/neverfinished/post_09.png"
    },
    {
        id: 10,
        title: "CONTROL YOUR MIND'S NARRATIVE",
        insight: "The voice in your head is a liar. It wants you safe. Learn to ignore the weak version of yourself.",
        takeaway: "Action: When your mind says 'stop', do 5 more minutes or 5 more reps.",
        image: "/assets/neverfinished/post_10.png"
    },
    {
        id: 11,
        title: "THE ONE SECOND DECISION",
        insight: "The decision to quit happens in one second. If you can survive that second, you can survive the mission.",
        takeaway: "Action: When you feel like giving up on a task, wait 60 seconds before deciding.",
        image: "/assets/neverfinished/post_11.png"
    },
    {
        id: 12,
        title: "DON'T QUIT IN PANIC",
        insight: "Never make a life decision when you are in a state of suffering. Wait until you're calm.",
        takeaway: "Action: Commit to not making a major decision until you are in a neutral state.",
        image: "/assets/neverfinished/post_12.png"
    },
    {
        id: 13,
        title: "TRAIN YOUR MIND LIKE A SOLDIER",
        insight: "Discipline isn't about motivation. It's about following orders from the person you want to become.",
        takeaway: "Action: Set a non-negotiable task for tomorrow and do it regardless of how you feel.",
        image: "/assets/neverfinished/post_13.png"
    },
    {
        id: 14,
        title: "THE MENTAL LABORATORY",
        insight: "Treat every day as an experiment. Test your limits, find your breaking points, and push past them.",
        takeaway: "Action: Try a challenge that you are likely to fail. Learn from the friction.",
        image: "/assets/neverfinished/post_14.png"
    },
    {
        id: 15,
        title: "CREATE YOUR SAVAGE ALTER EGO",
        insight: "When things get dark, you need a different version of yourself to take the wheel. Someone who loves the rain.",
        takeaway: "Action: Give a name to your most disciplined self. Call on them when it's hard.",
        image: "/assets/neverfinished/post_15.png"
    },
    {
        id: 16,
        title: "COMFORT IS THE ENEMY",
        insight: "Comfort is the ultimate drug. It kills your ambition and rots your potential.",
        takeaway: "Action: Do something today that makes you feel awkward or uncomfortable.",
        image: "/assets/neverfinished/post_16.png"
    },
    {
        id: 17,
        title: "DISCIPLINE CHANGES YOUR DNA",
        insight: "Consistency rewires your subconscious. After enough reps, the 'hard' thing becomes your new normal.",
        takeaway: "Action: Pick one small habit and commit to it for 7 days without fail.",
        image: "/assets/neverfinished/post_17.png"
    },
    {
        id: 18,
        title: "STOP SEEKING SYMPATHY",
        insight: "Sympathy validates your weakness. Stop looking for people to feel sorry for you.",
        takeaway: "Action: For the next 24 hours, do not complain about anything to anyone.",
        image: "/assets/neverfinished/post_18.png"
    },
    {
        id: 19,
        title: "HUMILITY BUILDS REAL STRENGTH",
        insight: "The second you think you're 'elite', you stop growing. Stay at the bottom of the mountain mentally.",
        takeaway: "Action: Learn something new from someone you previously didn't respect.",
        image: "/assets/neverfinished/post_19.png"
    },
    {
        id: 20,
        title: "USE HATE AS FUEL",
        insight: "Don't ignore the doubters. Use their negativity as the high-octane fuel for your engine.",
        takeaway: "Action: Use a memory of being underestimated to power through today's deep work.",
        image: "/assets/neverfinished/post_20.png"
    },
    {
        id: 21,
        title: "RECORD YOUR TRUTH",
        insight: "Don't lie to the person in the mirror. Account for your actions with brutal transparency.",
        takeaway: "Action: Track every single hour of your day today. Identify the time waste.",
        image: "/assets/neverfinished/post_21.png"
    },
    {
        id: 22,
        title: "BUILD YOUR INNER CIRCLE CAREFULLY",
        insight: "Your environment is stronger than your will. Surround yourself with people who make you feel lazy.",
        takeaway: "Action: Reach out to one person who is further ahead in life than you.",
        image: "/assets/neverfinished/post_22.png"
    },
    {
        id: 23,
        title: "SEPARATE FROM PEOPLE WHO LIMIT YOU",
        insight: "You cannot heal in the same environment that made you sick. Cut the dead weight.",
        takeaway: "Action: Mute or unfollow 5 accounts that feed your distractions or insecurities.",
        image: "/assets/neverfinished/post_23.png"
    },
    {
        id: 24,
        title: "BECOME YOUR OWN LEADER",
        insight: "Stop searching for a master. The master is within you, waiting for you to take charge.",
        takeaway: "Action: Plan your own 30-day 'Life Audit' starting today.",
        image: "/assets/neverfinished/post_24.png"
    },
    {
        id: 25,
        title: "CREATE YOUR PERSONAL CODE",
        insight: "A person without a code is a leaf in the wind. What are your non-negotiables?",
        takeaway: "Action: Write down 5 rules you will never break, no matter what.",
        image: "/assets/neverfinished/post_25.png"
    },
    {
        id: 26,
        title: "BREAK YOUR IDENTITY LIMITS",
        insight: "You are not your bank account, your past, or your mistakes. You are the effort you put in now.",
        takeaway: "Action: Do something today that 'the old you' would never have done.",
        image: "/assets/neverfinished/post_26.png"
    },
    {
        id: 27,
        title: "USE PAIN AS ENERGY",
        insight: "Instead of running from pain, run into it. It is the most powerful source of energy on earth.",
        takeaway: "Action: When you feel mental friction today, treat it as a signal to lean in harder.",
        image: "/assets/neverfinished/post_27.png"
    },
    {
        id: 28,
        title: "REDEFINE WHAT GREATNESS MEANS",
        insight: "Greatness isn't winning. It's being the person who refused to stop when everyone else did.",
        takeaway: "Action: Focus on the quality of your struggle today, not the reward.",
        image: "/assets/neverfinished/post_28.png"
    },
    {
        id: 29,
        title: "EFFORT IS THE REAL GREATNESS",
        insight: "The trophy is a lie. The real prize is the person you became while earning it.",
        takeaway: "Action: Reflect on your hardest victory. What did it teach you about your soul?",
        image: "/assets/neverfinished/post_29.png"
    },
    {
        id: 30,
        title: "THE MISSION NEVER ENDS",
        insight: "There is no finish line. The reward for a job well done is more work. Stay hard.",
        takeaway: "Action: Pick your next goal immediately. The journey continues.",
        image: "/assets/neverfinished/post_30.png"
    }
];

const NeverFinishedSeries = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [currentPostIndex, setCurrentPostIndex] = useState(0);
    const [completed, setCompleted] = useState(false);
    const [isPremium, setIsPremium] = useState(false);
    const [isFreeUnlocked, setIsFreeUnlocked] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentError, setPaymentError] = useState('');
    const seriesRef = useRef(null);
    const { markAsRead, isRead } = useSeriesProgress('never-finished');
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    useEffect(() => {
        // Check Premium Access
        const checkAccess = async () => {
            const hasAccess = await sustainability.verifyAccess(currentUser, SUBSCRIPTION_TIERS.BASIC);
            setIsPremium(hasAccess);
        };
        checkAccess();
        // Track Start
        analytics.logEvent('series_start', { series: 'never_finished' });

        document.body.classList.add('hyperfocus-mode'); // Reusing the same dark layout mode
        return () => {
            document.body.classList.remove('hyperfocus-mode');
        };
    }, [currentUser]);

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
                        analytics.logEvent('section_progress', {
                            series: 'never_finished',
                            post_id: index + 1,
                            post_title: postsData[index].title
                        });

                        // Progress is saved by the dedicated useEffect below
                    }
                }
            });

            // Completion check
            const bottomCta = document.querySelector('.bottom-cta');
            if (bottomCta) {
                const rect = bottomCta.getBoundingClientRect();
                if (rect.top < window.innerHeight && !completed) {
                    setCompleted(true);
                    analytics.logEvent('series_completion', { series: 'never-finished' });
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [currentPostIndex, completed]);

    useEffect(() => {
        if (!currentUser) return;

        const saveProgress = async () => {
            const userRef = doc(db, 'users', currentUser.uid);
            try {
                await updateDoc(userRef, {
                    [`seriesProgress.never-finished`]: {
                        currentPost: currentPostIndex + 1,
                        totalPosts: 30,
                        lastUpdated: new Date().toISOString()
                    }
                });
            } catch (error) {
                console.error("Error saving progress:", error);
            }
        };

        saveProgress();
    }, [currentPostIndex, currentUser]);

    const scrollToPost = (index) => {
        const posts = document.querySelectorAll('.post-block');
        if (posts[index]) {
            const top = posts[index].getBoundingClientRect().top + window.scrollY - 80;
            window.scrollTo({ top, behavior: 'smooth' });
        }
    };

    const handleUnlock = async (isFree = false) => {
        if (isFree) {
            setIsFreeUnlocked(true);
            analytics.logEvent('series_unlock_free', { series: 'never_finished' });
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
            analytics.logEvent('series_unlock_success', { series: 'never_finished' });
        } catch (error) {
            console.error("Unlock failed:", error);
            setPaymentError('Payment was cancelled or failed. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="hyperfocus-page never-finished-page">
            <SEO 
                title="Never Finished: Mental Toughness Bootcamp"
                description="A 30-part psychological bootcamp inspired by David Goggins. Master your mind, build resilience, and become uncommon amongst the uncommon."
                image="/assets/neverfinished/post_01.png"
                url="https://soulthread.in/never-finished-series"
                type="article"
                schema={{
                    "@context": "https://schema.org",
                    "@type": "Course",
                    "name": "Never Finished: Mental Toughness Series",
                    "description": "A 30-day psychological bootcamp to build mental resilience and toughness.",
                    "provider": {
                        "@type": "Organization",
                        "name": "SoulThread",
                        "sameAs": "https://soulthread.in"
                    }
                }}
            />
            {/* Sticky Header */}
            <header className="sticky-header">
                <div className="header-content">
                    <Link to="/" className="logo-link">
                        <span className="logo-text">SOULTHREAD</span>
                    </Link>
                    <div className="series-title-mini">Never Finished</div>
                    <div className="progress-text">
                        Section {currentPostIndex + 1} / 30
                    </div>
                </div>
                <motion.div className="progress-bar goggins-bar" style={{ scaleX }} />
            </header>

            {/* Hero Section */}
            <section className="hero-section goggins-hero">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    style={{ letterSpacing: '-2px' }}
                >
                    NEVER FINISHED
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    A mental toughness bootcamp inspired by the David Goggins philosophy.
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
                    Begin the Mission
                </motion.button>
            </section>

            {/* Series Main Content */}
            <main className="series-container" ref={seriesRef}>
                <div className="series-intro">
                    <h2>Mental Toughness Training</h2>
                    <p className="subtitle">30 Chapters to Forge an Unbreakable Mind and Extreme Ownership</p>
                    <p className="description">
                        This series is not for the weak. It is a roadmap to excavating your true self through struggle, discipline, and absolute accountability.
                        Read one chapter at a time. Do the work. Stay hard.
                    </p>
                </div>

                <div className="posts-list">
                    {postsData.map((post, index) => {
                        const midPoint = Math.floor(postsData.length / 2);
                        const isLocked = index >= midPoint && !isPremium && !isFreeUnlocked && !currentUser?.isAdmin;
                        
                        if (isLocked && index > midPoint) return null;

                        const done = isRead(post.title);

                        return (
                            <motion.div
                                key={post.id}
                                className={`post-block ${isLocked ? 'locked-block' : ''} ${done ? 'post-done' : ''}`}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-80px" }}
                                transition={{ duration: 0.5 }}
                            >
                                {isLocked ? (
                                    <SeriesPaywall
                                        seriesId="never-finished"
                                        seriesTitle="Never Finished"
                                        onUnlock={handleUnlock}
                                        isProcessing={isProcessing}
                                        paymentError={paymentError}
                                    />
                                ) : (
                                    <>
                                        <div className="post-day-label">
                                            <span className="day-badge">Day {post.id}</span>
                                            <span className="day-total">of 30</span>
                                            {done && <span className="done-badge" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Check size={14} /> Done</span>}
                                        </div>

                                        <h3 className="post-title">{post.title}</h3>

                                        <div className="post-image-container">
                                            <img src={post.image} alt={post.title} loading="lazy" className="post-image" />
                                        </div>

                                        <blockquote className="insight-quote">
                                            {post.insight}
                                        </blockquote>

                                        <div className="challenge-card">
                                            <div className="challenge-label">Today's Mission</div>
                                            <p className="challenge-text">{post.takeaway.replace('Action: ', '').replace('Mission: ', '')}</p>
                                            {!done && (
                                                <button className="mark-done-btn" onClick={() => markAsRead(post.title)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                                    <Check size={18} /> Mission Complete
                                                </button>
                                            )}
                                            {done && (
                                                <div className="done-msg">Mission completed. Stay hard.</div>
                                            )}
                                        </div>

                                        <div className="post-navigation">
                                            <button className="nav-btn prev" disabled={index === 0} onClick={() => scrollToPost(index - 1)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <ArrowLeft size={16} /> Day {post.id - 1}
                                            </button>
                                            <button className="nav-btn next" disabled={index === postsData.length - 1} onClick={() => scrollToPost(index + 1)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                Day {post.id + 1} <ArrowRight size={16} />
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

            {/* CTA Section */}
            <section className="bottom-cta" style={{ borderTop: '1px solid #333', paddingTop: '60px' }}>
                <div style={{ marginBottom: '32px' }}>
                    <p style={{ opacity: 0.7, marginBottom: '12px' }}>Fortified your mindset? Now sharpen your sword.</p>
                    <h2 style={{ fontSize: '2rem', marginBottom: '24px' }}>Train Your Deep Attention</h2>
                    <Link to="/hyperfocus-series" className="explore-btn" style={{ background: '#7ecdc4', color: '#111', border: 'none', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px', width: 'fit-content', margin: '0 auto' }}>
                        Architect Your Hyperfocus <ArrowRight size={18} />
                    </Link>
                </div>
                <div style={{ marginTop: '40px' }}>
                    <p>The mission has no end. Carry this discipline into your daily life.</p>
                    <Link to="/series" className="explore-btn" style={{ marginTop: '16px' }}>
                        View All Series
                    </Link>
                </div>
            </section>

            <footer className="series-footer">
                <p>© 2026 SoulThread. Stay Hard.</p>
            </footer>
        </div>
    );
};

export default NeverFinishedSeries;
