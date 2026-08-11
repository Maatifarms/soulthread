import React, { useState, useEffect } from 'react';
import DesktopLayoutWrapper from '../components/layout/DesktopLayoutWrapper';
import SEO from '../components/common/SEO';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../services/firebase';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { Calendar, Video, FileText, CheckCircle, Gift, Users, MessageSquare, AlertCircle } from 'lucide-react';
import Loading from '../components/common/Loading';
import { Button } from '../components/common/Button';

export default function MyJourney() {
    const { currentUser } = useAuth();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState(false);

    const fetchTimeline = async () => {
        if (!currentUser) return;
        setLoading(true);
        setFetchError(false);
        try {
            const q = query(
                collection(db, 'timeline'),
                where('userId', '==', currentUser.uid),
                orderBy('timestamp', 'desc')
            );
            const snap = await getDocs(q);
            setEvents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (error) {
            console.error("Failed to fetch timeline", error);
            setFetchError(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTimeline();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUser]);

    const getIcon = (type) => {
        switch(type) {
            case 'booking_created': return <Calendar className="w-5 h-5 text-blue-500" />;
            case 'session_completed': return <Video className="w-5 h-5 text-green-500" />;
            case 'journal_created': return <FileText className="w-5 h-5 text-purple-500" />;
            case 'assessment': return <CheckCircle className="w-5 h-5 text-orange-500" />;
            case 'resource': return <Gift className="w-5 h-5 text-pink-500" />;
            case 'community': return <Users className="w-5 h-5 text-indigo-500" />;
            default: return <MessageSquare className="w-5 h-5 text-gray-500" />;
        }
    };

    if (loading) return <Loading />;

    return (
        <DesktopLayoutWrapper>
            <SEO title="My Healing Journey | SoulThread" />
            <div className="min-h-screen bg-gray-50 pb-24 pt-6">
                <div className="max-w-3xl mx-auto px-4">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">My Healing Journey</h1>
                    <p className="text-gray-500 mb-8">A timeline of your progress and milestones.</p>

                    {fetchError ? (
                        <div className="bg-white rounded-3xl p-8 border border-red-100 shadow-sm flex flex-col items-center justify-center text-center min-h-[300px]">
                            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4">
                                <AlertCircle className="w-6 h-6 text-red-400" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Couldn't load your journey</h3>
                            <p className="text-sm text-gray-500 max-w-sm mb-6">Something went wrong reaching your timeline. Please try again.</p>
                            <Button variant="primary" onClick={fetchTimeline} className="px-6 py-2.5 bg-black text-white font-bold rounded-full hover:bg-gray-800 transition-colors">
                                Try Again
                            </Button>
                        </div>
                    ) : events.length === 0 ? (
                        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center min-h-[300px]">
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Your journey begins here</h3>
                            <p className="text-sm text-gray-500 max-w-sm">As you book sessions, write in your journal, and complete assessments, your timeline will grow.</p>
                        </div>
                    ) : (
                        <div className="relative pl-6 sm:pl-8">
                            <div className="absolute left-[11px] sm:left-[19px] top-6 bottom-6 w-0.5 bg-gray-200"></div>
                            
                            <div className="space-y-8">
                                {events.map((event) => (
                                    <div key={event.id} className="relative">
                                        <div className="absolute -left-6 sm:-left-8 top-1 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white border-2 border-gray-100 flex items-center justify-center z-10 shadow-sm">
                                            {getIcon(event.type)}
                                        </div>
                                        
                                        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm ml-4 sm:ml-6 hover:shadow-md transition-shadow">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-bold text-gray-900">{event.title}</h3>
                                                <span className="text-xs font-semibold text-gray-400">
                                                    {event.timestamp?.toDate ? event.timestamp.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Just now'}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600">{event.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DesktopLayoutWrapper>
    );
}
