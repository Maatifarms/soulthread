import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Users } from 'lucide-react';

/**
 * Shared tab switcher for the Community section (Feed <-> Circles). Deliberately not
 * a top-level Navbar entry — Circles lives inside Community, one level down.
 */
export default function CommunityTabs({ active }) {
    const navigate = useNavigate();

    const tabs = [
        { id: 'feed', label: 'Feed', icon: MessageCircle, path: '/community' },
        { id: 'circles', label: 'Circles', icon: Users, path: '/circles' }
    ];

    return (
        <div className="flex gap-2 border-b border-gray-100 pb-4">
            {tabs.map(tab => {
                const isActive = active === tab.id;
                const Icon = tab.icon;
                return (
                    <button
                        key={tab.id}
                        onClick={() => navigate(tab.path)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                            isActive
                                ? 'bg-black text-white'
                                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                        }`}
                    >
                        <Icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                );
            })}
        </div>
    );
}
