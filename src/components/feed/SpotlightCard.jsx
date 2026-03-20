import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import './SpotlightCard.css';

const SpotlightCard = ({ post }) => {
    if (!post) return null;

    return (
        <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="spotlight-card-root"
        >
            <div className="spotlight-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                </svg>
                Community Spotlight
            </div>
            
            <div className="spotlight-content">
                <h3 className="spotlight-title">Featured Story</h3>
                <p className="spotlight-text">
                    {post.content?.substring(0, 180)}...
                </p>
                <div className="spotlight-footer">
                    <span className="spotlight-author">Shared by {post.authorIsAnonymous ? 'Soul Voyager' : post.authorName}</span>
                    <Link to={`/post/${post.id}`} className="spotlight-link">
                        Read Full Story →
                    </Link>
                </div>
            </div>
            
            <div className="spotlight-glow" />
        </motion.div>
    );
};

export default SpotlightCard;
