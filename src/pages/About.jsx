import React from 'react';
import SEO from '../components/common/SEO';
import Breadcrumbs from '../components/common/Breadcrumbs';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import './About.css';

const About = () => {
    return (
        <div className="about-page-container">
            <SEO 
                title="About SoulThread | Our Mission and Purpose"
                description="Learn about SoulThread, a digital sanctuary for mental wellness and anonymous community support. Discover how we are redefining human connection through storytelling and psychology."
                image="https://soulthread.in/assets/seo/about_share.png"
                url="https://soulthread.in/about"
                keywords="about soulthread, mental health mission, anonymous community, soulthread india, psychological growth"
            />
            
            <Breadcrumbs />

            <section className="about-hero">
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="about-hero-content"
                >
                    <span className="brand-label">THE SOULTHREAD STORY</span>
                    <h1 className="about-title">A Sanctuary for <span className="text-gradient">Every Soul</span></h1>
                    <p className="about-subtitle">
                        In a world of noise and judgment, we built a thread of silence and truth.
                    </p>
                </motion.div>
            </section>

            <main className="about-main-content">
                <section className="mission-section">
                    <div className="content-grid">
                        <div className="text-block">
                            <h2>The Problem We Solve</h2>
                            <p>
                                Traditional social media is often a surface-level performance. For those navigating the depths of anxiety, loneliness, or personal evolution, the modern internet can feel like a lonely place. 
                            </p>
                            <p>
                                <strong>SoulThread</strong> was born to bridge this gap. We are not just another website; we are a specialized ecosystem designed for <strong>Mental Wellness</strong> and <strong>Authentic Storytelling</strong>.
                            </p>
                        </div>
                        <div className="stat-card-simple">
                            <div className="stat-value">100%</div>
                            <div className="stat-label">Anonymous by Default</div>
                        </div>
                    </div>
                </section>

                <section className="values-section">
                    <div className="values-grid">
                        <div className="value-card">
                            <div className="value-icon">🛡️</div>
                            <h3>Radical Privacy</h3>
                            <p>Your identity belongs to you. Share your truth without the fear of social repercussion.</p>
                        </div>
                        <div className="value-card">
                            <div className="value-icon">🧠</div>
                            <h3>Expert Guidance</h3>
                            <p>Access verified psychologists and curated learning series rooted in neuroscience and psychology.</p>
                        </div>
                        <div className="value-card">
                            <div className="value-icon">🤝</div>
                            <h3>Peer Support</h3>
                            <p>Connect with a circle that understands. Shared experience is the ultimate healer.</p>
                        </div>
                    </div>
                </section>

                <section className="clinical-section">
                    <div className="content-box">
                        <span className="section-label">THE METHOD</span>
                        <h2>Clinical Integrity</h2>
                        <p>
                            While SoulThread is a community of peers, we don't ignore the science. Our learning series—like the <strong>Hyperfocus Series</strong> and <strong>The Prompt Architect</strong>—are designed with psychological frameworks in mind.
                        </p>
                        <ul className="clinical-features">
                            <li><strong>Cognitive Reframing</strong>: Tools to help you change the way you see your challenges.</li>
                            <li><strong>Expert Directory</strong>: Direct access to verified, empathetic clinical psychologists.</li>
                            <li><strong>Crisis Support</strong>: Rapid-access resources for those in immediate emotional need.</li>
                        </ul>
                    </div>
                </section>

                <section className="pillars-section">
                    <div className="pillars-grid">
                        <div className="pillar">
                            <h4 className="pillar-num">01</h4>
                            <h5>Authenticity</h5>
                            <p>No filters. No masks. Just the raw, honest human experience.</p>
                        </div>
                        <div className="pillar">
                            <h4 className="pillar-num">02</h4>
                            <h5>Growth</h5>
                            <p>We believe in "Forward Motion." Every shared thread is a step toward healing.</p>
                        </div>
                        <div className="pillar">
                            <h4 className="pillar-num">03</h4>
                            <h5>Confidentiality</h5>
                            <p>Your sanctuary is protected by the highest standards of digital privacy.</p>
                        </div>
                    </div>
                </section>

                <section className="about-cta">
                    <h2>Claim your sanctuary.</h2>
                    <div className="cta-btns">
                        <Link to="/signup" className="btn-primary">Join the Sanctuary</Link>
                        <Link to="/series" className="btn-secondary">Explore the Library</Link>
                    </div>
                </section>
            </main>

            <footer className="about-simple-footer">
                <p>© 2026 SoulThread. All rights reserved.</p>
                <div className="footer-links">
                    <Link to="/crisis">Get Support</Link>
                    <Link to="/explore">Explore</Link>
                    <Link to="/pricing">Sponsorship</Link>
                </div>
            </footer>
        </div>
    );
};

export default About;
