import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, CreditCard, BarChart3, BookOpen, LogOut } from 'lucide-react';
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
                    <span className="icon"><User size={20} /></span> Profile & Settings
                </div>
                <div className="more-item" onClick={() => navigate('/ledger')}>
                    <span className="icon"><CreditCard size={20} /></span> Payments & Ledger
                </div>
                <div className="more-item">
                    <span className="icon"><BarChart3 size={20} /></span> Analytics
                </div>
                <div className="more-item" onClick={() => navigate('/library')}>
                    <span className="icon"><BookOpen size={20} /></span> Resources Library
                </div>
                <div className="more-item text-danger" onClick={logout}>
                    <span className="icon"><LogOut size={20} /></span> Sign Out
                </div>
            </div>
        </div>
    );
}
