import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DesktopLayoutWrapper from '../components/layout/DesktopLayoutWrapper';
import SEO from '../components/common/SEO';
import { Calendar, Video, ArrowLeft, Heart } from 'lucide-react';

export default function SessionDetail() {
    const { sessionId } = useParams();
    const navigate = useNavigate();

    return (
        <DesktopLayoutWrapper>
            <SEO title="Session Details | SoulThread" />
            <div className="min-h-screen bg-[#fafafa] pb-24 pt-8">
                <div className="max-w-3xl mx-auto px-4">
                    
                    <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-black mb-8 transition-colors font-medium">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
                    </button>
                    
                    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                        {/* Soft Header */}
                        <div className="flex flex-col items-center text-center mb-8 pb-8 border-b border-gray-50">
                            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                                <Heart className="w-8 h-8 text-blue-400" />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">Upcoming Session</h1>
                            <p className="text-gray-500 text-sm max-w-md mx-auto">
                                Take a deep breath. You're exactly where you need to be.
                            </p>
                        </div>
                        
                        {/* Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                            <div className="bg-gray-50 rounded-2xl p-5 flex items-start gap-4">
                                <Calendar className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-sm font-bold text-gray-900 mb-1">Scheduled Time</p>
                                    <p className="text-sm text-gray-600">Your Guide will be ready for you at the exact booked time.</p>
                                </div>
                            </div>
                            <div className="bg-gray-50 rounded-2xl p-5 flex items-start gap-4">
                                <Video className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-sm font-bold text-gray-900 mb-1">Secure Video</p>
                                    <p className="text-sm text-gray-600">End-to-End Encrypted. Your privacy is our highest priority.</p>
                                </div>
                            </div>
                        </div>

                        {/* Gentle Instructions */}
                        <div className="text-center mb-8 px-4">
                            <p className="text-sm text-gray-500">
                                The secure waiting room will open <strong className="text-gray-900">5 minutes</strong> before your session begins. Arrive early to settle in.
                            </p>
                        </div>

                        {/* CTA */}
                        <button 
                            onClick={() => navigate(`/session-room/${sessionId}`)}
                            className="w-full py-4 bg-black text-white font-bold rounded-2xl hover:bg-gray-800 transition-colors shadow-md"
                        >
                            Enter Waiting Room
                        </button>
                    </div>
                </div>
            </div>
        </DesktopLayoutWrapper>
    );
}
