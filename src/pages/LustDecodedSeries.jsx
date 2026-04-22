import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useSpring } from 'framer-motion';
import { analytics } from '../services/analytics';
import { db } from '../services/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { useSeriesProgress } from '../hooks/useSeriesProgress';
import { sustainability, SUBSCRIPTION_TIERS } from '../services/sustainabilityModel';
import { paymentService } from '../services/paymentService';
import SEO from '../components/common/SEO';
import './LustDecodedSeries.css';
import { 
    Check, 
    ArrowLeft, 
    ArrowRight,
    MessageCircle
} from 'lucide-react';
import SeriesPaywall from '../components/series/SeriesPaywall';

const postsData = [
    {
        id: 1,
        title: "THE CORE ILLUSION",
        insight: "People don't have intimacy problems. They have understanding problems.",
        takeaway: "Action: Acknowledge that you might not be seeing the deeper pattern.",
        image: "/assets/hyperfocus/post_01.png" // placeholder
    },
    {
        id: 2,
        title: "THE QUIET SHIFT",
        insight: "Nothing breaks suddenly. It changes quietly. Attraction follows patterns most people don't see.",
        takeaway: "Action: Look for the subtle shifts, not the explosive arguments.",
        image: "/assets/hyperfocus/post_02.png"
    },
    {
        id: 3,
        title: "ATTRACTION & DESIRE SHIFT",
        insight: "Familiarity replaces curiosity. Predictability removes tension, leading to an attraction shift.",
        takeaway: "Action: Ask yourself where routine has destroyed the unknown.",
        image: "/assets/hyperfocus/post_03.png"
    },
    {
        id: 4,
        title: "RELATIONSHIP DYNAMICS",
        insight: "Things feel off without clear reason. Communication alone does not fix intimacy.",
        takeaway: "Action: Stop trying to 'talk' your way into desire.",
        image: "/assets/hyperfocus/post_04.png"
    },
    {
        id: 5,
        title: "FREQUENCY DROP",
        insight: "Intimacy reduces gradually. Avoidance replaces communication.",
        takeaway: "Action: Notice when avoidance became the default response.",
        image: "/assets/hyperfocus/post_05.png"
    },
    {
        id: 6,
        title: "PRESSURE & AVOIDANCE",
        insight: "Pressure creates resistance. The push vs pull cycle widens the gap.",
        takeaway: "Action: Identify if you are pushing or pulling right now.",
        image: "/assets/hyperfocus/post_06.png"
    },
    {
        id: 7,
        title: "EMOTIONAL VS PHYSICAL DISCONNECT",
        insight: "Emotional closeness does not equal physical attraction.",
        takeaway: "Action: Differentiate between feeling safe and feeling desired.",
        image: "/assets/hyperfocus/post_07.png"
    },
    {
        id: 8,
        title: "THE COMMUNICATION GAP",
        insight: "People discuss symptoms, not patterns.",
        takeaway: "Action: Stop arguing over the symptom; find the overarching pattern.",
        image: "/assets/hyperfocus/post_08.png"
    },
    {
        id: 9,
        title: "SOMETHING IS MISSING",
        insight: "No clear issue, but loss of energy and tension.",
        takeaway: "Action: Accept the ambiguity of the drift without forcing an immediate answer.",
        image: "/assets/hyperfocus/post_09.png"
    },
    {
        id: 10,
        title: "CASE 1: ATTRACTION DROPPED",
        insight: "Predictability removed tension.",
        takeaway: "Reflection: Predictability creates safety, but safety often kills eroticism.",
        image: "/assets/hyperfocus/post_10.png"
    },
    {
        id: 11,
        title: "CASE 2: GOOD RELATIONSHIP, LOW INTIMACY",
        insight: "Comfort replaced excitement.",
        takeaway: "Reflection: Comfort is necessary for survival, but lethal to mystery.",
        image: "/assets/hyperfocus/post_11.png"
    },
    {
        id: 12,
        title: "CASE 3: PARTNER AVOIDING INTIMACY",
        insight: "Hidden disconnect.",
        takeaway: "Reflection: Avoidance is a protective mechanism.",
        image: "/assets/hyperfocus/post_12.png"
    },
    {
        id: 13,
        title: "CASE 4: PRESSURE CREATES DISTANCE",
        insight: "One wants more, one avoids.",
        takeaway: "Reflection: Demand is the fastest way to kill organic desire.",
        image: "/assets/hyperfocus/post_13.png"
    },
    {
        id: 14,
        title: "CASE 5: SOMETHING FEELS OFF",
        insight: "Invisible drift.",
        takeaway: "Reflection: You can't fix drift by paddling harder without direction.",
        image: "/assets/hyperfocus/post_14.png"
    },
    {
        id: 15,
        title: "KEY OBSERVATIONS",
        insight: "Problems are gradual. Effort alone does not fix attraction.",
        takeaway: "Action: Stop relying exclusively on 'working harder' at the relationship.",
        image: "/assets/hyperfocus/post_15.png"
    },
    {
        id: 16,
        title: "BEHAVIORAL PATTERNS",
        insight: "Masturbation is about conditioning, not right or wrong. Repetition changes expectations.",
        takeaway: "Action: Examine how you have conditioned your own expectations of intimacy.",
        image: "/assets/hyperfocus/post_16.png"
    },
    {
        id: 17,
        title: "THE FINAL STEP",
        insight: "Now that you recognize the pattern, you can take control.",
        takeaway: "Action: If you feel understood and see the pattern, contact Rupesh via WhatsApp to decode your specific dynamics.",
        image: "/assets/hyperfocus/post_17.png"
    }
];

