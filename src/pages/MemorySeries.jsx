import { useEffect, useState, useRef } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useSpring } from 'framer-motion';
import { analytics } from '../services/analytics';
import { db } from '../services/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { SUBSCRIPTION_TIERS, sustainability } from '../services/sustainabilityModel';
import { useSeriesProgress } from '../hooks/useSeriesProgress';
import SEO from '../components/common/SEO';
import SeriesPaywall from '../components/series/SeriesPaywall';
import './MemorySeries.css';

const postsData = [
    {
        id: 1,
        title: "THE ADRENALINE STAMP",
        insight: "Adrenaline (epinephrine) doesn't just prepare you for flight. It stamps down memories in the brain during high emotional saliency.",
        takeaway: "Action: Take a 30-second cold shower immediately after your next learning session.",
        image: "/assets/memory/day_01.png"
    },
    {
        id: 2,
        title: "THE EBBINGHAUS TRUTH",
        insight: "Repetition is the base layer. The more often you co-activate a neural circuit, the stronger the connection becomes.",
        takeaway: "Action: Review new information at the 1-hour, 4-hour, and 24-hour mark.",
        image: "/assets/memory/day_02.png"
    },
    {
        id: 3,
        title: "THE 13-MINUTE ANCHOR",
        insight: "Daily meditation for 13 minutes significantly improves attention, mood, and memory by strengthening prefrontal activity.",
        takeaway: "Action: Set a timer for 13 minutes. Focus solely on your breath before 5 PM today.",
        image: "/assets/memory/day_03.png"
    },
    {
        id: 4,
        title: "MENTAL SNAPSHOTS",
        insight: "Taking a 'mental picture' by blinking and visualizing the scene stamps a robust visual memory into your hippocampus.",
        takeaway: "Action: Today, pick 3 moments to 'blink and visualize' for 5 seconds each.",
        image: "/assets/memory/day_04.png"
    },
    {
        id: 5,
        title: "OSTEOCALCIN & MOVEMENT",
        insight: "Load-bearing exercise releases osteocalcin from bones, which travels to the brain to support neural growth and maintenance.",
        takeaway: "Action: Complete 30 minutes of Zone 2 cardio (brisk walk/jog) today.",
        image: "/assets/memory/day_05.png"
    },
    {
        id: 6,
        title: "POST-STUDY CAFFEINE",
        insight: "Stimulants like caffeine increase epinephrine. For memory enhancement, ingest them *after* learning, not before.",
        takeaway: "Action: If you drink coffee, have your next cup immediately after finishing a project.",
        image: "/assets/memory/day_06.png"
    },
    {
        id: 7,
        title: "THE AMYGDALA GATE",
        insight: "The amygdala acts as a correlation detector. It links emotional high points to information deemed 'critical' to keep.",
        takeaway: "Action: Briefly relate what you are learning to a powerful personal memory or goal.",
        image: "/assets/memory/day_07.png"
    },
    {
        id: 8,
        title: "ONE TRIAL LEARNING",
        insight: "Intense emotional states can create permanent neural traces in a single instance through massive epinephrine release.",
        takeaway: "Action: Acknowledge that intense focus mimics this 'high stakes' state. Treat learning as vital.",
        image: "/assets/memory/day_08.png"
    },
    {
        id: 9,
        title: "THE SLEEP LAG",
        insight: "Neural reconfiguration happens hours after learning, specifically during deep sleep and NSDR (Non-Sleep Deep Rest).",
        takeaway: "Action: Avoid learning intensely right before bed; give your brain a buffer for NSDR.",
        image: "/assets/memory/day_09.png"
    },
    {
        id: 10,
        title: "DEJA VU MECHANICS",
        insight: "Deja vu is a normal pattern of encoding where the brain detects a resemblance in neural firing sequences.",
        takeaway: "Action: When you feel deja vu, notice the sensory trigger—it's your hippocampus working.",
        image: "/assets/memory/day_10.png"
    },
    {
        id: 11,
        title: "PHARMACEUTICAL SAFETY",
        insight: "Prescription stimulants should only be used by those prescribed. They shift the dopaminergic baseline permanently.",
        takeaway: "Action: Optimize behavioral tools (cold, exercise) before reaching for external aids.",
        image: "/assets/memory/day_11.png"
    },
    {
        id: 12,
        title: "BONE-BRAIN AXIS",
        insight: "Your skeleton is an endocrine organ. Moving your large bones signaling the brain that the body is 'active' and needs memory.",
        takeaway: "Action: Add 10 air squats to your learning breaks to trigger osteocalcin.",
        image: "/assets/memory/day_12.png"
    },
    {
        id: 13,
        title: "VISUAL COMPETITION",
        insight: "Focusing on visual snapshots improves visual memory but can degrade auditory retention of the same event.",
        takeaway: "Action: Choose one: Do you need to remember the conversation or the setting?",
        image: "/assets/memory/day_13.png"
    },
    {
        id: 14,
        title: "YOGA NIDRA RECOVERY",
        insight: "20 minutes of Yoga Nidra (NSDR) can reset your attention spans as effectively as a long nap.",
        takeaway: "Action: Try a guided 10-minute NSDR session during your afternoon slump.",
        image: "/assets/memory/day_14.png"
    },
    {
        id: 15,
        title: "PRECISION PERCEPTION",
        insight: "The hippocampus stores 'contexts'. The more detailed your initial perception, the more anchors for memory.",
        takeaway: "Action: Spend 1 minute describing every detail of an object you use daily.",
        image: "/assets/memory/day_15.png"
    },
    {
        id: 16,
        title: "CHRONIC STRESS DECAY",
        insight: "While acute stress stamps down memory, chronic cortisol elevation actually inhibits neurogenesis.",
        takeaway: "Action: Identify one recurring source of chronic stress and plan to automate it.",
        image: "/assets/memory/day_16.png"
    },
    {
        id: 17,
        title: "THE GLYMPHATIC FLUSH",
        insight: "Exercise improves lymphatic and blood flow in the brain, sweeping away metabolic waste for clearer memory.",
        takeaway: "Action: HYDRATE. Your vascular system needs water to flush the brain's waste.",
        image: "/assets/memory/day_17.png"
    },
    {
        id: 18,
        title: "PROCEDURAL FLUIDITY",
        insight: "Walking and motor skills move from explicit to implicit memory, freeing up cognitive resources.",
        takeaway: "Action: Learn a simple physical 'sequence' (e.g., pen spinning) to practice motor consolidation.",
        image: "/assets/memory/day_18.png"
    },
    {
        id: 19,
        title: "AUDITORY FOCUS",
        insight: "Auditory memory is distinct and often 'outcompeted' by visual input in modern high-stim environments.",
        takeaway: "Action: Close your eyes and listen to a 5-minute podcast clip. Try to recall it verbatim.",
        image: "/assets/memory/day_19.png"
    },
    {
        id: 20,
        title: "THE DOPAMINE DELTA",
        insight: "Memory is enhanced when your internal state changes relative to where it was just prior.",
        takeaway: "Action: Change your environment (room/desk) immediately after a key learning session.",
        image: "/assets/memory/day_20.png"
    },
    {
        id: 21,
        title: "8-WEEK COMMITMENT",
        insight: "Neurological changes from meditation typically peak after 8 continuous weeks of 13-minute sessions.",
        takeaway: "Action: Commit today to finish the next 3 weeks without missing a meditation day.",
        image: "/assets/memory/day_21.png"
    },
    {
        id: 22,
        title: "HIPPOCAMPAL VOLUME",
        insight: "Exercise combined with cognitive effort increases the volume and connectivity of the hippocampus.",
        takeaway: "Action: Read or study while using a standing desk or walking slowly.",
        image: "/assets/memory/day_22.png"
    },
    {
        id: 23,
        title: "LOCUS COERULEUS WAKE",
        insight: "The 'sprinkler' system of the brain. When it fires, the entire brain enters a state of 'write-enable' mode.",
        takeaway: "Action: Use a loud, sharp sound or splash of cold water to 'wake up' your focus if lagging.",
        image: "/assets/memory/day_23.png"
    },
    {
        id: 24,
        title: "MIND'S EYE RESOLUTION",
        insight: "The clarity of your visualization dictates the strength of the neural trace re-activation.",
        takeaway: "Action: Spend 2 minutes visualizing a memory in '4K details'—colors, smells, sounds.",
        image: "/assets/memory/day_24.png"
    },
    {
        id: 25,
        title: "FORGETTING IS ACTIVE",
        insight: "The brain spend energy prune connections. High stress at the *wrong* time can cause unlearning.",
        takeaway: "Action: If you had a traumatic event, use NSDR to lower adrenaline and prevent 'stamping'.",
        image: "/assets/memory/day_25.png"
    },
    {
        id: 26,
        title: "THE PREFRONTAL BRAKE",
        insight: "Focus is the ability to exclude. Your memory depends on how much you *don't* encode.",
        takeaway: "Action: Purposefully ignore all background noise for the next 10 minutes of work.",
        image: "/assets/memory/day_26.png"
    },
    {
        id: 27,
        title: "NEURAL PLASTICITY PEAK",
        insight: "Youthful levels of plasticity can be maintained by keeping autonomic arousal low during learning, and high after.",
        takeaway: "Action: Stay calm while studying. Spike your heart rate AFTER you finish.",
        image: "/assets/memory/day_27.png"
    },
    {
        id: 28,
        title: "THE SAVINGS EFFECT",
        insight: "Ebbinghaus noted that even if you 'forget', the second time you learn is 50-70% faster. Nothing is lost.",
        takeaway: "Action: Re-read a book you read a year ago. Notice how much faster you absorb it.",
        image: "/assets/memory/day_28.png"
    },
    {
        id: 29,
        title: "BIO-RHYTHM SYNC",
        insight: "Adrenaline peaks naturally in the morning. Leverage this for your hardest 'unassisted' learning tasks.",
        takeaway: "Action: Front-load your most difficult learning to the first 3 hours of your day.",
        image: "/assets/memory/day_29.png"
    },
    {
        id: 30,
        title: "THE MEMORY ARCHITECT",
        insight: "You now have the blueprints to design your own cognitive operating system. Memory is a choice.",
        takeaway: "Action: Design a weekly routine that incorporates: 13m meditation + Zone 2 cardio + Cold after study.",
        image: "/assets/memory/day_30.png"
    }
];

