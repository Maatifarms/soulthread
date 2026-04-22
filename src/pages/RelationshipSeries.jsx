import { useEffect, useState } from 'react';
import { Check, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useSpring } from 'framer-motion';
import { analytics } from '../services/analytics';
import { db } from '../services/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { useSeriesProgress } from '../hooks/useSeriesProgress';
import { sustainability, SUBSCRIPTION_TIERS } from '../services/sustainabilityModel';
import { paymentService } from '../services/paymentService';
import SEO from '../components/common/SEO';
import SeriesPaywall from '../components/series/SeriesPaywall';
import './RelationshipSeries.css';

const chaptersData = [
    {
        id: 1,
        title: "The Narcissism of Loneliness",
        insight: "Stop looking for someone to 'complete' you. A relationship of two incomplete people is a disaster. You must be whole first.",
        practicum: "Spend tonight alone, without your phone. Listen to your own internal monologue. That is your primary relationship.",
        image: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&q=80&w=1200"
    },
    {
        id: 2,
        title: "Career vs. Relationship",
        insight: "In your 20s, a toxic relationship doesn't just hurt your heart; it kills your career. Ambition needs peace to grow.",
        practicum: "If your partner makes you feel guilty for working hard, that is a red flag. Choose growth over comfort.",
        image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1200"
    },
    {
        id: 3,
        title: "The Hook-up Illusion",
        insight: "Casual culture often masks a deep fear of vulnerability. You aren't 'free'; you're just avoiding the mirror a real partner holds up.",
        practicum: "Ask yourself: Is my desire for 'casual' a choice of freedom, or a shield against potential rejection?",
        image: "https://images.unsplash.com/photo-1501901642054-dfc6b18d3049?auto=format&fit=crop&q=80&w=1200"
    },
    {
        id: 4,
        title: "Communication is a Skill, Not a Feeling",
        insight: "We don't talk to understand; we talk to win. In a relationship, if one person wins the argument, the relationship loses.",
        practicum: "Next time you disagree, start with: 'I see where you're coming from.' De-escalate before you debate.",
        image: "https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&q=80&w=1200"
    },
    {
        id: 5,
        title: "The Truth About 'The One'",
        insight: "Soulmates aren't found; they are forged. Relationships are 10% chemistry and 90% hard, repetitive work.",
        practicum: "Stop looking for a 'perfect' partner. Start becoming a partner who can build something perfect over time.",
        image: "https://images.unsplash.com/photo-1516589174184-c6858b16ecb0?auto=format&fit=crop&q=80&w=1200"
    },
    {
        id: 6,
        title: "Toxic Attachment Patterns",
        insight: "We are attracted to the familiar, not the healthy. Some people mistake 'chaos' for 'intensity.'",
        practicum: "Identify one recurring dynamic in your past relationships that felt 'exciting' but was actually draining.",
        image: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&q=80&w=1200"
    },
    {
        id: 7,
        title: "Handling the Breakup",
        insight: "A breakup is a physical addiction withdrawal. Your brain is literally starving for their dopamine. Use the No-Contact Rule for survival.",
        practicum: "Block, delete, and distance. You cannot heal in the same environment that broke you.",
        image: "https://images.unsplash.com/photo-1518331647614-7a1f04cd34cf?auto=format&fit=crop&q=80&w=1200"
    },
    {
        id: 8,
        title: "Healing & Self-Worth",
        insight: "They didn't just leave; they left you with a question: 'Was I ever enough?' The answer must come from you, not them.",
        practicum: "Write down 5 things you love about yourself that have NOTHING to do with being someone's partner.",
        image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=1200"
    },
    {
        id: 9,
        title: "Emotional Debt",
        insight: "Bringing old trauma into a new relationship is like paying for a new house with someone else's gambling debt.",
        practicum: "Tell your partner (or future partner) one thing from your past that 'triggers' you, so they don't step on it blindly.",
        image: "https://images.unsplash.com/photo-1505234486350-b9f8ce392bcc?auto=format&fit=crop&q=80&w=1200"
    },
    {
        id: 10,
        title: "The Partnership Blueprint",
        insight: "A great relationship is not a lack of problems. It is a shared willingness to solve them. You are a team against the problem.",
        practicum: "Discuss your goals for the next 5 years with your partner. Are you building the same house?",
        image: "https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&q=80&w=1200"
    }
];

