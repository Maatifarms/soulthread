import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Activity, Bell, FileText, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function RecentActivityWidget() {
    const { currentUser } = useAuth();
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUser) return;
        const fetchActivity = () => {
            const q = query(
                collection(db, 'notifications'),
                where('recipientId', '==', currentUser.uid),
                orderBy('createdAt', 'desc'),
                limit(3)
            );
            
            const unsubscribe = onSnapshot(q, (snap) => {
                const fetched = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setActivities(fetched);
                setLoading(false);
            }, (error) => {
                console.error("Failed to fetch recent activity:", error);
                setLoading(false);
            });

            return unsubscribe;
        };
        const unsubscribe = fetchActivity();
        return () => unsubscribe();
    }, [currentUser]);

    const getIcon = (type) => {
        switch(type) {
            case 'message': return <Bell className="w-4 h-4 text-blue-500" />;
            case 'journal': return <FileText className="w-4 h-4 text-purple-500" />;
            case 'care_plan': return <Heart className="w-4 h-4 text-red-500" />;
            default: return <Activity className="w-4 h-4 text-gray-500" />;
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm min-h-[300px]">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h2>
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-16 bg-gray-50 rounded-2xl border border-gray-100 animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm min-h-[300px] flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
                <Link to="/notifications" className="text-sm font-bold text-gray-500 hover:text-black transition-colors">
                    View All
                </Link>
            </div>

            {activities.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                        <Activity className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-sm font-medium text-gray-900">No recent activity</p>
                    <p className="text-xs text-gray-500 mt-1">Your notifications, journal updates, and care plans will appear here.</p>
                </div>
            ) : (
                <div className="space-y-4 flex-1">
                    {activities.map(act => (
                        <div key={act.id} className="flex items-start gap-4 p-3 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                            <div className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center shrink-0 shadow-sm">
                                {getIcon(act.type)}
                            </div>
                            <div className="flex-1 min-w-0 pt-0.5">
                                <p className="text-sm font-medium text-gray-900 truncate">{act.title || 'Notification'}</p>
                                <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{act.message}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
