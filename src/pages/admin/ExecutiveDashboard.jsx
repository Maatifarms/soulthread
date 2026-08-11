import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { Card } from '../../components/common/Card';
import { db } from '../../services/firebase';
import {
    collection, query, where, orderBy, limit,
    getDocs, getCountFromServer
} from 'firebase/firestore';
import { Users, UserCog, Activity, ShieldAlert, AlertTriangle } from 'lucide-react';

// Human-readable labels for the real event types PlatformEvents actually
// publishes (src/services/EventPublisher.js) — the old feed showed invented
// event names ("PAYMENT_RECEIVED" via "Stripe", "JITSI_ROOM_FAILED") that
// don't correspond to anything the app writes.
const EVENT_LABELS = {
    BOOKING_CREATED: 'Booking created',
    SESSION_COMPLETED: 'Session completed',
    JOURNAL_CREATED: 'Journal entry created',
    MOOD_UPDATED: 'Mood log updated',
    CARE_PLAN_UPDATED: 'Care plan updated',
    CARE_PLAN_CREATED: 'Care plan created',
    HOMEWORK_ASSIGNED: 'Homework assigned',
    TASK_COMPLETED: 'Task completed',
    FOLLOWUP_SCHEDULED: 'Follow-up scheduled',
    RESOURCE_SHARED: 'Resource shared',
    CIRCLE_JOINED: 'Circle joined',
    ASSESSMENT_COMPLETED: 'Assessment completed',
    PROFILE_UPDATED: 'Profile updated',
    NOTIFICATION_SENT: 'Notification sent',
};

function timeAgo(date) {
    if (!date) return '';
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
}