const LustDecodedSeries = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [currentPostIndex, setCurrentPostIndex] = useState(0);
    const [ageConfirmed, setAgeConfirmed] = useState(false);
    const [completed, setCompleted] = useState(false);
    const [isPremium, setIsPremium] = useState(false);
    const [isFreeUnlocked, setIsFreeUnlocked] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentError, setPaymentError] = useState('');
    const seriesRef = useRef(null);
    const { markAsRead, isRead } = useSeriesProgress('lust-decoded');

    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    useEffect(() => {
        const checkAge = localStorage.getItem('lustdecoded_age_confirmed');
        if (checkAge === 'true') {
            setAgeConfirmed(true);
        }

        const checkAccess = async () => {
            const hasAccess = await sustainability.verifyAccess(currentUser, SUBSCRIPTION_TIERS.BASIC);
            setIsPremium(hasAccess);

            // Resume progress check
            if (currentUser) {
                try {
                    const userRef = doc(db, 'users', currentUser.uid);
                    const snap = await getDoc(userRef);
                    if (snap.exists() && snap.data().seriesProgress?.lustdecoded > 1) {
                        // Resumed
                    }
                } catch (e) { }
            }
        };
        checkAccess();

        analytics.logEvent('series_start', { series: 'lustdecoded' });

        document.body.classList.add('lustdecoded-mode');
        return () => {
            document.body.classList.remove('lustdecoded-mode');
        };
    }, [currentUser]);

    useEffect(() => {
        if (!ageConfirmed) return;

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
                            series: 'lustdecoded',
                            post_id: index + 1,
                            post_title: postsData[index].title
                        });

                        if (currentUser) {
                            const userRef = doc(db, 'users', currentUser.uid);
                            updateDoc(userRef, {
                                [`seriesProgress.lustdecoded`]: index + 1
                            }).catch(e => console.error("Error saving progress:", e));
                        }
                    }
                }
            });

            const bottomCta = document.querySelector('.bottom-cta');
            if (bottomCta) {
                const rect = bottomCta.getBoundingClientRect();
                if (rect.top < window.innerHeight && !completed) {
                    setCompleted(true);
                    analytics.logEvent('series_completion', { series: 'lustdecoded' });
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [currentPostIndex, completed, currentUser, ageConfirmed]);

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
            analytics.logEvent('series_unlock_free', { series: 'lustdecoded' });
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
            analytics.logEvent('series_unlock_success', { series: 'lustdecoded' });
        } catch (error) {
            console.error("Unlock failed:", error);
            setPaymentError('Payment was cancelled or failed. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    const confirmAge = () => {
        localStorage.setItem('lustdecoded_age_confirmed', 'true');
        setAgeConfirmed(true);
    };

    if (!ageConfirmed) {
        return (
            <div className="age-gate-container">
                <div className="age-gate-modal">
                    <h2>Adult Content Warning</h2>
                    <p>This series 'Lust Decoded' discusses sensitive topics surrounding intimacy, attraction, and adult relationship dynamics.</p>
                    <p className="bold-warn">You must be 18 years or older to view this content.</p>
                    <div className="age-btn-row">
                        <button className="btn-deny" onClick={() => navigate('/series')}>I am under 18 (Leave)</button>
                        <button className="btn-confirm" onClick={confirmAge}>I am 18 or older (Enter)</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="lustdecoded-page">
            <SEO 
                title="Lust Decoded: Intimacy & Attraction"
                description="Master the unseen patterns of attraction and relationship dynamics. Understand the quiet shifts in intimacy."
                url="https://soulthread.in/lust-decoded"
                type="article"
            />
            <header className="sticky-header">
                <div className="header-content">
                    <Link to="/" className="logo-link">
                        <span className="logo-text">SOULTHREAD</span>
                    </Link>
                    <div className="series-title-mini">Lust Decoded</div>
                    <div className="progress-text">
                        Section {currentPostIndex + 1} / {postsData.length}
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
                    LUST DECODED
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    By Founder Rupesh Ojha — Real-world observations on intimacy, attraction, and relationship dynamics.
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
                    BEGIN DECODING
                </motion.button>
            </section>

            <main className="series-container" ref={seriesRef}>
                <div className="posts-list">
                    {postsData.map((post, index) => {
                        const midPoint = Math.floor(postsData.length / 2);
                        const isLocked = index >= midPoint && !isPremium && !isFreeUnlocked && !currentUser?.isAdmin;
                        
                        // We show only the FIRST locked block (the wall)
                        if (isLocked && index > midPoint) return null;

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
                                    <SeriesPaywall
                                        seriesId="lustdecoded"
                                        seriesTitle="Lust Decoded"
                                        onUnlock={handleUnlock}
                                        isProcessing={isProcessing}
                                        paymentError={paymentError}
                                    />
                                ) : (
                                    <>
                                        <div className="post-header">
                                            <span className="post-number">POST {post.id} / {postsData.length}</span>
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
                                                <div className="action-footer" style={{ marginTop: '20px' }}>
                                                    {!isRead(post.title) ? (
                                                        <button 
                                                            className="mark-done-btn"
                                                            onClick={() => markAsRead(post.title)}
                                                            style={{
                                                                background: 'transparent',
                                                                border: '1px solid var(--color-accent)',
                                                                color: 'var(--color-accent)',
                                                                padding: '8px 16px',
                                                                borderRadius: '20px',
                                                                cursor: 'pointer',
                                                                fontSize: '0.8rem',
                                                                fontWeight: '600'
                                                            }}
                                                        >
                                                            MARK AS COMPLETE
                                                        </button>
                                                    ) : (
                                                        <span className="done-status" style={{ color: 'var(--color-accent)', fontSize: '0.8rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                            <Check size={14} /> LOGGED
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            {post.id === postsData.length && (
                                                <div className="whatsapp-contact-cta">
                                                    <a href="https://wa.me/919169658628" className="wa-btn" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                                        <MessageCircle size={18} /> Connect on WhatsApp
                                                    </a>
                                                </div>
                                            )}
                                        </div>

                                        <div className="post-navigation">
                                            <button
                                                className="nav-btn prev"
                                                disabled={index === 0}
                                                onClick={() => scrollToPost(index - 1)}
                                                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                                            >
                                                <ArrowLeft size={16} /> Previously
                                            </button>
                                            <button
                                                className="nav-btn next"
                                                disabled={index === postsData.length - 1}
                                                onClick={() => scrollToPost(index + 1)}
                                                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                                            >
                                                Continue <ArrowRight size={16} />
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
                <div style={{ marginTop: '40px' }}>
                    <p>Return to the library to explore other topics.</p>
                    <Link to="/series" className="explore-btn" style={{ marginTop: '16px' }}>
                        Browse All Series
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default LustDecodedSeries;
