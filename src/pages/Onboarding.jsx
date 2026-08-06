import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import DesktopLayoutWrapper from '../components/layout/DesktopLayoutWrapper';
import SEO from '../components/common/SEO';
import { ChevronLeft, ArrowRight, Heart } from 'lucide-react';
import Button from '../components/common/Button';
import { db } from '../services/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function Onboarding() {
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    const [prefs, setPrefs] = useState({
        mood: '',
        struggles: [],
        immediateGoal: '',
        privacy: 'anonymous' // Always anonymous
    });

    // Ensure user is authenticated to be here
    useEffect(() => {
        if (currentUser === null) {
            navigate('/login');
        }
    }, [currentUser, navigate]);

    if (!currentUser) return null;

    const nextStep = () => setStep(prev => prev + 1);
    const prevStep = () => setStep(prev => Math.max(1, prev - 1));

    const toggleStruggle = (struggle) => {
        setPrefs(prev => {
            const isSelected = prev.struggles.includes(struggle);
            let updated = isSelected 
                ? prev.struggles.filter(s => s !== struggle) 
                : [...prev.struggles, struggle];
            
            // Limit to 3 max
            if (updated.length > 3) {
                updated = updated.slice(1);
            }
            return { ...prev, struggles: updated };
        });
    };

    const handleComplete = async () => {
        setLoading(true);
        try {
            const userRef = doc(db, 'users', currentUser.uid);
            await setDoc(userRef, {
                uid: currentUser.uid,
                email: currentUser.email || null,
                displayName: currentUser.displayName || 'Soul Searcher',
                photoURL: currentUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.uid}`,
                onboardingCompleted: true,
                preferences: prefs,
                updatedAt: serverTimestamp(),
                role: 'user'
            }, { merge: true });

            navigate('/'); // Go to PatientDashboard
        } catch (error) {
            console.error("Onboarding error:", error);
            // Even if save fails, let them in to avoid blocking care
            navigate('/'); 
        } finally {
            setLoading(false);
        }
    };

    const handleSkip = () => {
        // Just mark as completed with empty prefs
        handleComplete();
    };

    return (
        <DesktopLayoutWrapper hideNav>
            <SEO title="Intake — SoulThread" />
            
            <div className="min-h-screen bg-[#fafafa] flex flex-col relative overflow-hidden transition-colors duration-500">
                
                {/* Back Button */}
                {step > 1 && (
                    <button 
                        onClick={prevStep}
                        className="absolute top-6 left-6 md:top-10 md:left-10 w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-900 hover:border-gray-300 transition-all z-20 shadow-sm"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                )}

                {/* Skip Button - Always available */}
                <button 
                    onClick={handleSkip}
                    disabled={loading}
                    className="absolute top-6 right-6 md:top-10 md:right-10 px-4 py-2 text-sm font-bold text-gray-400 hover:text-gray-900 transition-colors z-20"
                >
                    Skip for now
                </button>

                <div className="flex-1 flex items-center justify-center p-4 py-12 z-10 relative w-full">
                    <div className="w-full max-w-2xl">
                        
                        {/* STEP 1: Baseline Mood */}
                        {step === 1 && (
                            <div className="animate-in fade-in slide-in-from-right-8 duration-500 text-center">
                                <div className="mb-10">
                                    <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                        <Heart className="w-8 h-8" />
                                    </div>
                                    <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">How are you feeling right now?</h2>
                                    <p className="text-gray-500">This helps us understand your baseline today.</p>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-xl mx-auto mb-10">
                                    {[
                                        { label: 'Anxious', color: 'bg-yellow-50 text-yellow-900 border-yellow-100 hover:bg-yellow-100' },
                                        { label: 'Overwhelmed', color: 'bg-red-50 text-red-900 border-red-100 hover:bg-red-100' },
                                        { label: 'Numb', color: 'bg-gray-50 text-gray-900 border-gray-200 hover:bg-gray-100' },
                                        { label: 'Content', color: 'bg-green-50 text-green-900 border-green-100 hover:bg-green-100' },
                                        { label: 'Hopeful', color: 'bg-blue-50 text-blue-900 border-blue-100 hover:bg-blue-100' },
                                        { label: 'Tired', color: 'bg-purple-50 text-purple-900 border-purple-100 hover:bg-purple-100' },
                                        { label: 'Stressed', color: 'bg-orange-50 text-orange-900 border-orange-100 hover:bg-orange-100' },
                                        { label: 'Peaceful', color: 'bg-teal-50 text-teal-900 border-teal-100 hover:bg-teal-100' }
                                    ].map(mood => (
                                        <button 
                                            key={mood.label}
                                            onClick={() => { setPrefs({...prefs, mood: mood.label}); nextStep(); }}
                                            className={`p-4 rounded-2xl border transition-all font-bold ${mood.color} ${prefs.mood === mood.label ? 'ring-2 ring-offset-2 ring-indigo-500 shadow-md' : 'shadow-sm'}`}
                                        >
                                            {mood.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* STEP 2: Primary Struggles */}
                        {step === 2 && (
                            <div className="animate-in fade-in slide-in-from-right-8 duration-500 text-center">
                                <div className="mb-10">
                                    <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">What brings you to SoulThread?</h2>
                                    <p className="text-gray-500">Select up to 3 areas you'd like support with.</p>
                                </div>
                                <div className="flex flex-wrap justify-center gap-3 max-w-xl mx-auto mb-10">
                                    {['Anxiety', 'Depression', 'Sleep Issues', 'Relationships', 'Work Burnout', 'Grief & Loss', 'Trauma', 'Loneliness', 'Self-Esteem', 'Life Transitions'].map(topic => {
                                        const selected = prefs.struggles.includes(topic);
                                        return (
                                            <button 
                                                key={topic}
                                                onClick={() => toggleStruggle(topic)}
                                                className={`px-6 py-4 rounded-full border-2 font-bold text-sm md:text-base transition-all ${selected ? 'border-indigo-600 bg-indigo-600 text-white shadow-md' : 'border-gray-200 bg-white text-gray-700 hover:border-indigo-300'}`}
                                            >
                                                {topic}
                                            </button>
                                        )
                                    })}
                                </div>
                                <Button variant="primary" className="px-12 py-3.5 rounded-xl font-bold shadow-md" onClick={nextStep} disabled={prefs.struggles.length === 0}>
                                    Continue
                                </Button>
                            </div>
                        )}

                        {/* STEP 3: Routing & Finalization */}
                        {step === 3 && (
                            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                                <div className="mb-10 text-center">
                                    <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">How would you like to start?</h2>
                                    <p className="text-gray-500">Choose your immediate next step. You can always change this later.</p>
                                </div>
                                <div className="flex flex-col gap-4 max-w-lg mx-auto mb-10">
                                    {[
                                        { id: 'explore', title: 'Explore the Sanctuary', desc: 'Browse grounding exercises and the anonymous community feed.' },
                                        { id: 'guide', title: 'Find a Professional Guide', desc: 'View verified therapists and coaches to schedule a private session.' },
                                        { id: 'journal', title: 'Write in my Private Journal', desc: 'Take a moment to reflect and document my thoughts securely.' }
                                    ].map(goal => (
                                        <button 
                                            key={goal.id}
                                            onClick={() => setPrefs({...prefs, immediateGoal: goal.id})}
                                            className={`p-6 text-left rounded-2xl border-2 transition-all ${prefs.immediateGoal === goal.id ? 'border-indigo-600 bg-indigo-50 shadow-md' : 'border-gray-100 bg-white hover:border-indigo-200 hover:shadow-sm'} group flex justify-between items-center`}
                                        >
                                            <div>
                                                <div className="font-bold text-gray-900 text-lg mb-1">{goal.title}</div>
                                                <div className="text-sm text-gray-500">{goal.desc}</div>
                                            </div>
                                            <ArrowRight className={`w-5 h-5 transition-colors ${prefs.immediateGoal === goal.id ? 'text-indigo-600' : 'text-gray-300 group-hover:text-indigo-400'}`} />
                                        </button>
                                    ))}
                                </div>
                                
                                <div className="text-center">
                                    <Button variant="primary" className="px-12 py-3.5 rounded-xl font-bold shadow-md w-full sm:w-auto" onClick={handleComplete} disabled={loading || !prefs.immediateGoal}>
                                        {loading ? 'Preparing your space...' : 'Enter Sanctuary'}
                                    </Button>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </DesktopLayoutWrapper>
    );
}
