import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
    Heart, 
    Shield, 
    Brain, 
    Leaf, 
    MessageCircle, 
    Stethoscope, 
    BookOpen, 
    AlertCircle, 
    Users, 
    Smartphone, 
    Mail,
    ArrowRight,
    MousePointer2
} from 'lucide-react';
import SEO from '../components/common/SEO';
import './About.css';

/* ── Animated counter hook ── */
const useCounter = (target, duration = 2000, start = false) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
        if (!start) return;
        let startTime = null;
        const step = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [start, target, duration]);
    return count;
};

/* ── Intersection Observer hook ── */
const useInView = (threshold = 0.2) => {
    const ref = useRef(null);
    const [inView, setInView] = useState(false);
    useEffect(() => {
        const obs = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setInView(true);
                obs.disconnect();
            }
        }, { threshold });
        if (ref.current) obs.observe(ref.current);
        return () => obs.disconnect();
    }, [threshold]);
    return [ref, inView];
};

/* ── Stats counter block ── */
const StatCounter = ({ value, suffix = '', label, inView }) => {
    const num = useCounter(value, 2200, inView);
    return (
        <div className="ab-stat-block">
            <div className="ab-stat-number">{num.toLocaleString()}{suffix}</div>
            <div className="ab-stat-label">{label}</div>
        </div>
    );
};

