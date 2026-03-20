import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/common/SEO';
import './NotFound.css';

const NotFound = () => {
    return (
        <div className="not-found-container">
            <SEO 
                title="Page Not Found | SoulThread"
                description="The page you are looking for might have been removed, had its name changed, or is temporarily unavailable. Let's get you back on track."
                schema={{
                    "@context": "https://schema.org",
                    "@type": "WebPage",
                    "name": "NotFound",
                    "breadcrumb": "Home > 404"
                }}
            />
            
            <div className="not-found-content">
                <div className="error-code">404</div>
                <h1 className="not-found-title">Lost in the Silence?</h1>
                <p className="not-found-text">
                    Even in the quietest corners of the soul, we sometimes lose our way. 
                    The page you're looking for doesn't exist, but your journey continues.
                </p>
                
                <div className="not-found-actions">
                    <Link to="/" className="btn-primary">Return home</Link>
                    <Link to="/series" className="btn-secondary">Explore series</Link>
                </div>
                
                <div className="not-found-links">
                    <p>Perhaps you were looking for:</p>
                    <div className="link-grid">
                        <Link to="/explore">Community feed</Link>
                        <Link to="/crisis">Expert support</Link>
                        <Link to="/pricing">Memberships</Link>
                        <Link to="/groups">Support groups</Link>
                    </div>
                </div>
            </div>
            
            {/* Ambient Background Elements */}
            <div className="ambient-blur blur-1" />
            <div className="ambient-blur blur-2" />
        </div>
    );
};

export default NotFound;
