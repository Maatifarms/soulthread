import React from 'react';
import { Link } from 'react-router-dom';

const HeroSection = ({ isNativeApp }) => {
  return (
    <div className="home-hero animate-fade-in">
      {/* Immersive Background Blur Elements */}
      <div style={{
        position: 'absolute', top: '-100px', right: '-80px', width: '400px', height: '400px',
        background: 'radial-gradient(circle, rgba(61, 139, 127, 0.15) 0%, transparent 70%)',
        filter: 'blur(40px)', pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', bottom: '-120px', left: '-100px', width: '350px', height: '350px',
        background: 'radial-gradient(circle, rgba(139, 122, 208, 0.12) 0%, transparent 60%)',
        filter: 'blur(40px)', pointerEvents: 'none'
      }} />

      <div className="hero-content-wrapper animate-fade-up">
        <div className="hero-pill animate-pulse">
          <span className="hero-dot" />
          Private · Anonymous · Verified
        </div>

        <h1 className="hero-title">
          A Sanctuary<br />
          <span className="hero-text-gradient">for Souls like You</span>
        </h1>

        <p className="hero-subtitle">
          The leading <strong>Mental Health Support Community</strong> in India. <br />
          Experience <strong>Soul Thread</strong>: Anonymous, judgment-free, and deeply human.
        </p>

        <div className="hero-actions">
          <Link to="/signup" className="hero-btn-primary animate-float">
            Join 12,000+ Souls
          </Link>
          <Link to="/login" className="hero-btn-secondary">
            Sign In
          </Link>
        </div>

        <div className="hero-series-links">
          <Link to="/hyperfocus-series" className="hero-series-link">Focus</Link>
          <Link to="/never-finished-series" className="hero-series-link">Toughness</Link>
          <Link to="/meditation-series" className="hero-series-link">SoulSoothe</Link>
          <Link to="/biological-soul-series" className="hero-series-link">Biology</Link>
          <Link to="/relationship-series" className="hero-series-link">Relationships</Link>
          <a href="https://www.instagram.com/soulthread_community/" className="hero-series-link" style={{ color: '#e1306c' }} target="_blank" rel="noopener noreferrer">Journal</a>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