const RelationshipSeries = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [currentPostIndex, setCurrentPostIndex] = useState(0);
    const [isPremium, setIsPremium] = useState(false);
    const [isFreeUnlocked, setIsFreeUnlocked] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentError, setPaymentError] = useState('');
    const [loading, setLoading] = useState(true);
    const { markAsRead, isRead } = useSeriesProgress('relationship-mastery');

    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

    useEffect(() => {
        const checkAccess = async () => {
            const hasAccess = await sustainability.verifyAccess(currentUser, SUBSCRIPTION_TIERS.BASIC);
            setIsPremium(hasAccess);
            setLoading(false);
        };
        checkAccess();

        analytics.logEvent('series_start', { series: 'relationship_mastery' });
        document.body.classList.add('relationship-mode');
        return () => document.body.classList.remove('relationship-mode');
    }, [currentUser]);

    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY + window.innerHeight / 2;
            const posts = document.querySelectorAll('.chapter-block');

            posts.forEach((post, index) => {
                const rect = post.getBoundingClientRect();
                const absoluteTop = rect.top + window.scrollY;
                if (scrollPosition >= absoluteTop && scrollPosition < absoluteTop + rect.height) {
                    if (index !== currentPostIndex) {
                        setCurrentPostIndex(index);
                        // Save progress
                        if (currentUser) {
                            const userRef = doc(db, 'users', currentUser.uid);
                            updateDoc(userRef, {
                                [`seriesProgress.relationship-mastery`]: index + 1
                            }).catch(e => console.error("Error saving progress:", e));
                        }
                    }
                }
            });
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [currentPostIndex, currentUser]);

    const scrollToPost = (index) => {
        const posts = document.querySelectorAll('.chapter-block');
        if (posts[index]) {
            const top = posts[index].getBoundingClientRect().top + window.scrollY - 80;
            window.scrollTo({ top, behavior: 'smooth' });
        }
    };

    const handleUnlock = async (isFree = false) => {
        if (isFree) {
            setIsFreeUnlocked(true);
            analytics.logEvent('series_unlock_free', { series: 'relationship_mastery' });
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

    if (loading) return <div className="zen-loader">Facing the Shadow...</div>;

    return (
        <div className="relationship-series-page">
            <SEO 
                title="Relationship Mastery: The Heart's Journey | SoulThread" 
                description="Navigate the complexities of modern dating, breakups, and self-worth in this 10-chapter immersive series."
            />
            <header className="sticky-header-heart">
                <div className="header-inner">
                    <Link to="/" className="logo-link"><span className="logo-heart">SOULTHREAD</span></Link>
                    <div className="series-title-mini">Relationship Mastery</div>
                    <div className="progress-info">Chapter {currentPostIndex + 1} / 10</div>
                </div>
                <motion.div className="progress-track" style={{ scaleX }} />
            </header>

            <main>
                <section className="hero-heart">
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                    >RELATIONSHIP<br/>MASTERY</motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >Modern dynamics, ancient biological traps, and the path to becoming a partner worth having.</motion.p>
                    <button className="unlock-btn-heart" style={{ marginTop: '48px' }} onClick={() => scrollToPost(0)}>START JOURNEY</button>
                </section>

                <div className="chapters-timeline">
                    {chaptersData.map((chapter, index) => {
                        const midPoint = Math.floor(chaptersData.length / 2);
                        const isLocked = index >= midPoint && !isPremium && !isFreeUnlocked && !currentUser?.isAdmin;
                        
                        if (isLocked && index > midPoint) return null;

                        return (
                            <motion.div 
                                key={chapter.id}
                                className={`chapter-block ${isLocked ? 'blurred-block' : ''}`}
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true, margin: "-100px" }}
                            >
                                {isLocked ? (
                                    <SeriesPaywall
                                        seriesId="relationship-mastery"
                                        seriesTitle="Relationship Mastery"
                                        onUnlock={handleUnlock}
                                        isProcessing={isProcessing}
                                        paymentError={paymentError}
                                    />
                                ) : (
                                    <>
                                        <div className="chapter-meta">
                                            <span className="chapter-id">CHAPTER {chapter.id}</span>
                                            <div style={{ height: '1px', flex: 1, background: 'rgba(244, 63, 94, 0.2)' }} />
                                        </div>
                                        <h3>{chapter.title}</h3>
                                        <div className="chapter-visual">
                                            <img src={chapter.image} alt={chapter.title} loading="lazy" />
                                        </div>
                                        <div className="insight-card">
                                            <h4>Transformation Focus</h4>
                                            <p>{chapter.insight}</p>
                                        </div>
                                        <div className="practicum-box" style={{ background: 'rgba(255, 107, 107, 0.05)', padding: '24px', borderRadius: '16px', borderLeft: '4px solid #ff6b6b', marginBottom: '24px' }}>
                                            <h4 style={{ color: '#ff6b6b', fontSize: '1rem', fontWeight: '800', marginBottom: '12px' }}>PRACTICUM</h4>
                                            <p style={{ fontSize: '1.1rem', fontStyle: 'italic', color: 'rgba(255,255,255,0.9)' }}>{chapter.practicum}</p>
                                            <div className="action-footer" style={{ marginTop: '24px' }}>
                                                {!isRead(chapter.title) ? (
                                                    <button 
                                                        className="mark-done-btn"
                                                        onClick={() => markAsRead(chapter.title)}
                                                        style={{ background: '#ff6b6b', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '30px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                                                    >
                                                        <Check size={18} /> MARK AS DONE
                                                    </button>
                                                ) : (
                                                    <span style={{ color: '#ff6b6b', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <Check size={18} /> LESSON COMPLETE
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                )}
                                {index < chaptersData.length - 1 && <div style={{ height: '100px' }} />}
                            </motion.div>
                        );
                    })}
                </div>
            </main>

            <footer className="paywall-heart">
                <h2>Love is a choice.</h2>
                <p>Choose growth. Choose yourself. Build something that lasts.</p>
                <Link to="/series" className="unlock-btn-heart" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    Return to Library <ArrowRight size={18} />
                </Link>
            </footer>
        </div>
    );
};

export default RelationshipSeries;
