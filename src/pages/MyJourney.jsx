import React, { useState, useEffect } from 'react';
import DesktopLayoutWrapper from '../components/layout/DesktopLayoutWrapper';
import SEO from '../components/common/SEO';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../services/firebase';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { Calendar, Video, FileText, CheckCircle, Gift, Users, MessageSquare } from 'lucide-react';
import Loading from '../components/common/Loading';

export default function MyJourney() {
    const { currentUser } = useAuth();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUser) return;
        const fetchTimeline = async () => {
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
            } finally {
                setLoading(false);
            }
        };
        fetchTimeline();
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
                    
                    {events.length === 0 ? (
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
