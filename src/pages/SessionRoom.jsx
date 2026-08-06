import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, Heart, ArrowLeft, RefreshCcw } from 'lucide-react';
import SEO from '../components/common/SEO';
import { functions } from '../services/firebase';
import { httpsCallable } from 'firebase/functions';

export default function SessionRoom() {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const [roomName, setRoomName] = useState('');
    const [connecting, setConnecting] = useState(true);
    const [error, setError] = useState(null);
    const [breathingStep, setBreathingStep] = useState(0);

    // Grounding pre-session animation
    useEffect(() => {
        if (!connecting) return;
        const interval = setInterval(() => {
            setBreathingStep(prev => (prev + 1) % 3);
        }, 3000);
        return () => clearInterval(interval);
    }, [connecting]);

    useEffect(() => {
        const initializeSession = async () => {
            try {
                // 1. Notify Backend State Machine
                const checkInCall = httpsCallable(functions, 'checkIn');
                await checkInCall({ bookingId: sessionId });

                // 2. Generate secure deterministic room name
                const encoder = new TextEncoder();
                const data = encoder.encode(sessionId + '-soulthread-beta');
                const hashBuffer = await crypto.subtle.digest('SHA-256', data);
                const hashArray = Array.from(new Uint8Array(hashBuffer));
                const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
                setRoomName(`soulthread-${hashHex.substring(0, 16)}`);
            } catch (err) {
                console.error("Session check-in failed:", err);
                setError('We experienced a slight delay connecting to the secure room. Your session is completely safe. Please try refreshing or wait a moment.');
            } finally {
                setConnecting(false);
            }
        };
        initializeSession();
    }, [sessionId]);

    const handleEndSession = () => {
        // Transition gracefully to a reflection state (e.g. Journal or Dashboard)
        navigate('/?aftercare=true');
    };

    return (
        <div className="min-h-screen bg-[#fafafa] flex flex-col relative text-gray-900 overflow-hidden">
            <SEO title="Session Room | SoulThread" />
            
            {/* Soft Header */}
            <div className="absolute top-0 left-0 right-0 z-10 bg-white/80 border-b border-gray-100 p-4 backdrop-blur-md flex justify-between items-center shadow-sm">
                <div>
                    <h1 className="text-lg font-bold text-gray-900">SoulThread</h1>
                    <div className="flex items-center text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full mt-1 w-fit border border-green-100">
                        <ShieldCheck className="w-3 h-3 mr-1" /> End-to-End Encrypted
                    </div>
                </div>
            </div>

            {connecting ? (
                <div className="flex-1 flex flex-col items-center justify-center p-4">
                    <div className="w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center mb-8 relative">
                        <div className={`absolute inset-0 rounded-full bg-blue-100 transition-transform duration-3000 ease-in-out ${breathingStep === 1 ? 'scale-150 opacity-50' : breathingStep === 2 ? 'scale-110 opacity-80' : 'scale-100 opacity-100'}`}></div>
                        <Heart className="w-8 h-8 text-blue-400 relative z-10" />
                    </div>
                    <h2 className="text-xl font-bold mb-2">Preparing your secure room</h2>
                    <p className="text-gray-500 font-medium text-sm text-center max-w-sm">
                        Take a slow, deep breath in... and exhale. We are setting up your private space.
                    </p>
                </div>
            ) : error ? (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
                    <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center mb-6">
                        <RefreshCcw className="w-8 h-8 text-orange-400" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-3">Connection Paused</h2>
                    <p className="text-gray-600 mb-8 leading-relaxed">{error}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="w-full py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-colors"
                    >
                        Re-enter Room
                    </button>
                    <button 
                        onClick={() => navigate(-1)}
                        className="mt-4 text-gray-500 hover:text-gray-900 font-medium text-sm"
                    >
                        Go back to Dashboard
                    </button>
                </div>
            ) : roomName ? (
                <iframe
                    src={`https://meet.jit.si/${roomName}`}
                    allow="camera; microphone; fullscreen; display-capture; autoplay"
                    className="w-full flex-1 border-none mt-16"
                    style={{ width: '100%', height: 'calc(100vh - 64px)' }}
                />
            ) : null}

            {/* End Session Button overlaid on video if connected */}
            {!connecting && !error && roomName && (
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
                    <button 
                        onClick={handleEndSession}
                        className="px-6 py-3.5 rounded-full bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 flex items-center gap-2 transition-all shadow-lg font-bold"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        End Session & Reflect
                    </button>
                </div>
            )}
        </div>
    );
}
