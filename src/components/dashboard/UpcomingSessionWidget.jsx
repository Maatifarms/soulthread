import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar, Video, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function UpcomingSessionWidget() {
    const { currentUser } = useAuth();
    const [upcoming, setUpcoming] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUser) return;
        const fetchUpcoming = () => {
            const todayStr = new Date().toISOString().split('T')[0];
            const q = query(
                collection(db, 'bookings'),
                where('patientId', '==', currentUser.uid),
                where('date', '>=', todayStr),
                orderBy('date'),
                limit(1)
            );
            
            const unsubscribe = onSnapshot(q, (snap) => {
                if (!snap.empty) {
                    setUpcoming({ id: snap.docs[0].id, ...snap.docs[0].data() });
                } else {
                    setUpcoming(null);
                }
                setLoading(false);
            }, (error) => {
                console.error("Failed to fetch upcoming session:", error);
                setLoading(false);
            });

            return unsubscribe;
        };
        const unsubscribe = fetchUpcoming();
        return () => unsubscribe();
    }, [currentUser]);

    if (loading) {
        return (
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm min-h-[200px]">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Upcoming Session</h2>
                <div className="animate-pulse flex space-x-4">
                    <div className="rounded-full bg-gray-200 h-12 w-12"></div>
                    <div className="flex-1 space-y-4 py-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!upcoming) {
        return (
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center min-h-[200px]">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <Calendar className="w-6 h-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">You don't have an upcoming session</h3>
                <p className="text-sm text-gray-500 mb-6 max-w-[250px]">Book a session with an expert to continue your healing journey.</p>
                <Link to="/experts" className="px-6 py-2.5 bg-black text-white font-bold rounded-full hover:bg-gray-800 transition-colors">
                    Book a Psychologist
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between min-h-[200px]">
            <div>
                <div className="flex justify-between items-start mb-4">
                    <h2 className="text-lg font-bold text-gray-900">Upcoming Session</h2>
                    <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full uppercase tracking-wider">Confirmed</span>
                </div>
                
                <div className="flex items-center gap-4">
                    {upcoming.guidePhotoURL ? (
                        <img src={upcoming.guidePhotoURL} alt={upcoming.guideName} className="w-14 h-14 rounded-full object-cover border border-gray-100" />
                    ) : (
                        <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-xl font-bold text-gray-400">
                            {upcoming.guideName ? upcoming.guideName[0] : 'P'}
                        </div>
                    )}
                    <div>
                        <h3 className="font-bold text-gray-900">{upcoming.guideName || 'Psychologist'}</h3>
                        <p className="text-sm text-gray-500 flex items-center mt-1">
                            <Video className="w-4 h-4 mr-1.5" />
                            {upcoming.sessionType || 'Video Session'}
                        </p>
                    </div>
                </div>
                
                <div className="mt-5 bg-gray-50 p-4 rounded-2xl flex justify-between items-center">
                    <div>
                        <p className="text-xs text-gray-500 font-medium mb-1">DATE & TIME</p>
                        <p className="text-sm font-bold text-gray-900">{upcoming.date}</p>
                        <p className="text-sm font-bold text-gray-900">{upcoming.startTime || upcoming.slot}</p>
                    </div>
                    <div className="text-right">
                        <Link to={`/session/${upcoming.id}`} className="flex items-center text-sm font-bold text-black hover:text-gray-600">
                            View Details <ArrowRight className="w-4 h-4 ml-1" />
                        </Link>
                    </div>
                </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-100 flex gap-3">
                <Link to={`/session-room/${upcoming.id}`} className="flex-1 bg-black text-white text-center py-2.5 rounded-xl font-bold hover:bg-gray-800 transition-colors">
                    Join Session
                </Link>
            </div>
        </div>
    );
}
