import React from 'react';
import { Link } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { Phone, ShieldCheck, Heart } from 'lucide-react';
import './Footer.css';

const Footer = () => {
    // Native mobile app hides standard web footer to maintain clean native bottom navigation
    if (Capacitor.isNativePlatform()) return null;

    return (
        <footer className="footer-main">
            {/* National Crisis Banner */}
            <div className="crisis-pin">
                <Phone size={14} className="crisis-icon" />
                <span>
                    In immediate crisis? <Link to="/crisis" className="crisis-link">Get help now</Link>
                    &nbsp;·&nbsp; Tele-MANAS: <a href="tel:14416" className="crisis-link">14416</a> (24/7)
                    &nbsp;·&nbsp; iCall: <a href="tel:9152987821" className="crisis-link">9152987821</a>
                </span>
            </div>

            <div className="container footer-content">
                <div className="footer-top-grid">
                    {/* Brand Column */}
                    <div className="footer-col brand-col">
                        <Link to="/" className="footer-logo">
                            <img src="/logo.jpg" alt="SoulThread Logo" className="f-logo-img" />
                            <span className="f-logo-text">SoulThread</span>
                        </Link>
                        <p className="footer-tagline">
                            India's anonymous mental health sanctuary and clinical care platform. Share what you feel, connect with verified psychologists, and heal without judgment or names.
                        </p>
                        <div className="f-security-badge">
                            <ShieldCheck size={14} /> 100% On-Device Privacy Guard
                        </div>
                    </div>

                    {/* Column 1: Community */}
                    <div className="footer-col">
                        <h4 className="f-col-title">Community</h4>
                        <ul className="f-links">
                            <li><Link to="/explore">Explore Feed</Link></li>
                            <li><Link to="/groups">Support Circles</Link></li>

                            <li><Link to="/crisis">Crisis Resources</Link></li>
                        </ul>
                    </div>

                    {/* Column 2: Condition Hubs */}
                    <div className="footer-col">
                        <h4 className="f-col-title">Condition Hubs</h4>
                        <ul className="f-links">
                            <li><Link to="/explore?category=anxiety">Anxiety & Panic</Link></li>
                            <li><Link to="/explore?category=depression">Depression & Low Mood</Link></li>
                            <li><Link to="/explore?category=burnout">Work Stress & Burnout</Link></li>
                            <li><Link to="/explore?category=relationships">Relationships & Trust</Link></li>
                            <li><Link to="/explore?category=caretaker">Caretaker Support</Link></li>
                        </ul>
                    </div>

                    {/* Column 3: Clinical & Enterprise */}
                    <div className="footer-col">
                        <h4 className="f-col-title">Clinical & Enterprise</h4>
                        <ul className="f-links">
                            <li><Link to="/experts">Find a Psychologist</Link></li>
                            <li><Link to="/join-as-expert">Join as Clinical Expert</Link></li>
                            <li><Link to="/#enterprise">Enterprise EAP Solutions</Link></li>
                            <li><a href="mailto:support@soulthread.in">Clinical Advisory</a></li>
                        </ul>
                    </div>

                    {/* Column 4: Trust & Legal */}
                    <div className="footer-col">
                        <h4 className="f-col-title">Trust & Legal</h4>
                        <ul className="f-links">
                            <li><Link to="/about">Our Story</Link></li>
                            <li><Link to="/privacy">Privacy Policy</Link></li>
                            <li><Link to="/terms">Terms of Service</Link></li>
                            <li><a href="mailto:support@soulthread.in">Contact Support</a></li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Footer Bottom Bar */}
            <div className="footer-bottom">
                <div className="container bottom-flex">
                    <p>© {new Date().getFullYear()} SoulThread Sanctuary. All rights reserved.</p>
                    <span className="bottom-heart">
                        Built with <Heart size={13} fill="#0d9488" color="#0d9488" /> for mental wellness in India
                    </span>
                </div>
                <div className="container disclaimer-row">
                    SoulThread provides peer support and professional therapy connections. If you are experiencing a medical emergency or severe crisis, please contact Tele-MANAS (14416) or visit a hospital immediately.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
