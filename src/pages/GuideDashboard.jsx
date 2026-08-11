import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, doc, getDoc } from 'firebase/firestore';
import { db, functions } from '../services/firebase';
import { httpsCallable } from 'firebase/functions';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Clock, AlertTriangle, Users, MessageSquare, Video, FileText, CheckCircle2 } from 'lucide-react';
import DesktopLayoutWrapper from '../components/layout/DesktopLayoutWrapper';
import SEO from '../components/common/SEO';

export default function GuideDashboard() {
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [todayBookings, setTodayBookings] = useState([]);
    const [guideProfile, setGuideProfile] = useState(null);
    const [actionItems, setActionItems] = useState({
        pendingNotes: 0,
        criticalPatients: 0,
        unreadMessages: 0,
        circleSessions: 0
    });

    useEffect(() => {
        if (!currentUser) return;
        fetchWorkspaceData();
    }, [currentUser]);

    const fetchWorkspaceData = async () => {
        setLoading(true);
        try {
            // 1. Fetch Guide Profile (for isAvailable status)
            const { doc, getDoc } = await import('firebase/firestore');
            const gSnap = await getDoc(doc(db, 'guides', currentUser.uid));
            if (gSnap.exists()) setGuideProfile(gSnap.data());

            // 2. Fetch Today's Bookings
            // Real bookings store `scheduledStartTime` (a Firestore Timestamp), never a
            // separate `date`/`startTime` pair — those fields don't exist on any real
            // booking doc, so the old date/startTime-filtered query always silently
            // returned zero results. This range query matches the existing
            // guideId+scheduledStartTime composite index (same one SessionsManager-style
            // patient queries already rely on), so no new index is needed.
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);
            const todayEnd = new Date(todayStart);
            todayEnd.setDate(todayEnd.getDate() + 1);

            const bRef = collection(db, 'bookings');
            const bQuery = query(
                bRef,
                where('guideId', '==', currentUser.uid),
                where('scheduledStartTime', '>=', todayStart),
                where('scheduledStartTime', '<', todayEnd),
                orderBy('scheduledStartTime')
            );
            const bSnap = await getDocs(bQuery);
            const rawBookings = bSnap.docs.map(d => ({ id: d.id, ...d.data() }));

            // Bookings only store userId, never a denormalized patient name. Patient
            // profile docs aren't guide-readable directly (they carry email/phone/
            // age/gender) — this goes through a callable that checks a real booking
            // links this guide to this patient before returning just the name.
            const getPatientProfile = httpsCallable(functions, 'getPatientProfileForGuide');
            const bookingsData = await Promise.all(rawBookings.map(async (b) => {
                let patientName = 'Patient';
                if (b.userId) {
                    try {
                        const result = await getPatientProfile({ patientId: b.userId });
                        if (result.data?.displayName) patientName = result.data.displayName;
                    } catch {
                        // Keep the fallback name — a lookup failure shouldn't break the schedule.
                    }
                }
                return { ...b, patientName };
            }));
            setTodayBookings(bookingsData);

            // 3. Fetch Unread Messages
            const cRef = collection(db, 'conversations');
            const cQuery = query(
                cRef,
                where('participants', 'array-contains', currentUser.uid),
                where('read', '==', false)
            );
            const cSnap = await getDocs(cQuery);
            const unreadCount = cSnap.docs.filter(d => d.data().lastMessageSenderId !== currentUser.uid).length;

            // 4. Calculate Pending Notes (past bookings today without clinical notes).
            // `carePlanId` never existed on any real booking — GuideSessionWorkspace.jsx
            // actually reads/writes `clinicalNotes` directly on the booking doc, so that's
            // the real field to check here.
            const now = new Date();
            const pendingNotesCount = bookingsData.filter(b => {
                const start = b.scheduledStartTime?.toDate ? b.scheduledStartTime.toDate() : new Date(b.scheduledStartTime);
                return start < now && !b.clinicalNotes;
            }).length;

            setActionItems(prev => ({
                ...prev,
                unreadMessages: unreadCount,
                pendingNotes: pendingNotesCount
            }));

        } catch (error) {
            console.error("Workspace fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <DesktopLayoutWrapper hideNav>
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="animate-pulse flex flex-col items-center">
                        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                        <p className="text-gray-500 font-bold">Loading Professional Workspace...</p>
                    </div>
                </div>
            </DesktopLayoutWrapper>
        );
    }

    return (
        <DesktopLayoutWrapper hideNav>
            <SEO title="Workspace | Professional OS" />
            <div className="min-h-screen bg-[#fafafa] pb-24">
                
                {/* OS Header */}
                <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
                    <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-black text-gray-900">Good Morning, {currentUser?.displayName?.split(' ')[0] || 'Doctor'}</h1>
                            <p className="text-sm text-gray-500 font-medium">{format(new Date(), 'EEEE, MMMM do, yyyy')}</p>
                        </div>
                        <div className={`flex items-center gap-3 px-4 py-2 rounded-full border ${guideProfile?.isAvailable ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                            <div className={`w-2.5 h-2.5 rounded-full ${guideProfile?.isAvailable ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                            <span className={`text-sm font-bold ${guideProfile?.isAvailable ? 'text-green-800' : 'text-gray-600'}`}>
                                {guideProfile?.isAvailable ? 'Accepting Sessions' : 'Unavailable'}
                            </span>
                        </div>
                    </div>
                </header>

                <div className="max-w-6xl mx-auto px-6 py-8">
                    
                    {/* Triage Overview */}
                    <div className="mb-10">
                        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Triage Overview</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Card className="border-red-100 bg-red-50/50 hover:bg-red-50 transition-colors cursor-pointer group">
                                <div className="flex justify-between items-start mb-2">
                                    <AlertTriangle className="w-5 h-5 text-red-500" />
                                    <span className="text-2xl font-black text-red-600">{actionItems.criticalPatients}</span>
                                </div>
                                <h3 className="font-bold text-red-900 text-sm">Critical Alerts</h3>
                                <p className="text-xs text-red-700 mt-1 opacity-80 group-hover:opacity-100">Review flagged moods</p>
                            </Card>
                            
                            <Card className="border-orange-100 bg-orange-50/50 hover:bg-orange-50 transition-colors cursor-pointer group">
                                <div className="flex justify-between items-start mb-2">
                                    <FileText className="w-5 h-5 text-orange-500" />
                                    <span className="text-2xl font-black text-orange-600">{actionItems.pendingNotes}</span>
                                </div>
                                <h3 className="font-bold text-orange-900 text-sm">Pending Notes</h3>
                                <p className="text-xs text-orange-700 mt-1 opacity-80 group-hover:opacity-100">Complete clinical docs</p>
                            </Card>

                            <Card className="border-blue-100 bg-blue-50/50 hover:bg-blue-50 transition-colors cursor-pointer group">
                                <div className="flex justify-between items-start mb-2">
                                    <MessageSquare className="w-5 h-5 text-blue-500" />
                                    <span className="text-2xl font-black text-blue-600">{actionItems.unreadMessages}</span>
                                </div>
                                <h3 className="font-bold text-blue-900 text-sm">Unread Messages</h3>
                                <p className="text-xs text-blue-700 mt-1 opacity-80 group-hover:opacity-100">Patient inquiries</p>
                            </Card>

                            <Card className="border-indigo-100 bg-indigo-50/50 hover:bg-indigo-50 transition-colors cursor-pointer group">
                                <div className="flex justify-between items-start mb-2">
                                    <Users className="w-5 h-5 text-indigo-500" />
                                    <span className="text-2xl font-black text-indigo-600">{actionItems.circleSessions}</span>
                                </div>
                                <h3 className="font-bold text-indigo-900 text-sm">Circle Sessions</h3>
                                <p className="text-xs text-indigo-700 mt-1 opacity-80 group-hover:opacity-100">Group moderations</p>
                            </Card>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column: Schedule */}
                        <div className="lg:col-span-2">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-900">Today's Schedule</h2>
                                <Badge variant="secondary">{todayBookings.length} Sessions</Badge>
                            </div>

                            {todayBookings.length === 0 ? (
                                <Card className="py-16 text-center border-dashed">
                                    <CheckCircle2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">Your schedule is clear.</h3>
                                    <p className="text-gray-500">Take a moment for yourself, or review pending clinical notes.</p>
                                </Card>
                            ) : (
                                <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                                    {todayBookings.map((session, index) => {
                                        const isNext = index === 0;
                                        return (
                                            <div key={session.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-indigo-100 text-indigo-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                                                    <Video className="w-4 h-4" />
                                                </div>
                                                
                                                <Card className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-5 transition-all ${isNext ? 'border-indigo-300 shadow-md bg-indigo-50/30' : 'hover:border-gray-300'}`}>
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <Clock className="w-3.5 h-3.5 text-gray-400" />
                                                                <span className="text-xs font-bold text-gray-500">
                                                                    {(() => {
                                                                        const start = session.scheduledStartTime?.toDate ? session.scheduledStartTime.toDate() : new Date(session.scheduledStartTime);
                                                                        return `${format(start, 'h:mm a')} (${session.sessionDurationMins || 50}m)`;
                                                                    })()}
                                                                </span>
                                                            </div>
                                                            <h4 className="font-bold text-gray-900 text-lg">{session.patientName}</h4>
                                                        </div>
                                                        <Badge variant={isNext ? 'success' : 'secondary'}>{isNext ? 'Next Up' : 'Scheduled'}</Badge>
                                                    </div>
                                                    
                                                    {session.reason && (
                                                        <div className="bg-white rounded-lg p-3 mb-4 border border-gray-100">
                                                            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Patient Reason</p>
                                                            <p className="text-sm text-gray-700 truncate">{session.reason}</p>
                                                        </div>
                                                    )}

                                                    <div className="flex gap-2 mt-auto">
                                                        <Button variant={isNext ? 'primary' : 'outline'} className="flex-1 text-xs py-2" onClick={() => window.location.href=`/session/${session.id}`}>
                                                            {isNext ? 'Enter Workspace' : 'Review Chart'}
                                                        </Button>
                                                        <Button variant="secondary" className="px-3 py-2">
                                                            <MessageSquare className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </Card>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Right Column: Upcoming Circles & Announcements */}
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 mb-4">Healing Circles</h2>
                                <Card className="bg-gradient-to-br from-indigo-900 to-purple-900 border-none text-white overflow-hidden relative">
                                    <div className="absolute top-0 right-0 p-4 opacity-10">
                                        <Users className="w-24 h-24" />
                                    </div>
                                    <div className="relative z-10">
                                        <Badge variant="secondary" className="bg-white/20 text-white border-none mb-3">Moderation Due</Badge>
                                        <h3 className="font-bold text-lg mb-1">Navigating Anxiety</h3>
                                        <p className="text-indigo-200 text-sm mb-4">4 members have checked in this week. They are waiting for your clinical response.</p>
                                        <Button variant="secondary" className="w-full bg-white text-indigo-900 border-none hover:bg-gray-100">
                                            Moderate Circle
                                        </Button>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DesktopLayoutWrapper>
    );
}
