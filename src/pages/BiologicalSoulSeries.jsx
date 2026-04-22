import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useSpring } from 'framer-motion';
import { analytics } from '../services/analytics';
import { db } from '../services/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { SUBSCRIPTION_TIERS, sustainability } from '../services/sustainabilityModel';
import { paymentService } from '../services/paymentService';
import SEO from '../components/common/SEO';
import SeriesPaywall from '../components/series/SeriesPaywall';
import './BiologicalSoulSeries.css';

const chapters = [
    {
        id: 1, 
        module: "THE EVOLUTIONARY BLUEPRINT",
        title: "The Categorical Mind",
        insight: "Your brain loves boxes. But biology doesn't care about your buckets. Human behavior is a continuum, not a checklist.",
        takeaway: "Notice when you label a behavior as 'just' genetic or 'just' learned. It is ALWAYS both.",
        image: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&q=80&w=1200"
    },
    {
        id: 2,
        module: "THE EVOLUTIONARY BLUEPRINT",
        title: "The Game of Survival",
        insight: "Evolution is not about individuals; it's about gene frequencies. Altruism is often just a calculated long-term investment.",
        takeaway: "Think about your 'selfless' acts. How many were driven by kin selection or reciprocity?",
        image: "https://images.unsplash.com/photo-1543269664-56d93c1b41a6?auto=format&fit=crop&q=80&w=1200"
    },
    {
        id: 3,
        module: "THE EVOLUTIONARY BLUEPRINT",
        title: "Cooperation & Tit-for-Tat",
        insight: "In a world of strangers, the most successful strategy is 'Nice, Retaliatory, and Forgiving.'",
        takeaway: "Apply the tit-for-tat strategy to one difficult person in your life this week.",
        image: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&q=80&w=1200"
    },
    {
        id: 4,
        module: "THE GENETIC CODE",
        title: "The Molecular Alphabet",
        insight: "Genes are NOT blueprints. They are 'To-Do' lists that can be edited by the environment.",
        takeaway: "Genes only tell you about *potential*. Your environment determines which genes are expressed.",
        image: "https://images.unsplash.com/photo-1530210124550-912dc1381cb8?auto=format&fit=crop&q=80&w=1200"
    },
    {
        id: 5,
        module: "THE GENETIC CODE",
        title: "Epigenetics: The Soul's Ghost",
        insight: "Trauma and stress can leave marks on your DNA that last for generations. Your ancestors' lives are written in your cells.",
        takeaway: "Acknowledge that some of your predispositions might be echoes from your family's history.",
        image: "https://images.unsplash.com/photo-1559131397-f94da358f7ca?auto=format&fit=crop&q=80&w=1200"
    },
    {
        id: 6,
        module: "THE GENETIC CODE",
        title: "Heritability vs Certainty",
        insight: "Saying a trait is 50% heritable does NOT mean you're 50% destined to have it. It's about population variance.",
        takeaway: "Stop thinking of genetics as destiny. It's a set of statistical probabilities.",
        image: "https://images.unsplash.com/photo-1448932223556-3ac099df243a?auto=format&fit=crop&q=80&w=1200"
    },
    {
        id: 7,
        module: "THE GENETIC CODE",
        title: "The Interaction Effect",
        insight: "A gene for depression might only matter if you live through a childhood trauma. The 'G x E' interaction is the key.",
        takeaway: "Focus on controlling your 'E' (Environment) to manage your 'G' (Genetics).",
        image: "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&q=80&w=1200"
    },
    {
        id: 8,
        module: "THE NEURAL ENGINE",
        title: "Pattern Recognition",
        insight: "Your brain is a prediction machine. It scans the environment to avoid surprises, often creating stories that aren't there.",
        takeaway: "Identify one assumption you made today that was based on a pattern from your past.",
        image: "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&q=80&w=1200"
    },
    {
        id: 9,
        module: "THE NEURAL ENGINE",
        title: "Neurons: The Messengers",
        insight: "Every thought, every fear, every 'soulful' moment is just ions moving across a membrane. Matter becomes consciousness.",
        takeaway: "Visualize your willpower as literal electricity flowing through your neurons.",
        image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&q=80&w=1200"
    },
    {
        id: 10,
        module: "THE NEURAL ENGINE",
        title: "The Space Between",
        insight: "The synapse is where the magic happens. Neurotransmitters are the ink in which our experience is written.",
        takeaway: "Consider how your diet and sleep affect the chemical ink of your brain today.",
        image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1200"
    },
    {
        id: 11,
        module: "THE NEURAL ENGINE",
        title: "Neuroplasticity",
        insight: "The brain is remarkably plastic until the day you die. You can physically prune and grow your own hardware.",
        takeaway: "Engage in one 'new' difficult cognitive activity today to trigger plasticity.",
        image: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?auto=format&fit=crop&q=80&w=1200"
    },
    {
        id: 12,
        module: "THE NEURAL ENGINE",
        title: "The Hormonal Orchestra",
        insight: "Hormones don't CAUSE behaviors. They change how you perceive the world, making you more or less likely to act.",
        takeaway: "Observe how your stress levels (cortisol) change your interpretation of a simple comment.",
        image: "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=1200"
    },
    {
        id: 13,
        module: "THE NEURAL ENGINE",
        title: "Testosterone Myths",
        insight: "Testosterone doesn't cause aggression; it magnifies whatever behavior is needed to maintain status.",
        takeaway: "In a 'noble' culture, testosterone would actually make you act more generously to gain status.",
        image: "https://images.unsplash.com/photo-1555448049-816bcc7b25ad?auto=format&fit=crop&q=80&w=1200"
    },
    {
        id: 14,
        module: "THE NEURAL ENGINE",
        title: "Oxytocin: The Dark Side",
        insight: "The 'love hormone' also makes you more xenophobic. It bonds the 'Us' and magnifies the hatred of 'Them'.",
        takeaway: "Be wary of intense group bonding—it often comes at the expense of outsiders.",
        image: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&q=80&w=1200"
    },
    {
        id: 15,
        module: "THE LIMBIC MACHINE",
        title: "The Seat of Emotion",
        insight: "The Limbic System is where we truly live. It's the ancient brain that doesn't care about logic or your career.",
        takeaway: "When you feel an 'irrational' fear, thank your limbic system for trying to keep you alive.",
        image: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&q=80&w=1200"
    },
    {
        id: 16,
        module: "THE LIMBIC MACHINE",
        title: "Amygdala: The Alarm",
        insight: "The amygdala processes fear before you even know what you're looking at. It's faster than your vision.",
        takeaway: "Breathe. When triggered, your amygdala has a 2-second lead on your logic. Wait for the logic to catch up.",
        image: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&q=80&w=1200"
    },
    {
        id: 17,
        module: "THE LIMBIC MACHINE",
        title: "Sexual Selection",
        insight: "Mating strategies across the animal kingdom explain why humans are 'confused' biparental species.",
        takeaway: "Realize that human society's conflict between polygamy and monogamy is baked into our biology.",
        image: "https://images.unsplash.com/photo-1516589174184-c6858b16ecb0?auto=format&fit=crop&q=80&w=1200"
    },
    {
        id: 18,
        module: "THE LIMBIC MACHINE",
        title: "Mate Choice Biology",
        insight: "We choose partners based on MHC diversity and facial symmetry—biological hacks for a healthy immune system.",
        takeaway: "Sometimes your 'gut feeling' about someone is just your immune system doing math.",
        image: "https://images.unsplash.com/photo-1454165833767-0274b1022712?auto=format&fit=crop&q=80&w=1200"
    },
    {
        id: 19,
        module: "SOCIETY & SHADOWS",
        title: "The Biology of Aggression",
        insight: "We don't hate aggression; we hate the *wrong kind* of aggression. We celebrate it on the football field or the battlefield.",
        takeaway: "Reflect on which forms of violence you tolerate or even praise.",
        image: "https://images.unsplash.com/photo-1544648397-52ee3bf827be?auto=format&fit=crop&q=80&w=1200"
    },
    {
        id: 20,
        module: "SOCIETY & SHADOWS",
        title: "War & Peace",
        insight: "Chimpanzees hunt and murder; Bonobos have sex to resolve conflict. Humans are the only ones who can do both in an hour.",
        takeaway: "Recognize that your capacity for both empathy and cruelty is equally 'natural'.",
        image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1200"
    },
    {
        id: 21,
        module: "SOCIETY & SHADOWS",
        title: "Chaos & Complexity",
        insight: "Complex systems are not just small systems with more parts. They have emergent properties that cannot be predicted.",
        takeaway: "Stop looking for single causes (like 'the gene for X'). The truth is always an emergent network.",
        image: "https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&q=80&w=1200"
    },
    {
        id: 22,
        module: "SOCIETY & SHADOWS",
        title: "Emergence",
        insight: "A colony of ants is smart; the individual ant is not. You are a colony of 30 trillion cells.",
        takeaway: "Respect the collective intelligence of your own body and your social tribe.",
        image: "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?auto=format&fit=crop&q=80&w=1200"
    },
    {
        id: 23,
        module: "SOCIETY & SHADOWS",
        title: "The Language Instinct",
        insight: "Language is a biological adaptation that allows us to share our internal neural maps with others.",
        takeaway: "Words are literally tools for brain-to-brain synchronization. Use them carefully.",
        image: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=1200"
    },
    {
        id: 24,
        module: "SOCIETY & SHADOWS",
        title: "The Schizophrenic Mind",
        insight: "Schizophrenia is not just 'broken' brain; it's a window into the evolution of human imagination and religiosity.",
        takeaway: "The line between a shaman and a patient is often just a matter of cultural context.",
        image: "https://images.unsplash.com/photo-1518331647614-7a1f04cd34cf?auto=format&fit=crop&q=80&w=1200"
    },
    {
        id: 25,
        module: "SOCIETY & SHADOWS",
        title: "Individual Variation",
        insight: "The most robust finding in all of biology is variation. There is no 'normal'. There is only a distribution.",
        takeaway: "Embrace the 'outliers' in your community. They are the engine of evolutionary adaptation.",
        image: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&q=80&w=1200"
    }
];

