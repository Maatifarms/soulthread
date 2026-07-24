import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { Heart, Phone } from 'lucide-react';
import './Footer.css';

const Footer = () => {
    const location = useLocation();
    
    // Hide footer on mobile/native app or specific high-focus pages if needed
    if (Capacitor.isNativePlatform()) return null;

    return (
        <footer className="footer-main">
            <div className="crisis-pin">
                <Phone size={14} color="#C0392B" />
                <span>In crisis? <Link to="/crisis" className="crisis-link">Get help now</Link> <span style={{opacity: 0.5}}>·</span> iCall: <a href="tel:9152987821" className="crisis-link">9152987821</a></span>
            </div>
            <div className="container footer-content">
                <div className="footer-branding">
                    <Link to="/" className="footer-logo">
                        <img src="/logo.jpg" alt="SoulThread Logo" />
                        <span>SoulThread</span>
                    </Link>
                    <p className="footer-tagline">
                        India's first platform combining patient care and mental health support. Built for families going through something hard.
                    </p>
                    <div className="footer-socials">
                        {/* Placeholder for future socials */}
                        <span>Stay Connected</span>
                    </div>
                </div>

                <div className="footer-links-grid">
                    <div className="link-group">
                        <h4>Community</h4>
                        <Link to="/explore">Explore Stories</Link>
                        <Link to="/groups">Peer Support Circles</Link>
                        <Link to="/series">Learning Series</Link>
                        <Link to="/crisis">Emergency Support</Link>
                    </div>

                    <div className="link-group">
                        <h4>Platform</h4>
                        <Link to="/about">Our Story</Link>
                        <Link to="/pricing">Sponsorship</Link>
                        <a href="https://play.google.com/store/apps/details?id=in.soulthread.app" target="_blank" rel="noopener noreferrer">Get Android App</a>
                        <Link to="/status">Site Status</Link>
                        <Link to="/join-as-expert">Apply as Expert</Link>
                    </div>

                    <div className="link-group">
                        <h4>Legal</h4>
                        <Link to="/privacy">Privacy Policy</Link>
                        <Link to="/terms">Terms of Service</Link>
                        <Link to="/safety">Safety Guidelines</Link>
                    </div>
                </div>
            </div>

            <div className="footer-bottom">
                <div className="container bottom-flex">
                    <p>© 2026 SoulThread Sanctuary. All rights reserved.</p>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        Built with <Heart size={14} fill="var(--color-primary)" color="var(--color-primary)" /> for your mental wellness
                    </span>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
