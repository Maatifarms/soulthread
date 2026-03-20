import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import './Footer.css';

const Footer = () => {
    const location = useLocation();
    
    // Hide footer on mobile/native app or specific high-focus pages if needed
    if (Capacitor.isNativePlatform()) return null;

    return (
        <footer className="footer-main">
            <div className="container footer-content">
                <div className="footer-branding">
                    <Link to="/" className="footer-logo">
                        <img src="/logo.jpg" alt="SoulThread Logo" />
                        <span>SoulThread</span>
                    </Link>
                    <p className="footer-tagline">
                        A digital sanctuary for your soul. REDEFINING human connection through anonymous peer support and mental wellness.
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
                        <Link to="/download/soulthread.apk">Android App</Link>
                        <Link to="/status">Site Status</Link>
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
                    <span>Built with ❤️ for your mental wellness</span>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
