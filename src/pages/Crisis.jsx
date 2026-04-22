import React from 'react';
import { motion } from 'framer-motion';
import DesktopLayoutWrapper from '../components/layout/DesktopLayoutWrapper';
import SEO from '../components/common/SEO';
import { Phone, ArrowRight, ShieldCheck, Activity } from 'lucide-react';
import './Crisis.css';

const Crisis = () => {
    const helplines = [
        { name: "Vandrevala Foundation", contact: "9999 666 555", description: "24/7 Helpline for depression and mental distress.", type: "India" },
        { name: "AASRA", contact: "9820466726", description: "24/7 Suicide Prevention & counseling.", type: "India" },
        { name: "iCall (TISS)", contact: "9152987821", description: "Psychosocial helpline (Mon-Sat, 10am-8pm).", type: "India" },
        { name: "Fortis Stress Helpline", contact: "8376804102", description: "Emotional support available 24/7.", type: "India" },
        { name: "National Suicide Prevention LifeLine", contact: "988", description: "Immediate mental health support.", type: "International" }
    ];

    return (
        <DesktopLayoutWrapper>
            <SEO 
                title="Crisis Support & Helplines | SoulThread"
                description="If you are in distress, please reach out. We've compiled a list of verified, confidential helplines to support you in difficult moments."
            />
            <div className="crisis-page">
                <div className="crisis-container">
                    {/* Futuristic Badge */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="secure-badge"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            color: '#3d8b7f',
                            fontSize: '11px',
                            fontWeight: '900',
                            textTransform: 'uppercase',
                            letterSpacing: '2px',
                            marginBottom: '20px'
                        }}
                    >
                        <Activity size={12} className="pulse-icon" />
                        Secure Connection Active
                    </motion.div>

                    <motion.header 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="crisis-header"
                    >
                        <h1>You're Not Alone</h1>
                        <p>We are here with you. If you are feeling overwhelmed or in immediate danger, please reach out to one of the verified resources below.</p>
                    </motion.header>

                    {/* NEW: Psychologist Section on Top */}
                    <div className="crisis-prof-section">
                        <div className="crisis-section-label">
                            <span className="label-line"></span>
                            Verified Professional Support
                            <span className="label-line"></span>
                        </div>
                        <div className="crisis-prof-grid">
                            {[
                                {
                                    name: "Rupesh Ojha",
                                    role: "Corporate Training & Psychologist",
                                    desc: "Specialized in emotional regulation and resilience. Available for strategic mental wellness guidance.",
                                    cta: "Book Rupesh",
                                    link: "/counselors"
                                },
                                {
                                    name: "Dr. Dishari Biswas",
                                    role: "Research Scholar & Counselor",
                                    desc: "Gold Medalist (BHU) specializing in stress management and long-term coping styles.",
                                    cta: "Book Dishari",
                                    link: "/counselors"
                                }
                            ].map((p, i) => (
                                <motion.div 
                                    key={i}
                                    className="prof-card"
                                    initial={{ opacity: 0, x: i === 0 ? -20 : 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 + (i * 0.1) }}
                                >
                                    <div className="prof-badge">Verified Guide</div>
                                    <h3>{p.name}</h3>
                                    <div className="prof-role">{p.role}</div>
                                    <p>{p.desc}</p>
                                    <a href={p.link} className="prof-cta-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                        {p.cta} <ArrowRight size={16} />
                                    </a>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <div className="crisis-section-label" style={{ marginTop: '80px' }}>
                        <span className="label-line"></span>
                        National Support Helplines
                        <span className="label-line"></span>
                    </div>

                    <div className="helpline-grid">
                        {helplines.map((h, i) => (
                            <motion.div 
                                key={i}
                                className="helpline-card"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <div className="helpline-type">{h.type}</div>
                                <h3>{h.name}</h3>
                                <p>{h.description}</p>
                                <a href={`tel:${h.contact.replace(/\s+/g, '')}`} className="call-btn">
                                    <Phone size={18} style={{ marginRight: '8px' }} />
                                    {h.contact}
                                </a>
                            </motion.div>
                        ))}
                    </div>

                    <footer className="crisis-footer">
                        <div className="emergency-note">
                            <strong>Emergency?</strong> Call 112 or visit the nearest hospital emergency room immediately.
                        </div>
                        <div className="further-support">
                            <p>Looking for long-term professional support?</p>
                            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                                <a href="/counselors" className="secondary-btn">Professional Help</a>
                                <a href="/about" className="secondary-btn">Our Story</a>
                            </div>
                        </div>
                    </footer>
                </div>
                
                {/* Visual scanning line effect */}
                <div className="scanning-line"></div>
            </div>

            <style>{`
                .pulse-dot {
                    width: 8px;
                    height: 8px;
                    background: #3d8b7f;
                    border-radius: 50%;
                    box-shadow: 0 0 0 rgba(61, 139, 127, 0.4);
                    animation: pulse 2s infinite;
                }
                @keyframes pulse {
                    0% { box-shadow: 0 0 0 0 rgba(61, 139, 127, 0.7); }
                    70% { box-shadow: 0 0 0 10px rgba(61, 139, 127, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(61, 139, 127, 0); }
                }
                .scanning-line {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 15vh;
                    background: linear-gradient(to bottom, transparent, rgba(61, 139, 127, 0.05), transparent);
                    pointer-events: none;
                    animation: scan 8s linear infinite;
                    z-index: 2;
                }
                @keyframes scan {
                    0% { transform: translateY(-100%); }
                    100% { transform: translateY(1000%); }
                }
            `}</style>
        </DesktopLayoutWrapper>
    );
};

export default Crisis;