const BiologicalSoulSeries = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [currentPostIndex, setCurrentPostIndex] = useState(0);
    const [isPro, setIsPro] = useState(false);
    const [isFreeUnlocked, setIsFreeUnlocked] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentError, setPaymentError] = useState('');
    const [loading, setLoading] = useState(true);

    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

    useEffect(() => {
        const checkAccess = async () => {
            const hasAccess = await sustainability.verifyAccess(currentUser, SUBSCRIPTION_TIERS.PRO);
            setIsPro(hasAccess);
            setLoading(false);

            // Fetch progress
            if (currentUser) {
                try {
                    const userRef = doc(db, 'users', currentUser.uid);
                    const snap = await getDoc(userRef);
                    if (snap.exists() && snap.data().seriesProgress?.['biological_soul'] > 1) {
                         // progress loaded
                    }
                } catch (e) { }
            }
        };
        checkAccess();

        analytics.logEvent('series_start', { series: 'biological_soul' });
        document.body.classList.add('sapolsky-mode');
        return () => document.body.classList.remove('sapolsky-mode');
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
                        // Save progress
                        if (currentUser) {
                            const userRef = doc(db, 'users', currentUser.uid);
                            updateDoc(userRef, {
                                [`seriesProgress.biological-soul`]: index + 1
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
        const posts = document.querySelectorAll('.post-block');
        if (posts[index]) {
            const top = posts[index].getBoundingClientRect().top + window.scrollY - 80;
            window.scrollTo({ top, behavior: 'smooth' });
        }
    };

    const handleUpgrade = async (isFree = false) => {
        if (isFree) {
            setIsFreeUnlocked(true);
            analytics.logEvent('series_unlock_free', { series: 'biological_soul' });
            return;
        }

        setPaymentError('');
        if (!currentUser) {
            navigate('/login');
            return;
        }
        setIsProcessing(true);
        try {
            const tier = sustainability.getTierDetails(SUBSCRIPTION_TIERS.PRO);
            await paymentService.initializeRazorpay(currentUser, { ...tier, id: SUBSCRIPTION_TIERS.PRO }, tier.price);
            setIsPro(true);
        } catch (error) {
            console.error("Upgrade failed:", error);
            setPaymentError('Payment was cancelled or failed. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading) return <div className="zen-loader">Mapping the Nervous System...</div>;

    return (
        <div className="biological-soul-page">
            <SEO 
                title="The Biological Soul: Human Nature Decoded | Robert Sapolsky Series"
                description="Explore the biology of behavior, genetics, and neuroscience in this 25-chapter series based on Robert Sapolsky's Stanford lectures."
            />
            <header className="sticky-header">
                <div className="header-content">
                    <Link to="/" className="logo-link"><span className="logo-text">SOULTHREAD</span></Link>
                    <div className="series-title-mini">The Biological Soul</div>
                    <div className="progress-text">Lecture {currentPostIndex + 1} / 25</div>
                </div>
                <motion.div className="progress-bar-top" style={{ scaleX }} />
            </header>

            <section className="hero-section">
                <div className="hero-visual-box">
                    <img src="https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&q=80&w=1200" alt="Biological Soul" className="hero-img-main" />
                </div>
                <h1>The Biological Soul</h1>
                <p>Decoding the human machine through the lens of Stanford’s Robert Sapolsky. 25 Lectures on why we do what we do.</p>
                <button className="start-btn" onClick={() => scrollToPost(0)}>START CURRICULUM</button>
            </section>

            <main className="posts-list">
                <div className="series-intro">
                    <span className="module-badge">Flagship Academic Series</span>
                    <p>This journey covers the evolutionary, genetic, and neural mechanisms that shape the human soul. Every chapter corresponds to a foundational Stanford lecture.</p>
                </div>

                {chapters.map((chapter, index) => {
                    const midPoint = Math.floor(chapters.length / 2);
                    const isLocked = index >= midPoint && !isPro && !isFreeUnlocked && !currentUser?.isAdmin;
                    
                    if (isLocked && index > midPoint) return null;

                    return (
                        <motion.div 
                            key={chapter.id}
                            className={`post-block ${isLocked ? 'locked-render' : ''}`}
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                        >
                            {isLocked ? (
                                <SeriesPaywall
                                    seriesId="biological-soul"
                                    seriesTitle="The Biological Soul"
                                    onUnlock={handleUpgrade}
                                    isProcessing={isProcessing}
                                    paymentError={paymentError}
                                />
                            ) : (
                                <>
                                    <div className="post-header">
                                        <span className="module-label">{chapter.module}</span>
                                        <span className="post-number">LECTURE {chapter.id} / 25</span>
                                        <h3>{chapter.title}</h3>
                                    </div>
                                    <div className="post-image-container">
                                        <img src={chapter.image} alt={chapter.title} className="post-image" loading="lazy" />
                                    </div>
                                    <div className="post-content">
                                        <div className="insight-box">
                                            <span className="insight-label">The Core Insight</span>
                                            <p className="insight-text">{chapter.insight}</p>
                                        </div>
                                        <div className="takeaway-box">
                                            <p className="takeaway-text"><strong>Practicum:</strong> {chapter.takeaway}</p>
                                        </div>
                                    </div>
                                    <div className="post-navigation-footer">
                                        <button className="btn-nav" onClick={() => scrollToPost(index + 1)}>
                                            CONTINUE STUDY <ArrowRight size={16} style={{ marginLeft: '8px' }} />
                                        </button>
                                    </div>
                                </>
                            )}
                            {index < chapters.length - 1 && <div className="post-divider" />}
                        </motion.div>
                    );
                })}
            </main>

            <section className="bottom-cta" style={{ textAlign: 'center', padding: '100px 24px', background: 'rgba(5, 26, 17, 0.5)' }}>
                <h2>The Buck Stops Nowhere</h2>
                <p>Behavior is an emergent property of millions of years of history and milliseconds of hormones.</p>
                <Link to="/series" className="start-btn" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', marginTop: '32px' }}>
                    Browse More Mastery <ArrowRight size={16} style={{ marginLeft: '8px' }} />
                </Link>
            </section>
        </div>
    );
};

export default BiologicalSoulSeries;
