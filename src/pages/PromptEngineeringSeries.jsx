import React, { useEffect, useState, useRef } from 'react';
import { Check, ArrowLeft, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useSpring } from 'framer-motion';
import { analytics } from '../services/analytics';
import { db } from '../services/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import SEO from '../components/common/SEO';
import SeriesPaywall from '../components/series/SeriesPaywall';
import { useSeriesProgress } from '../hooks/useSeriesProgress';
import { sustainability, SUBSCRIPTION_TIERS } from '../services/sustainabilityModel';
import './PromptEngineeringSeries.css';

const postsData = [
    {
        id: 1,
        title: "THE ARCHITECT MINDSET",
        insight: "Stop treating AI like a search engine. Treat it like a highly skilled, literal-minded intern who needs exact blueprints.",
        takeaway: "Action: Rewrite your last prompt as a set of 'Technical Requirements' rather than a question.",
        image: "/assets/prompt/post_01.png"
    },
    {
        id: 2,
        title: "THE STRUCTURE OF THOUGHT",
        insight: "Garbage In, Garbage Out. A great prompt has four pillars: Context, Task, Constraints, and Output Format.",
        takeaway: "Action: Analyze a failed prompt and identify which of the four pillars was missing.",
        image: "/assets/prompt/post_02.png"
    },
    {
        id: 3,
        title: "CONTEXT IS KING",
        insight: "AI doesn't know what you know. You must provide the background, the audience, and the tone before asking for the work.",
        takeaway: "Action: Write a 3-sentence 'Context Block' for a task you perform daily.",
        image: "/assets/prompt/post_03.png"
    },
    {
        id: 4,
        title: "THE PERSONA OF AI",
        insight: "Assigning a role (e.g., 'Act as a Senior Copywriter') activates specific neural pathways in the model's training data.",
        takeaway: "Action: Compare the results of the same prompt with two different personas assigned.",
        image: "/assets/prompt/post_01.png" // Placeholder
    },
    {
        id: 5,
        title: "NEGATIVE CONSTRAINTS",
        insight: "Telling AI what NOT to do is as important as telling it what to do. Clear boundaries prevent hallucination.",
        takeaway: "Action: Create a list of 5 'Forbidden Keywords' for your next business email prompt.",
        image: "/assets/prompt/post_02.png" // Placeholder
    },
    {
        id: 6,
        title: "ITERATIVE FEEDBACK LOOPS",
        insight: "The first prompt is rarely the last. Treat the AI response as a draft and use 'Prompt Refining' to polish it.",
        takeaway: "Action: Instead of starting over, ask the AI to 'Critique its own response' and then fix it.",
        image: "/assets/prompt/post_03.png" // Placeholder
    },
    {
        id: 7,
        title: "STRUCTURED OUTPUTS",
        insight: "Ask for data in specific formats—JSON, Markdown tables, or CSV—to make the AI's output immediately usable.",
        takeaway: "Action: Ask AI to summarize a topic into a 3-column Markdown table.",
        image: "/assets/prompt/post_08.png"
    },
    {
        id: 8,
        title: "CHAIN OF THOUGHT REASONING",
        insight: "Force the AI to 'Think Step-by-Step'. This reduces errors in logic and complex problem solving.",
        takeaway: "Action: Add the phrase 'Think step-by-step before answering' to a math or logic problem.",
        image: "/assets/prompt/post_08.png"
    },
    {
        id: 9,
        title: "TEMPERATURE & RANDOMNESS",
        insight: "Understand 'Temperature'. Low temperature for facts and code; high temperature for creative writing and brainstorming.",
        takeaway: "Action: Research how to adjust the 'Temperature' setting in your favorite AI tool.",
        image: "/assets/prompt/post_10.png"
    },
    {
        id: 10,
        title: "THE FUTURE OF AI COLLABORATION",
        insight: "Prompting is the new coding. It is the bridge between human intent and machine execution. Master it, or be left behind.",
        takeaway: "Action: Commit to learning one new advanced prompting technique every week.",
        image: "/assets/prompt/post_10.png"
    }
];

