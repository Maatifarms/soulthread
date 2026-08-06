import React, { useState } from 'react';
import { Smile, Frown, Meh, Heart, Sun } from 'lucide-react';
import { db } from '../../services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';

const MOODS = [
    { id: 'thriving', icon: Sun, color: 'text-yellow-500', bgHover: 'hover:bg-yellow-50', label: 'Thriving' },
    { id: 'calm', icon: Smile, color: 'text-green-500', bgHover: 'hover:bg-green-50', label: 'Calm' },
    { id: 'reflective', icon: Meh, color: 'text-gray-500', bgHover: 'hover:bg-gray-50', label: 'Reflective' },
    { id: 'anxious', icon: Frown, color: 'text-orange-500', bgHover: 'hover:bg-orange-50', label: 'Anxious' },
    { id: 'struggling', icon: Heart, color: 'text-red-500', bgHover: 'hover:bg-red-50', label: 'Struggling' }
];

export default function MoodCheckInWidget() {
    const { currentUser } = useAuth();
    const [selected, setSelected] = useState(null);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleMoodSelect = async (moodId) => {
        if (!currentUser || saving || saved) return;
        setSelected(moodId);
        setSaving(true);
        
        try {
            await addDoc(collection(db, 'mood_logs'), {
                userId: currentUser.uid,
                mood: moodId,
                createdAt: serverTimestamp()
            });

            setSaved(true);
        } catch (error) {
            console.error("Error saving mood:", error);
            setSelected(null);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm min-h-[200px] flex flex-col justify-between">
            <div>
                <h2 className="text-lg font-bold text-gray-900 mb-1">Daily Check-in</h2>
                <p className="text-sm text-gray-500 mb-6">How are you feeling today?</p>
            </div>
            
            {saved ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center animate-in fade-in duration-500">
                    <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-3">
                        <Smile className="w-6 h-6 text-green-500" />
                    </div>
                    <p className="text-sm font-bold text-gray-900">Recorded</p>
                    <p className="text-xs text-gray-500 mt-1">Thanks for checking in.</p>
                </div>
            ) : (
                <div className="flex justify-between items-center px-2">
                    {MOODS.map(mood => {
                        const Icon = mood.icon;
                        const isSelected = selected === mood.id;
                        return (
                            <button
                                key={mood.id}
                                onClick={() => handleMoodSelect(mood.id)}
                                disabled={saving}
                                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex flex-col items-center justify-center transition-all ${mood.bgHover}
                                    ${isSelected ? 'bg-gray-100 ring-2 ring-black scale-110 shadow-sm' : 'bg-gray-50 hover:scale-105'}`}
                                aria-label={mood.id}
                            >
                                <Icon className={`w-6 h-6 ${mood.color}`} />
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