const MemorySeries = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [currentPostIndex, setCurrentPostIndex] = useState(0);
    const [completed, setCompleted] = useState(false);
    const [isPremium, setIsPremium] = useState(false);
    const [isFreeUnlocked, setIsFreeUnlocked] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentError, setPaymentError] = useState(null);
    const seriesRef = useRef(null);
    const { markAsRead, isRead } = useSeriesProgress('memory-architect');

    const totalChapters = postsData.length;
    const freeThreshold = Math.floor(totalChapters / 2); // 50% free

    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

    const handleUnlock = async () => {
        setIsProcessing(true);
        setPaymentError(null);
        try {
            const success = await sustainability.processPayment(currentUser, SUBSCRIPTION_TIERS.BASIC);
            if (success) {
                setIsPremium(true);
                analytics.logEvent('subscription_success', { tier: 'soul_basic', series: 'memory_architect' });
            }
        } catch (err) {
            setPaymentError(err.message);
        } finally {
            setIsProcessing(false);
        }
    };

    useEffect(() => {
        const checkAccess = async () => {
            const hasAccess = await sustainability.verifyAccess(currentUser, SUBSCRIPTION_TIERS.BASIC);
            setIsPremium(hasAccess);
        };
        checkAccess();
        analytics.logEvent('series_start', { series: 'memory_architect' });
        document.body.classList.add('memory-theme');
        return () => document.body.classList.remove('memory-theme');
    }, [currentUser]);

    useEffect(() => {
        const handleScroll = () => {
            const posts = document.querySelectorAll('.post-block');
            posts.forEach((post, index) => {
                const rect = post.getBoundingClientRect();
                if (rect.top < window.innerHeight / 2 && rect.bottom > window.innerHeight / 2) {
                    if (index !== currentPostIndex) {
                        setCurrentPostIndex(index);
                        if (currentUser) {
                            const userRef = doc(db, 'users', currentUser.uid);
                            updateDoc(userRef, { [`seriesProgress.memory-architect`]: index + 1 });
                        }
                    }
                }
            });

            const bottomCta = document.querySelector('.bottom-cta');
            if (bottomCta && bottomCta.getBoundingClientRect().top < window.innerHeight && !completed) {
                setCompleted(true);
                analytics.logEvent('series_completion', { series: 'memory_architect' });
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [currentPostIndex, completed, currentUser]);

    const scrollToPost = (index) => {
        const posts = document.querySelectorAll('.post-block');
        if (posts[index]) {
            const top = posts[index].getBoundingClientRect().top + window.scrollY - 80;
            window.scrollTo({ top, behavior: 'smooth' });
        }
    };

    return (
        <div className="memory-series-page">
            <SEO 
                title="Memory Architect | Science-Based Memory Optimization"
                description="A 30-day curriculum inspired by neurobiology to upgrade your learning, retention, and cognitive longevity."
                image="/assets/memory/series_cover.png"
            />
            
            <header className="memory-header">
                <div className="header-inner">
                    <Link to="/series" className="back-link" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ArrowLeft size={16} /> All Series
                    </Link>
                    <div className="series-title">MEMORY ARCHITECT</div>
                    <div className="progress-pill">Phase {currentPostIndex + 1} / 30</div>
                </div>
                <motion.div className="progress-bar" style={{ scaleX }} />
            </header>

            <section className="memory-hero">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hero-glow" />
                <h1>REPROGRAM YOUR RECALL</h1>
                <p>A deep dive into the Huberman-based protocols for memory, neurogenesis, and focus.</p>
                <div className="hero-stats">
                    <span>30 MODULES</span>
                    <span>NEURO-BACKED</span>
                    <span>DAILY ACTIONS</span>
                </div>
                <button className="begin-btn" onClick={() => scrollToPost(0)}>START TRAINING</button>
            </section>

            <main className="posts-container" ref={seriesRef}>
                {postsData.map((post, index) => {
                    const isLocked = index >= freeThreshold && !isPremium && !isFreeUnlocked;
                    const done = isRead(post.title);
                    if (isLocked && index > freeThreshold) return null;

                    return (
                        <motion.div key={post.id} className={`post-block ${isLocked ? 'locked' : ''} ${done ? 'done' : ''}`}
                            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                            {isLocked ? (
                                <SeriesPaywall 
                                    seriesId="memory-architect"
                                    seriesTitle="Memory Architect"
                                    onUnlock={() => setIsFreeUnlocked(true)}
                                    isProcessing={isProcessing}
                                    paymentError={paymentError}
                                />
                            ) : (
                                <>
                                    <div className="post-meta">DAY {post.id} / 30</div>
                                    <h2 className="post-title">{post.title}</h2>
                                    <div className="insight-box">{post.insight}</div>
                                    <div className="challenge-box">
                                        <h4>TODAY'S PROTOCOL</h4>
                                        <p>{post.takeaway.replace('Action: ', '')}</p>
                                        {!done && <button className="complete-btn" onClick={() => markAsRead(post.title)}>MARK COMPLETE</button>}
                                        {done && <div className="done-status" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#7ecdc4' }}>PROTOCOL LOGGED <Check size={16} /></div>}
                                    </div>
                                    <div className="post-nav">
                                        <button onClick={() => scrollToPost(index - 1)} disabled={index === 0}>PREVIOUS</button>
                                        <button onClick={() => scrollToPost(index + 1)} disabled={index === postsData.length - 1}>NEXT</button>
                                    </div>
                                </>
                            )}
                            <div className="divider" />
                        </motion.div>
                    );
                })}
            </main>

            <section className="bottom-cta">
                <h2>BEYOND BIOLOGY</h2>
                <p>Memory is the foundation of identity. You have completed the architecture.</p>
                <Link to="/series" className="finish-btn">EXPLORE MORE SERIES</Link>
            </section>

            <footer className="memory-footer">
                <p>© 2026 SOULTHREAD ARCHIVES</p>
            </footer>
        </div>
    );
};

export default MemorySeries;
