import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './GuideApp.css';

export default function GuideMore() {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="guide-page-container">
            <header className="guide-page-header">
                <h2>More Options</h2>
            </header>
            <div className="guide-page-content guide-more-list">
                <div className="more-item" onClick={() => navigate(`/profile/${currentUser?.uid}`)}>
                    <span className="icon">👤</span> Profile & Settings
                </div>
                <div className="more-item" onClick={() => navigate('/ledger')}>
                    <span className="icon">💳</span> Payments & Ledger
                </div>
                <div className="more-item">
                    <span className="icon">📊</span> Analytics
                </div>
                <div className="more-item">
                    <span className="icon">📚</span> Resources Library
                </div>
                <div className="more-item text-danger" onClick={logout}>
                    <span className="icon">🚪</span> Sign Out
                </div>
            </div>
        </div>
    );
}