const PromptEngineeringSeries = () => {
    const { currentUser } = useAuth();
    const [currentPostIndex, setCurrentPostIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const { markAsRead, isRead } = useSeriesProgress('prompt-engineering');
    const [completed, setCompleted] = useState(false);
    const [isPremium, setIsPremium] = useState(false);
    const [isFreeUnlocked, setIsFreeUnlocked] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentError, setPaymentError] = useState(null);
    const seriesRef = useRef(null);
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    const totalLessons = postsData.length;
    const freeThreshold = Math.floor(totalLessons / 2); // 50% free

    useEffect(() => {
        const checkAccess = async () => {
            if (currentUser) {
                const hasAccess = await sustainability.verifyAccess(currentUser, SUBSCRIPTION_TIERS.BASIC);
                setIsPremium(hasAccess);
            }
        };
        checkAccess();
    }, [currentUser]);

    const handleUnlock = async () => {
        setIsProcessing(true);
        setPaymentError(null);
        try {
            const success = await sustainability.processPayment(currentUser, SUBSCRIPTION_TIERS.BASIC);
            if (success) {
                setIsPremium(true);
                analytics.logEvent('subscription_success', { tier: 'soul_basic', series: 'prompt_engineering' });
            }
        } catch (err) {
            setPaymentError(err.message);
        } finally {
            setIsProcessing(false);
        }
    };

    useEffect(() => {
        // Track Start
        analytics.logEvent('series_start', { series: 'prompt_engineering' });

        document.body.classList.add('hyperfocus-mode');
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
                            series: 'prompt_engineering',
                            post_id: index + 1,
                            post_title: postsData[index].title
                        });

                        // Save progress to Firestore
                        if (currentUser) {
                            const userRef = doc(db, 'users', currentUser.uid);
                            updateDoc(userRef, {
                                [`seriesProgress.prompt-engineering`]: index + 1
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
                    analytics.logEvent('series_completion', { series: 'prompt_engineering' });
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [currentPostIndex, completed]);

    const scrollToPost = (index) => {
        const posts = document.querySelectorAll('.post-block');
        if (posts[index]) {
            const top = posts[index].getBoundingClientRect().top + window.scrollY - 80;
            window.scrollTo({ top, behavior: 'smooth' });
        }
    };

    return (
        <div className="hyperfocus-page prompt-engineering-page">
            <SEO 
                title="The Prompt Architect: Mastering AI Engineering"
                description="Master the art and science of AI prompting. A 10-part deep dive into engineering intent into machine intelligence."
                image="/assets/prompt/post_01.png"
                url="https://soulthread.in/prompt-engineering-series"
                type="article"
                schema={{
                    "@context": "https://schema.org",
                    "@type": "Course",
                    "name": "The Prompt Architect",
                    "description": "A 10-part deep dive into mastering AI engineering and prompt design.",
                    "provider": {
                        "@type": "Organization",
                        "name": "SoulThread",
                        "sameAs": "https://soulthread.in"
                    }
                }}
            />
            <header className="sticky-header">
                <div className="header-content">
                    <Link to="/" className="logo-link">
                        <span className="logo-text">SOULTHREAD</span>
                    </Link>
                    <div className="series-title-mini">The Prompt Architect</div>
                    <div className="progress-text">
                        Section {currentPostIndex + 1} / {postsData.length}
                    </div>
                </div>
                <motion.div className="progress-bar prompt-bar" style={{ scaleX }} />
            </header>

            <section className="hero-section prompt-hero">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    THE PROMPT ARCHITECT
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    Master the high-value skill of engineering intent into machine intelligence.
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
                    Master the Code
                </motion.button>
            </section>

            <main className="series-container" ref={seriesRef}>
                <div className="series-intro">
                    <h2>Advanced Prompt Engineering</h2>
                    <p className="subtitle">10 Lessons to Bridge the Gap Between Human Thought and Artificial Intelligence</p>
                    <p className="description">
                        This is not about asking questions. It is about architecting intelligence.
                        Follow this series to transform how you collaborate with the most powerful tools ever created.
                    </p>
                </div>

                <div className="posts-list">
                    {postsData.map((post, index) => {
                        const isLocked = index >= freeThreshold && !isPremium && !isFreeUnlocked;
                        if (isLocked && index > freeThreshold) return null;

                        return (
                            <motion.div
                                key={post.id}
                                className={`post-block ${isLocked ? 'content-locked' : ''}`}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.6 }}
                            >
                                <div className="post-header">
                                    <span className="post-number">LESSON {post.id} / {postsData.length}</span>
                                    <h3>{post.title}</h3>
                                </div>

                                {isLocked ? (
                                    <SeriesPaywall 
                                        seriesId="prompt-architect"
                                        seriesTitle="The Prompt Architect"
                                        onUnlock={() => setIsFreeUnlocked(true)}
                                        isProcessing={isProcessing}
                                        paymentError={paymentError}
                                    />
                                ) : (
                                    <>
                                        <div className="post-image-container">
                                            <img
                                                src={post.image}
                                                alt={`The Prompt Architect: ${post.title} - AI Engineering Lesson`}
                                                className="post-image"
                                                loading="lazy"
                                            />
                                        </div>

                                        <div className="post-content">
                                            <p className="insight">{post.insight}</p>
                                            <div className="takeaway-box prompt-action">
                                                <p className="takeaway">{post.takeaway}</p>
                                                <div className="action-footer" style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px' }}>
                                                    {!isRead(post.title) ? (
                                                        <button 
                                                            className="mark-done-btn"
                                                            onClick={() => markAsRead(post.title)}
                                                            style={{ background: '#7ecdc4', color: '#102220', border: 'none', padding: '8px 16px', borderRadius: '4px', fontWeight: '800', cursor: 'pointer', fontSize: '0.75rem' }}
                                                        >
                                                            MARK COMPLETE
                                                        </button>
                                                    ) : (
                                                        <span style={{ color: '#7ecdc4', fontSize: '0.8rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                            <Check size={16} /> SUCCESS
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="post-navigation">
                                            <button
                                                className="nav-btn prev"
                                                disabled={index === 0}
                                                onClick={() => scrollToPost(index - 1)}
                                            >
                                                <ArrowLeft size={16} style={{ marginRight: '8px' }} /> Previous Lesson
                                            </button>
                                            <button
                                                className="nav-btn next"
                                                disabled={index === postsData.length - 1}
                                                onClick={() => scrollToPost(index + 1)}
                                            >
                                                Next Lesson <ArrowRight size={16} style={{ marginLeft: '8px' }} />
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
                    <p style={{ opacity: 0.7, marginBottom: '12px' }}>Sharpened your engineering? Now sharpen your attention.</p>
                    <h2 style={{ fontSize: '2rem', marginBottom: '24px' }}>Deep Attention Training</h2>
                    <Link to="/hyperfocus-series" className="explore-btn" style={{ background: '#7ecdc4', color: '#102220', border: 'none', fontWeight: '800' }}>
                        Architect Your Hyperfocus <ArrowRight size={16} style={{ marginLeft: '8px' }} />
                    </Link>
                </div>
                <div style={{ marginTop: '40px' }}>
                    <p>Training complete for now. Keep iterating.</p>
                    <Link to="/series" className="explore-btn" style={{ marginTop: '16px' }}>View More Series</Link>
                </div>
            </section>

            <footer className="series-footer">
                <p>© 2026 SoulThread. Engineer Your Reality.</p>
            </footer>
        </div>
    );
};

export default PromptEngineeringSeries;