export default function ExecutiveDashboard() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [metrics, setMetrics] = useState({ patients: 0, verifiedGuides: 0, completedSessions: 0 });
    const [recentEvents, setRecentEvents] = useState([]);
    const [pendingGuides, setPendingGuides] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        setError(false);
        try {
            const [patientsCount, verifiedGuidesCount, completedSessionsCount, eventsSnap, pendingSnap] = await Promise.all([
                getCountFromServer(collection(db, 'users')),
                getCountFromServer(query(collection(db, 'guides'), where('verified', '==', true))),
                getCountFromServer(query(collection(db, 'bookings'), where('status', '==', 'completed'))),
                getDocs(query(collection(db, 'platform_events'), orderBy('timestamp', 'desc'), limit(8))),
                getDocs(query(collection(db, 'guides'), where('verified', '==', false))),
            ]);

            setMetrics({
                patients: patientsCount.data().count,
                verifiedGuides: verifiedGuidesCount.data().count,
                completedSessions: completedSessionsCount.data().count,
            });
            setRecentEvents(eventsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
            setPendingGuides(pendingSnap.docs.map(d => ({ id: d.id, ...d.data() })));
            setLastUpdated(new Date());
        } catch (err) {
            console.error('Error fetching executive dashboard data:', err);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout>
            <div className="max-w-7xl mx-auto space-y-8">

                <div className="flex justify-between items-end">
                    <div>
                        <h2 className="text-2xl font-black text-white">Executive Dashboard</h2>
                        <p className="text-gray-400 mt-1">Platform metrics and realtime health overview.</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-500">Last updated:</span>
                        <span className="font-bold text-gray-300">
                            {lastUpdated ? lastUpdated.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—'}
                        </span>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-24">
                        <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                    </div>
                ) : error ? (
                    <Card className="bg-[#141419] border-red-500/30 p-8 text-center">
                        <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-3" />
                        <p className="text-gray-300 mb-4">Couldn't load platform metrics. Please try again.</p>
                        <button onClick={fetchData} className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition-colors">
                            Retry
                        </button>
                    </Card>
                ) : (
                <>
                {/* Macro Metrics — real Firestore counts, not estimates */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-[#141419] border-[#22222a] p-5">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-indigo-500/10 rounded-lg"><Users className="w-5 h-5 text-indigo-400" /></div>
                        </div>
                        <h3 className="text-3xl font-black text-white mb-1">{metrics.patients.toLocaleString()}</h3>
                        <p className="text-sm text-gray-400">Registered Patients</p>
                    </Card>

                    <Card className="bg-[#141419] border-[#22222a] p-5">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-blue-500/10 rounded-lg"><UserCog className="w-5 h-5 text-blue-400" /></div>
                        </div>
                        <h3 className="text-3xl font-black text-white mb-1">{metrics.verifiedGuides.toLocaleString()}</h3>
                        <p className="text-sm text-gray-400">Verified Professionals</p>
                    </Card>

                    <Card className="bg-[#141419] border-[#22222a] p-5">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-purple-500/10 rounded-lg"><Activity className="w-5 h-5 text-purple-400" /></div>
                        </div>
                        <h3 className="text-3xl font-black text-white mb-1">{metrics.completedSessions.toLocaleString()}</h3>
                        <p className="text-sm text-gray-400">Sessions Completed</p>
                    </Card>

                    {/* No crisis-escalation tracking exists anywhere in the app today (no
                        collection, no Cloud Function, no client trigger writes one) — the old
                        card showed an invented "14" with false urgency styling. Being honest
                        about the gap rather than hiding it, since this matters on a mental
                        health platform. */}
                    <Card className="bg-[#141419] border-[#22222a] p-5">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-gray-500/10 rounded-lg"><ShieldAlert className="w-5 h-5 text-gray-500" /></div>
                        </div>
                        <h3 className="text-3xl font-black text-gray-500 mb-1">—</h3>
                        <p className="text-sm text-gray-500">Crisis Escalations (not tracked yet)</p>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Platform Health feed — real platform_events writes (SESSION_COMPLETED,
                        HOMEWORK_ASSIGNED today; see EventPublisher.js for the full real list) */}
                    <div className="lg:col-span-2">
                        <Card className="bg-[#141419] border-[#22222a] p-6 min-h-[400px]">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-white">Recent Platform Events</h3>
                                <div className="text-xs text-gray-500 px-3 py-1 bg-[#22222a] rounded-full">platform_events</div>
                            </div>

                            {recentEvents.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 text-center">
                                    <Activity className="w-8 h-8 text-gray-600 mb-3" />
                                    <p className="text-sm text-gray-500">No platform events yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {recentEvents.map(evt => (
                                        <div key={evt.id} className="flex items-start gap-4 p-4 rounded-lg bg-[#0a0a0f] border border-[#22222a]">
                                            <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0"></div>
                                            <div className="flex-1">
                                                <div className="flex justify-between">
                                                    <span className="text-sm font-bold text-gray-200">{EVENT_LABELS[evt.type] || evt.type}</span>
                                                    <span className="text-xs text-gray-500">{timeAgo(evt.timestamp?.toDate?.())}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* Pending Approvals — same real query AdminDashboard.jsx uses
                        (guides where verified==false). Read-only here: the actual
                        approve/reject action lives in the patient app's /admin. */}
                    <div className="space-y-6">
                        <Card className="bg-[#141419] border-[#22222a] p-6">
                            <h3 className="font-bold text-white mb-4">Pending Guide Approvals</h3>
                            {pendingGuides.length === 0 ? (
                                <p className="text-sm text-gray-500">No pending applications.</p>
                            ) : (
                                <div className="space-y-3">
                                    {pendingGuides.slice(0, 5).map(g => (
                                        <div key={g.id} className="flex justify-between items-center p-3 rounded bg-[#0a0a0f] border border-[#22222a]">
                                            <div>
                                                <div className="text-sm font-bold text-gray-200">{g.name || g.displayName || 'Unnamed applicant'}</div>
                                                <div className="text-xs text-gray-500">{g.specialization || 'Not specified'}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <p className="w-full mt-4 text-xs text-gray-500">
                                {pendingGuides.length} pending application{pendingGuides.length === 1 ? '' : 's'} total. Approve/reject in the Admin Dashboard.
                            </p>
                        </Card>
                    </div>

                </div>
                </>
                )}
            </div>
        </AdminLayout>
    );
}
