import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import DesktopLayoutWrapper from '../components/layout/DesktopLayoutWrapper';
import SEO from '../components/common/SEO';
import FeedList from '../components/feed/FeedList';
import CreatePostModal from '../components/community/CreatePostModal';
import { Capacitor } from '@capacitor/core';
import { Sparkles, Wind, Heart, PenLine } from 'lucide-react';

export default function Community() {
    const { currentUser } = useAuth();
    const isNativeApp = Capacitor.isNativePlatform();
    
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);

    const categories = [
        { id: 'all', label: 'All', icon: <Sparkles size={16} /> },
        { id: 'general', label: 'General', icon: <PenLine size={16} /> },
        { id: 'anxiety', label: 'Anxiety', icon: <Wind size={16} /> },
        { id: 'relationships', label: 'Relationships', icon: <Heart size={16} /> }
    ];

    if (!currentUser) return null; // Community is strictly private

    return (
        <DesktopLayoutWrapper>
            <SEO title="Community Sanctuary | SoulThread" />
            <div className={`min-h-screen bg-[#fafafa] pb-24 pt-6 ${isNativeApp ? 'is-native' : ''}`}>
                <div className="max-w-2xl mx-auto px-4 space-y-6">
                    
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Sanctuary</h1>
                        <button 
                            onClick={() => setShowCreateModal(true)}
                            className="px-5 py-2.5 bg-black text-white text-sm font-bold rounded-full hover:bg-gray-800 transition-colors shadow-sm"
                        >
                            Share anonymously
                        </button>
                    </div>

                    <p className="text-gray-500 text-sm">
                        A safe, anonymous space for peer support. No followers, no popularity metrics.
                    </p>

                    {/* Simple Categories Filter */}
                    <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-2">
                        {categories.map(cat => {
                            const isActive = selectedCategory === cat.id || (cat.id === 'all' && !selectedCategory);
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id === 'all' ? null : cat.id)}
                                    className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                                        isActive 
                                        ? 'bg-black text-white' 
                                        : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                                    }`}
                                >
                                    <span className={isActive ? 'text-white' : 'text-gray-400'}>{cat.icon}</span>
                                    <span>{cat.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Feed List Container */}
                    <div className="pt-4">
                        <FeedList filterCategory={selectedCategory} moodFilter={null} />
                    </div>

                </div>

                {showCreateModal && (
                    <CreatePostModal 
                        onClose={() => setShowCreateModal(false)} 
                        onPostSuccess={() => setShowCreateModal(false)} 
                    />
                )}
            </div>
        </DesktopLayoutWrapper>
    );
}
