import React from 'react';
import { Card } from '../common/Card';
import { Users, Moon, Heart, Brain, Smile } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MOCK_COMMUNITIES = [
    { id: 'anxiety', name: 't/Anxiety', icon: <Brain className="w-5 h-5 text-blue-500" />, members: '12k' },
    { id: 'sleep', name: 't/Sleep', icon: <Moon className="w-5 h-5 text-indigo-500" />, members: '8k' },
    { id: 'relationships', name: 't/Relationships', icon: <Heart className="w-5 h-5 text-red-500" />, members: '24k' },
    { id: 'parenting', name: 't/Parenting', icon: <Smile className="w-5 h-5 text-green-500" />, members: '5k' }
];

export default function CommunityDiscoveryWidget() {
    const navigate = useNavigate();

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-900">Your Communities</h2>
                <button className="text-sm font-bold text-gray-500 hover:text-black transition-colors">
                    Explore All
                </button>
            </div>
            
            <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
                {MOCK_COMMUNITIES.map(community => (
                    <Card 
                        key={community.id}
                        className="shrink-0 w-48 hover:border-black cursor-pointer transition-all"
                        onClick={() => navigate(`/community/${community.id}`)}
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100">
                                {community.icon}
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-sm">{community.name}</h3>
                                <div className="flex items-center text-xs text-gray-500">
                                    <Users className="w-3 h-3 mr-1" /> {community.members}
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
