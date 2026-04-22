import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Users, BrainCircuit, ArrowUpRight } from 'lucide-react';

const PILLARS = [
  {
    icon: <ShieldAlert size={28} strokeWidth={1.5} />,
    title: "Absolute Anonymity",
    desc: "Built on military-grade encryption protocols. Your identity is architecturally protected from the ground up.",
    image: "/hero_sanctuary_premium_1775989067379.png"
  },
  {
    icon: <BrainCircuit size={28} strokeWidth={1.5} />,
    title: "Clinical Wisdom",
    desc: "A curated network of board-certified clinical experts. Precision-guided healing journeys for the complex human mind.",
    image: "/clinical_wisdom_premium_1775989293079.png"
  },
  {
    icon: <Users size={28} strokeWidth={1.5} />,
    title: "Deep Connection",
    desc: "Resonance over small talk. Find your circle in a sanctuary designed for authentic, profound human interaction.",
    image: "/deep_connection_premium_1775989313327.png"
  }
];

const SanctuaryPillars = () => {
    return (
        <section className="sanctuary-pillars-root">
            <div className="discovery-section-label">Institutional Core</div>
            <h2 className="pillars-headline">The Architecture <span className="h-grad-text">of Protection.</span></h2>
            
            <div className="pillars-grid">
                {PILLARS.map((pillar, i) => (
                    <motion.div 
                        key={pillar.title}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="pillar-card-premium"
                    >
                        <div className="pillar-image-container">
                            <img src={pillar.image} alt={pillar.title} className="pillar-banner-image" />
                            <div className="pillar-image-overlay" />
                        </div>
                        
                        <div className="pillar-content-premium">
                            <div className="pillar-icon-shell-elite">
                                {pillar.icon}
                            </div>
                            <h3 className="pillar-title-premium">{pillar.title}</h3>
                            <p className="pillar-desc-premium">{pillar.desc}</p>
                            
                            <div className="pillar-footer-premium">
                                <span className="pillar-learn-more">Explore Protocol</span>
                                <ArrowUpRight size={14} className="pillar-arrow" />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <style>{`
                .sanctuary-pillars-root {
                    padding: 120px 24px;
                    max-width: 1300px;
                    margin: 0 auto;
                    text-align: center;
                }
                .discovery-section-label {
                    text-transform: uppercase;
                    letter-spacing: 0.2em;
                    font-size: 11px;
                    font-weight: 800;
                    color: var(--color-secondary);
                    margin-bottom: 24px;
                    display: block;
                }
                .pillars-headline {
                    font-size: clamp(36px, 6vw, 56px);
                    font-weight: 950;
                    margin-bottom: 80px;
                    letter-spacing: -0.05em;
                    color: var(--color-text-primary);
                    line-height: 1.1;
                }
                .h-grad-text {
                    background: var(--grad-premium);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .pillars-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
                    gap: 32px;
                }
                .pillar-card-premium {
                    position: relative;
                    background: var(--color-surface);
                    border: 1px solid var(--color-border);
                    border-radius: var(--radius-xl);
                    overflow: hidden;
                    text-align: left;
                    transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
                    box-shadow: var(--shadow-soft);
                    display: flex;
                    flex-direction: column;
                }
                .pillar-card-premium:hover {
                    box-shadow: 0 40px 80px -20px rgba(0,0,0,0.12);
                    border-color: var(--color-secondary);
                    transform: translateY(-12px);
                }
                .pillar-image-container {
                    position: relative;
                    height: 220px;
                    overflow: hidden;
                }
                .pillar-banner-image {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 1.2s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .pillar-card-premium:hover .pillar-banner-image {
                    transform: scale(1.08);
                }
                .pillar-image-overlay {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(to bottom, transparent 0%, var(--color-surface) 100%);
                }
                .pillar-content-premium {
                    padding: 40px;
                    padding-top: 0;
                    margin-top: -30px;
                    position: relative;
                    z-index: 2;
                    flex-grow: 1;
                    display: flex;
                    flex-direction: column;
                }
                .pillar-icon-shell-elite {
                    width: 60px;
                    height: 60px;
                    background: var(--color-surface);
                    border: 1px solid var(--color-border);
                    color: var(--color-primary);
                    border-radius: 18px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 28px;
                    box-shadow: var(--shadow-md);
                    transition: all 0.4s ease;
                }
                .pillar-card-premium:hover .pillar-icon-shell-elite {
                    background: var(--color-primary);
                    color: white;
                    border-color: var(--color-primary);
                    transform: rotate(-5deg);
                }
                .pillar-title-premium {
                    font-size: 26px;
                    font-weight: 900;
                    margin-bottom: 16px;
                    color: var(--color-text-primary);
                    letter-spacing: -0.03em;
                }
                .pillar-desc-premium {
                    font-size: 16px;
                    color: var(--color-text-secondary);
                    line-height: 1.7;
                    margin-bottom: 32px;
                    opacity: 0.9;
                }
                .pillar-footer-premium {
                    margin-top: auto;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: var(--color-secondary);
                    font-weight: 800;
                    font-size: 13px;
                    letter-spacing: 0.05em;
                    text-transform: uppercase;
                    opacity: 0.8;
                    transition: all 0.3s ease;
                }
                .pillar-card-premium:hover .pillar-footer-premium {
                    opacity: 1;
                    gap: 12px;
                }
                .dark-mode .pillar-image-overlay {
                    background: linear-gradient(to bottom, transparent 0%, var(--color-surface) 100%);
                }
                .dark-mode .pillar-card-premium {
                    background: #0f172a;
                }
            `}</style>
        </section>
    );
};

export default SanctuaryPillars;