const About = () => {
    const [statsRef, statsInView] = useInView(0.3);
    const [manifRef, manifInView] = useInView(0.15);

    return (
        <div className="ab-root">
            <SEO
                title="About SoulThread | Our Mission — A Sanctuary for Every Soul"
                description="SoulThread is India's leading anonymous mental wellness community. Learn how we built a judgment-free sanctuary for venting, healing, and real human connection."
                image="https://soulthread.in/logo.jpg"
                url="https://soulthread.in/about"
                keywords="about soulthread, mental health mission, anonymous community, soulthread india, safe space, psychological growth"
            />

            {/* ── HERO ── */}
            <section className="ab-hero">
                <div className="ab-orb ab-orb-1" />
                <div className="ab-orb ab-orb-2" />
                
                <div className="ab-hero-inner">
                    <div className="ab-hero-badge">
                        <span className="ab-badge-dot" />
                        The SoulThread Mission
                    </div>
                    <h1 className="ab-hero-title">
                        Engineering the internet's<br />
                        <span className="ab-grad-text">safest human sanctuary.</span>
                    </h1>
                    <p className="ab-hero-sub">
                        Beyond social media. Beyond traditional therapy. A architectural space<br className="ab-br-hide" />
                        designed for honesty, anonymity, and professional support.
                    </p>
                    <div className="ab-hero-actions">
                        <Link to="/signup" className="ab-btn-primary">
                            Enter the Sanctuary <ArrowRight size={18} style={{ marginLeft: '8px' }} />
                        </Link>
                        <Link to="/crisis" className="ab-btn-ghost">Connect with Experts</Link>
                    </div>
                </div>

                <div className="ab-hero-scroll-hint">
                    <div className="ab-scroll-line" />
                    <span>Explore our narrative</span>
                </div>
            </section>

            {/* ── HIGH-FIDELITY ORIGIN ── */}
            <section className="ab-origin">
                <div className="ab-origin-inner">
                    <div className="ab-origin-text">
                        <span className="ab-section-tag">Direct Narrative</span>
                        <h2 className="ab-section-title">
                            Born from the architecture of silence.
                        </h2>
                        <p>
                            We recognized a fundamental failure in digital social structures: the reward for performance over presence. Anxiety remains hidden under curated filters.
                        </p>
                        <p>
                            SoulThread was engineered as a response—a structural sanctuary where anonymity is the default and empathy is the only objective.
                        </p>
                        <p>
                            <strong>This is a space for the unspoken.</strong> The letters you couldn't send, the feelings you couldn't name, and the growth you didn't think was possible.
                        </p>
                    </div>
                    <div className="ab-origin-visual-card">
                        <div className="ab-image-wrapper">
                            <img 
                                src="/assets/about/sanctuary_visual.png" 
                                alt="SoulThread Digital Sanctuary Concept" 
                                className="ab-premium-image"
                            />
                            <div className="ab-image-overlay" />
                        </div>
                        <div className="ab-quote-badge">
                            <Shield className="ab-quote-icon" size={24} />
                            <p>"A space where your truth doesn't need a mask."</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── STATS ── */}
            <section className="ab-stats" ref={statsRef}>
                <div className="ab-stats-inner">
                    <div className="ab-stats-label">Community Scale</div>
                    <div className="ab-stats-grid">
                        <StatCounter value={12000} suffix="+" label="Souls in the community" inView={statsInView} />
                        <StatCounter value={50} suffix="+" label="Verified Professionals" inView={statsInView} />
                        <StatCounter value={100} suffix="%" label="Anonymous Infrastructure" inView={statsInView} />
                        <StatCounter value={6} suffix="" label="Expert Learning Series" inView={statsInView} />
                    </div>
                </div>
            </section>

            {/* ── MANIFESTO ── */}
            <section className="ab-manifesto" ref={manifRef}>
                <div className="ab-manifesto-inner">
                    <span className="ab-section-tag">Axioms</span>
                    <h2 className="ab-section-title">Fundamental honesty as a standard.</h2>

                    <div className="ab-manifesto-lines">
                        {[
                            { a: 'Validation as a currency.', b: 'Honesty as a foundation.' },
                            { a: 'Surface-level connections.', b: 'Deep, focused empathy.' },
                            { a: 'Prohibitive expert access.', b: 'Universal reach to professionals.' },
                            { a: 'Isolating digital noise.', b: 'A community of 12,000 listeners.' },
                        ].map((line, i) => (
                            <div
                                key={i}
                                className="ab-manifesto-line"
                                style={{ animationDelay: `${i * 120}ms`, opacity: manifInView ? 1 : 0 }}
                            >
                                <div className="ab-manifesto-cross">✕</div>
                                <div className="ab-manifesto-words">
                                    <span className="ab-m-old">{line.a}</span>
                                    <span className="ab-m-arrow">→</span>
                                    <span className="ab-m-new">{line.b}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── PILLARS WITH ICONS ── */}
            <section className="ab-pillars">
                <div className="ab-pillars-inner">
                    <span className="ab-section-tag">Core Principles</span>
                    <h2 className="ab-section-title">Architectural Commitments.</h2>

                    <div className="ab-pillars-grid">
                        <div className="ab-pillar-card ab-pillar-privacy">
                            <div className="ab-pillar-icon-wrapper">
                                <Shield className="ab-p-icon" size={32} />
                            </div>
                            <h3>Rigorous Privacy</h3>
                            <p>Anonymity isn't a feature; it's the core infrastructure. We protect your identity through structural defaults, allowing for total freedom of expression.</p>
                            <div className="ab-pillar-detail">
                                <span>Encrypted Posts</span>
                                <span>Zero Name Leakage</span>
                                <span>Verified Privacy</span>
                            </div>
                        </div>
                        <div className="ab-pillar-card ab-pillar-expert">
                            <div className="ab-pillar-icon-wrapper">
                                <Brain className="ab-p-icon" size={32} />
                            </div>
                            <h3>Expert-Led Evolution</h3>
                            <p>We bridge the gap between peer support and clinical psychology through verified professional networks and neuroscience-grounded learning series.</p>
                            <div className="ab-pillar-detail">
                                <span>50+ Psychologists</span>
                                <span>6 Growth Series</span>
                                <span>Evidence-Based</span>
                            </div>
                        </div>
                        <div className="ab-pillar-card ab-pillar-community">
                            <div className="ab-pillar-icon-wrapper">
                                <Users className="ab-p-icon" size={32} />
                            </div>
                            <h3>Active Empathy</h3>
                            <p>A community intentionally built away from polarizing algorithms, focusing instead on shared human experiences and mutual emotional support.</p>
                            <div className="ab-pillar-detail">
                                <span>Support Circles</span>
                                <span>Zero Toxicity</span>
                                <span>Real Support</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── SERVICES ── */}
            <section className="ab-offer">
                <div className="ab-offer-inner">
                    <div className="ab-offer-text">
                        <span className="ab-section-tag">The Architecture</span>
                        <h2 className="ab-section-title">A complete support ecosystem.</h2>
                        <p className="ab-offer-sub">
                            From the first anonymous post to direct professional consultation.
                        </p>
                    </div>

                    <div className="ab-offer-grid">
                        {[
                            { icon: <MessageCircle />, title: 'Community Feed', desc: 'Secure, anonymous posting for real-time peer support and emotional venting.' },
                            { icon: <Stethoscope />, title: 'Professional Network', desc: 'Direct connection to over 50 verified psychologists for specialized care.' },
                            { icon: <BookOpen />, title: 'Curated Series', desc: 'Deep-dive educational programs on ADHD, Mastery, and Emotional Resilience.' },
                            { icon: <AlertCircle />, title: 'Crisis Response', desc: 'Immediate access to 24/7 helplines and critical emotional support resources.' },
                            { icon: <Leaf />, title: 'Growth Circles', desc: 'Private, moderated groups focusing on shared healing and relationship growth.' },
                            { icon: <Smartphone />, title: 'Native Experience', desc: 'A dedicated Android platform ensuring your sanctuary is always accessible.' },
                        ].map((item, i) => (
                            <div key={i} className="ab-offer-card">
                                <div className="ab-offer-icon-box">{item.icon}</div>
                                <h4>{item.title}</h4>
                                <p>{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── LETTER ── */}
            <section className="ab-letter">
                <div className="ab-letter-inner">
                    <div className="ab-letter-icon-wrapper">
                        <Mail size={40} className="ab-letter-icon" />
                    </div>
                    <span className="ab-section-tag">Executive Summary</span>
                    <h2 className="ab-letter-title">The heart of the sanctuary</h2>
                    <div className="ab-letter-body">
                        <p>
                            SoulThread emerged from a personal vacuum: the absence of spaces compatible with complex, "messy" human emotions. We built what was missing.
                        </p>
                        <p>
                            This is not merely a product. It is a digital realization of the sanctuary we all deserve when the world becomes too heavy.
                        </p>
                        <p>
                            Every technical decision, from anonymity protocols to the shimmer of a badge, is filtered through one question: <strong>"Does this foster safety?"</strong>
                        </p>
                        <p>
                            We are honored to have you here.
                        </p>
                        <div className="ab-letter-sig">
                            <div className="ab-letter-sig-name">The SoulThread Engineering & Wellness Team</div>
                            <div className="ab-letter-sig-year">Est. 2024 · India</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── FINAL CTA ── */}
            <section className="ab-cta">
                <div className="ab-orb ab-orb-cta-1" />
                <div className="ab-orb ab-orb-cta-2" />
                <div className="ab-cta-inner">
                    <h2 className="ab-cta-title">
                        Ready to join the<br />
                        <span className="ab-grad-text">human sanctuary?</span>
                    </h2>
                    <p className="ab-cta-sub">
                        Become one of the 12,000+ souls who prioritize honesty over optics.
                    </p>
                    <div className="ab-cta-btns">
                        <Link to="/signup" className="ab-btn-primary ab-btn-lg">
                            Begin Your Journey <ArrowRight size={20} style={{ marginLeft: '10px' }} />
                        </Link>
                        <Link to="/" className="ab-btn-ghost">Explore the Feed</Link>
                    </div>
                    <div className="ab-cta-copy">© 2026 SoulThread Sanctuary · All Rights Reserved</div>
                </div>
            </section>
        </div>
    );
};

export default React.memo(About);

