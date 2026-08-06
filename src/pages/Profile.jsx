import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import DesktopLayoutWrapper from '../components/layout/DesktopLayoutWrapper';
import SEO from '../components/common/SEO';
import { ShieldCheck, GraduationCap, Languages, Calendar, ArrowLeft, Clock, Info } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';

import { Spinner } from '../components/common/Spinner';

export default function Profile() {
    const { psychologistId } = useParams();
    const navigate = useNavigate();
    
    const [guide, setGuide] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const docRef = doc(db, 'guides', psychologistId);
                const docSnap = await getDoc(docRef);
                
                if (docSnap.exists()) {
                    setGuide({ id: docSnap.id, ...docSnap.data() });
                } else {
                    setError('Psychologist profile not found.');
                }
            } catch (err) {
                console.error("Failed to fetch profile:", err);
                setError('Failed to load profile. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [psychologistId]);

    if (loading) {
        return (
            <DesktopLayoutWrapper>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <Spinner size="lg" />
                </div>
            </DesktopLayoutWrapper>
        );
    }

    if (error || !guide) {
        return (
            <DesktopLayoutWrapper>
                <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h2>
                    <p className="text-gray-500 mb-6">{error || 'The requested profile does not exist or has been removed.'}</p>
                    <button onClick={() => navigate('/experts')} className="px-6 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800">
                        Back to Directory
                    </button>
                </div>
            </DesktopLayoutWrapper>
        );
    }

    return (
        <DesktopLayoutWrapper>
            <SEO 
                title={`${guide.name} - ${guide.title || 'Clinical Psychologist'} | SoulThread`}
                description={guide.bio}
            />
            
            <div className="bg-gray-50 min-h-screen pb-24">
                {/* Header Strip */}
                <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
                    <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
                        <button onClick={() => navigate('/experts')} className="flex items-center text-sm font-medium text-gray-600 hover:text-black transition-colors">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Directory
                        </button>
                        <button 
                            onClick={() => navigate(`/book/${guide.id}`)}
                            className="px-6 py-2 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors hidden md:block"
                        >
                            Book Session
                        </button>
                    </div>
                </div>

                <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-8">
                    <div className="flex flex-col lg:flex-row gap-8">
                        
                        {/* Main Profile Info (Left Col) */}
                        <div className="lg:w-2/3 space-y-8">
                            {/* Verification Banner */}
                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center text-blue-800">
                                <ShieldCheck className="w-5 h-5 mr-3 shrink-0" />
                                <div>
                                    <p className="font-semibold text-sm">Verified Clinical Professional</p>
                                    <p className="text-xs opacity-80">Credentials, identity, and background verified by SoulThread.</p>
                                </div>
                            </div>

                            {/* Intro Card */}
                            <Card className="flex flex-col md:flex-row gap-6 items-start">
                                <div className="shrink-0 mx-auto md:mx-0">
                                    {guide.photoURL ? (
                                        <img src={guide.photoURL} alt={guide.name} className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-white shadow-lg" />
                                    ) : (
                                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-4xl font-bold text-gray-400 border-4 border-white shadow-lg">
                                            {guide.name[0]}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 text-center md:text-left">
                                    <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2 justify-center md:justify-start">
                                        <h1 className="text-3xl font-bold text-gray-900">{guide.name}</h1>
                                        <Badge variant="success">Verified</Badge>
                                    </div>
                                    <p className="text-lg font-medium text-blue-600 mb-4">{guide.title || guide.degree || 'Clinical Psychologist'}</p>
                                    
                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-gray-600">
                                        <div className="flex items-center">
                                            <GraduationCap className="w-4 h-4 mr-1.5 text-gray-400" />
                                            {guide.experienceYears ? `${guide.experienceYears}+ Years Exp.` : 'Experience Verified'}
                                        </div>
                                        <div className="flex items-center">
                                            <Languages className="w-4 h-4 mr-1.5 text-gray-400" />
                                            {guide.languages?.join(', ') || 'Not specified'}
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            {/* About */}
                            <Card>
                                <h2 className="text-xl font-bold text-gray-900 mb-4">About</h2>
                                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{guide.bio || 'Biography not provided.'}</p>
                            </Card>

                            {/* Expertise */}
                            <Card>
                                <h2 className="text-xl font-bold text-gray-900 mb-4">Areas of Expertise</h2>
                                <div className="flex flex-wrap gap-3">
                                    {(guide.specializations || []).map((spec, idx) => (
                                        <Badge key={idx} variant="outline" className="text-sm px-4 py-1.5">{spec}</Badge>
                                    ))}
                                    {(!guide.specializations || guide.specializations.length === 0) && (
                                        <span className="text-gray-500 italic">Currently updating specializations.</span>
                                    )}
                                </div>
                            </Card>

                            {/* What to Expect */}
                            <Card className="bg-gray-50/50">
                                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                    <Info className="w-5 h-5 mr-2 text-gray-400" /> What to Expect
                                </h2>
                                <div className="space-y-4 text-gray-700">
                                    <p><strong>First Session:</strong> A safe, non-judgmental space to discuss what brings you here and establish your therapeutic goals.</p>
                                    <p><strong>Confidentiality:</strong> Everything shared remains strictly private and protected under clinical guidelines.</p>
                                </div>
                            </Card>
                        </div>

                        {/* Sticky Action Sidebar (Right Col) */}
                        <div className="lg:w-1/3">
                            <Card className="sticky top-24 shadow-xl">
                                <h3 className="text-lg font-bold text-gray-900 mb-6">Book a Session</h3>
                                
                                <div className="space-y-4 mb-8">
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                                        <div className="flex items-center text-gray-700">
                                            <Calendar className="w-5 h-5 mr-3 text-blue-500" />
                                            <span className="font-medium">Video Consultation</span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                                        <div className="flex items-center text-gray-700">
                                            <Clock className="w-5 h-5 mr-3 text-gray-500" />
                                            <span className="font-medium">45 Minutes</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                                        <span className="font-medium text-gray-700">Consultation Fee</span>
                                        <span className="font-bold text-gray-900">₹{guide.fee || '1500'}</span>
                                    </div>
                                    
                                    {guide.rciNumber && (
                                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
                                            <div className="flex items-center text-green-700">
                                                <ShieldCheck className="w-5 h-5 mr-3 text-green-500" />
                                                <span className="font-medium text-sm">RCI Registered</span>
                                            </div>
                                            <span className="text-xs text-green-700 font-mono">{guide.rciNumber}</span>
                                        </div>
                                    )}
                                </div>

                                <Button 
                                    variant="primary"
                                    onClick={() => navigate(`/book/${guide.id}`)}
                                    style={{ width: '100%', padding: '16px 0', fontSize: '16px' }}
                                >
                                    Select Date & Time
                                </Button>
                                <p className="text-center text-xs text-gray-400 mt-4">Free cancellation up to 24 hours before</p>
                            </Card>
                        </div>

                    </div>
                </div>
            </div>
            
            {/* Mobile Fixed Bottom Bar */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50">
                <button 
                    onClick={() => navigate(`/book/${guide.id}`)}
                    className="w-full py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800"
                >
                    Book Session
                </button>
            </div>
        </DesktopLayoutWrapper>
    );
}
