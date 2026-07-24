import React from 'react';
import { Link } from 'react-router-dom';
import {
    ShieldCheck,
    Zap,
    Wind,
    HeartHandshake,
    ArrowRight,
    PhoneCall
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
            <span className="h-live-dot" />
            <span>Safe space · Judgment-free · Always anonymous</span>
          </div>

          <h1 className="h-hero-title">
            You don't have to carry<span className="hide-mobile"><br /></span>
            {' '}<em className="h-grad-text">this alone.</em>
          </h1>

          <p className="h-hero-description">
            A safe, anonymous community where your story matters —
            no real name, no judgement, no pressure.
            Just people who truly understand.
          </p>

          <div className="h-hero-actions">
            <Link to="/signup" className="h-btn-premium">
              Start Sharing Anonymously <ArrowRight size={18} style={{ marginLeft: '8px' }} />
            </Link>
            <Link to="/login" className="h-btn-minimal">
              Sign In
            </Link>
          </div>

          <Link to="/crisis" className="h-crisis-btn">
            <PhoneCall size={16} />
            Need immediate help? Crisis Support →
          </Link>

          <div className="h-hero-trust-row">
            <span className="h-trust-item"><ShieldCheck size={14} /> No name needed</span>
            <span className="h-trust-item"><HeartHandshake size={14} /> Professional support</span>
            <span className="h-trust-item"><Wind size={14} /> Always free</span>
          </div>

          <div className="h-hero-tags">
            {[
              { icon: <Zap size={16} />, text: 'ADHD & Focus', path: '/hyperfocus-series' },
              { icon: <ShieldCheck size={16} />, text: 'Resilience', path: '/never-finished-series' },
              { icon: <Wind size={16} />, text: 'Meditation', path: '/meditation-series' },
              { icon: <HeartHandshake size={16} />, text: 'Relationships', path: '/relationship-series' }
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
              src="/assets/home/hero_visual.png"
              alt="SoulThread Sanctuary Composition"
              className="h-main-visual"
            />
            <div className="h-visual-glow" />

            <div className="h-floating-card h-card-1">
              <ShieldCheck className="h-card-icon" size={24} strokeWidth={1.5} />
              <div>
                <div className="h-card-label">Your Identity</div>
                <div className="h-card-value">Always Protected, Always Yours</div>
              </div>
            </div>

            <div className="h-floating-card h-card-2">
              <HeartHandshake className="h-card-icon" size={24} strokeWidth={1.5} />
              <div>
                <div className="h-card-label">Real Support</div>
                <div className="h-card-value">Community + 50 Certified Experts</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
