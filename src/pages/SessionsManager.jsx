import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DesktopLayoutWrapper from '../components/layout/DesktopLayoutWrapper';
import SEO from '../components/common/SEO';
import { Calendar, Video, AlertCircle } from 'lucide-react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/common/Button';
import Loading from '../components/common/Loading';
import AvatarImage from '../components/common/AvatarImage';

const INACTIVE_STATUSES = ['rejected', 'cancelled_by_user', 'cancelled_by_guide', 'cancelled_by_admin'];

const STATUS_LABEL = {
    requested: { text: 'Awaiting Confirmation', className: 'bg-amber-50 text-amber-700' },
    accepted: { text: 'Confirmed', className: 'bg-green-50 text-green-700' },
    user_checked_in: { text: 'Confirmed', className: 'bg-green-50 text-green-700' },
    guide_checked_in: { text: 'Confirmed', className: 'bg-green-50 text-green-700' },
    in_session: { text: 'In Session', className: 'bg-blue-50 text-blue-700' },
    rejected: { text: 'Declined', className: 'bg-gray-100 text-gray-500' },
    cancelled_by_user: { text: 'Cancelled', className: 'bg-gray-100 text-gray-500' },
    cancelled_by_guide: { text: 'Cancelled', className: 'bg-gray-100 text-gray-500' },
    cancelled_by_admin: { text: 'Cancelled', className: 'bg-gray-100 text-gray-500' },
};

export default function SessionsManager() {
    const { currentUser } = useAuth();
    const [bookings, setBookings] = useState(null); // null = loading
    const [guides, setGuides] = useState({});
    const [fetchError, setFetchError] = useState(false);

    const fetchSessions = async () => {
        if (!currentUser) return;
        setBookings(null);
        setFetchError(false);
        try {
            // Equality-only filter (no orderBy) — never needs a composite index,
            // and a patient's own booking history is small enough to sort client-side.
            const q = query(collection(db, 'bookings'), where('userId', '==', currentUser.uid));
            const snap = await getDocs(q);
            const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            list.sort((a, b) => toDate(b.scheduledStartTime) - toDate(a.scheduledStartTime));
            setBookings(list);

            // bookings only stores guideId, not display info — batch-fetch each
            // unique guide once (same pattern as UpcomingSessionWidget.jsx).
            const uniqueGuideIds = [...new Set(list.map(b => b.guideId).filter(Boolean))];
            const guideEntries = await Promise.all(uniqueGuideIds.map(async (id) => {
                try {
                    const snap = await getDoc(doc(db, 'guides', id));
                    return [id, snap.exists() ? snap.data() : null];
                } catch {
                    return [id, null];
                }
            }));
            setGuides(Object.fromEntries(guideEntries));
        } catch (error) {
            console.error('Failed to fetch sessions', error);
            setFetchError(true);
        }
    };

    useEffect(() => {
        fetchSessions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUser]);

    if (bookings === null && !fetchError) return <Loading />;

    if (fetchError) {
        return (
            <DesktopLayoutWrapper>
                <SEO title="My Sessions | SoulThread" />
                <div className="min-h-screen bg-gray-50 pb-24 pt-6">
                    <div className="max-w-4xl mx-auto px-4">
                        <div className="bg-white rounded-3xl p-12 border border-red-100 shadow-sm flex flex-col items-center justify-center text-center min-h-[300px]">
                            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                                <AlertCircle className="w-8 h-8 text-red-400" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Couldn't load your sessions</h3>
                            <p className="text-gray-500 mb-6 max-w-sm">Something went wrong reaching your session history. Please try again.</p>
                            <Button variant="primary" onClick={fetchSessions} className="px-6 py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-colors shadow-md">
                                Try Again
                            </Button>
                        </div>
                    </div>
                </div>
            </DesktopLayoutWrapper>
        );
    }

    const now = new Date();
    const upcoming = bookings.filter(b => !INACTIVE_STATUSES.includes(b.status) && toDate(b.scheduledStartTime) >= now);
    const past = bookings.filter(b => INACTIVE_STATUSES.includes(b.status) || toDate(b.scheduledStartTime) < now);

    return (
        <DesktopLayoutWrapper>
            <SEO title="My Sessions | SoulThread" />
            <div className="min-h-screen bg-gray-50 pb-24 pt-6">
                <div className="max-w-4xl mx-auto px-4">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">My Sessions</h1>

                    {bookings.length === 0 ? (
                        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center min-h-[400px]">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                <Calendar className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No session history yet</h3>
                            <p className="text-gray-500 mb-6 max-w-sm">When you book sessions with our psychologists, your upcoming and past appointments will appear here.</p>
                            <Link to="/experts" className="px-6 py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-colors shadow-md">
                                Browse Psychologists
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-10">
                            <SessionSection title="Upcoming" bookings={upcoming} guides={guides} emptyText="No upcoming sessions." />
                            <SessionSection title="Past" bookings={past} guides={guides} emptyText="No past sessions yet." />
                        </div>
                    )}
                </div>
            </div>
        </DesktopLayoutWrapper>
    );
}

function toDate(value) {
    if (!value) return new Date(0);
    return value.toDate ? value.toDate() : new Date(value);
}

function SessionSection({ title, bookings, guides, emptyText }) {
    return (
        <div>
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">{title}</h2>
            {bookings.length === 0 ? (
                <p className="text-sm text-gray-400">{emptyText}</p>
            ) : (
                <div className="space-y-4">
                    {bookings.map(b => {
                        const guide = guides[b.guideId];
                        const guideName = guide?.name || 'Your Guide';
                        const startDate = toDate(b.scheduledStartTime);
                        const statusInfo = STATUS_LABEL[b.status] || { text: 'Scheduled', className: 'bg-gray-50 text-gray-700' };
                        return (
                            <Link
                                key={b.id}
                                to={`/session/${b.id}`}
                                className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4"
                            >
                                <AvatarImage
                                    src={guide?.photoURL}
                                    alt={guideName}
                                    className="w-12 h-12 rounded-full object-cover border border-gray-100 shrink-0"
                                    fallback={
                                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-lg font-bold text-gray-400 shrink-0">
                                            {guideName[0]}
                                        </div>
                                    }
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-gray-900 truncate">{guideName}</p>
                                    <p className="text-sm text-gray-500 flex items-center mt-0.5">
                                        <Video className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                                        {startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                                <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider shrink-0 ${statusInfo.className}`}>
                                    {statusInfo.text}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
