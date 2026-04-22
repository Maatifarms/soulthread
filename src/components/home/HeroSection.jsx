import React from 'react';
import { Link } from 'react-router-dom';
import { 
    ShieldCheck, 
    Zap, 
    Wind, 
    Fingerprint, 
    HeartHandshake,
    ArrowRight
} from 'lucide-react';

const HeroSection = ({ isNativeApp }) => {
  return (
    <section className="h-hero-root">
      {/* Dynamic Depth Components */}
      <div className="h-hero-orb h-hero-orb-1" />
      <div className="h-hero-orb h-hero-orb-2" />

      <div className="h-hero-container">
        <div className="h-hero-content">
          <div className="h-hero-badge">
            <Fingerprint size={14} className="h-badge-icon" />
            <span>Absolute Anonymity · Verified Professional Network</span>
          </div>

          <h1 className="h-hero-title">
            Architecture for the <span className="hide-mobile"><br /></span>
            <span className="h-grad-text">Human Soul.</span>
          </h1>

          <p className="h-hero-description">
            The world's most sophisticated <strong>anonymous sanctuary</strong>. Engineering a space where your narrative is protected, and expertise is universally accessible.
          </p>

          <div className="h-hero-actions">
            <Link to="/signup" className="h-btn-premium">
              Join the Sanctuary <ArrowRight size={18} style={{ marginLeft: '8px' }} />
            </Link>
            <Link to="/login" className="h-btn-minimal">
              Member Access
            </Link>
          </div>

          <div className="h-hero-tags">
            {[
              { icon: <Zap size={16} />, text: 'ADHD Mastery', path: '/hyperfocus-series' },
              { icon: <ShieldCheck size={16} />, text: 'Resilience', path: '/never-finished-series' },
              { icon: <Wind size={16} />, text: 'SoulSoothe', path: '/meditation-series' },
              { icon: <HeartHandshake size={16} />, text: 'Connections', path: '/relationship-series' }
            ].map((tag, i) => (
              <Link key={i} to={tag.path} className="h-hero-tag-link">
                {tag.icon}
                <span>{tag.text}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="h-hero-visual">
          <div className="h-visual-composition">
            <img 
              src="/hero_sanctuary_v2_1775990123456.png" 
              alt="SoulThread Sanctuary Composition" 
              className="h-main-visual"
            />
            <div className="h-visual-glow" />
            
            {/* Context Floating Cards with Refined Depth */}
            <div className="h-floating-card h-card-1">
              <ShieldCheck className="h-card-icon" size={24} strokeWidth={1.5} />
              <div>
                <div className="h-card-label">Anonymity Protocol</div>
                <div className="h-card-value">Military Grade Security</div>
              </div>
            </div>

            <div className="h-floating-card h-card-2">
              <HeartHandshake className="h-card-icon" size={24} strokeWidth={1.5} />
              <div>
                <div className="h-card-label">Verified Support</div>
                <div className="h-card-value">50+ Board Certified Experts</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

