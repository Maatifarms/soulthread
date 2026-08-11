import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DesktopLayoutWrapper from '../components/layout/DesktopLayoutWrapper';
import SEO from '../components/common/SEO';
import { Calendar, Video, ArrowLeft, Heart, AlertCircle } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/common/Button';
import Loading from '../components/common/Loading';
import AvatarImage from '../components/common/AvatarImage';

export default function SessionDetail() {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    const [booking, setBooking] = useState(undefined); // undefined = loading, null = not found
    const [guide, setGuide] = useState(null);
    const [fetchError, setFetchError] = useState(false);

    const fetchSession = async () => {
        if (!currentUser) return;
        setBooking(undefined);
        setFetchError(false);
        try {
            const snap = await getDoc(doc(db, 'bookings', sessionId));
            // Firestore rules already restrict reads to the owner/guide/admin, but a
            // stale/bookmarked link to someone else's session still needs a clean
            // "not found" rather than a raw permission error reaching the user.
            if (!snap.exists() || snap.data().userId !== currentUser.uid) {
                setBooking(null);
                return;
            }
            const data = { id: snap.id, ...snap.data() };
            setBooking(data);

            if (data.guideId) {
                try {
                    const guideSnap = await getDoc(doc(db, 'guides', data.guideId));
                    setGuide(guideSnap.exists() ? guideSnap.data() : null);
                } catch {
                    setGuide(null);
                }
            }
        } catch (error) {
            console.error('Failed to fetch session', error);
            // A bad/bookmarked bookingId denies at the rules layer (permission-denied) —
            // treat that the same as "not found" rather than a scary generic error;
            // it also avoids confirming to the client whether the doc exists at all.
            if (error.code === 'permission-denied') {
                setBooking(null);
            } else {
                setFetchError(true);
            }
        }
    };

    useEffect(() => {
        fetchSession();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUser, sessionId]);

    if (booking === undefined && !fetchError) return <Loading />;

    if (fetchError) {
        return (
            <DesktopLayoutWrapper>
                <SEO title="Session Details | SoulThread" />
                <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center text-center px-6">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                        <AlertCircle className="w-8 h-8 text-red-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Couldn't load this session</h3>
                    <p className="text-gray-500 mb-6 max-w-sm">Something went wrong. Please try again.</p>
                    <Button variant="primary" onClick={fetchSession} className="px-6 py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-colors">
                        Try Again
                    </Button>
                </div>
            </DesktopLayoutWrapper>
        );
    }

    if (booking === null) {
        return (
            <DesktopLayoutWrapper>
                <SEO title="Session Not Found | SoulThread" />
                <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center text-center px-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Session not found</h1>
                    <p className="text-gray-500 mb-6">This session may no longer exist, or isn't yours to view.</p>
                    <Button variant="secondary" onClick={() => navigate('/sessions')}>Back to My Sessions</Button>
                </div>
            </DesktopLayoutWrapper>
        );
    }

    const startDate = booking.scheduledStartTime?.toDate ? booking.scheduledStartTime.toDate() : new Date(booking.scheduledStartTime);
    const guideName = guide?.name || 'Your Guide';

    return (
        <DesktopLayoutWrapper>
            <SEO title="Session Details | SoulThread" />
            <div className="min-h-screen bg-[#fafafa] pb-24 pt-8">
                <div className="max-w-3xl mx-auto px-4">

                    <button onClick={() => navigate('/sessions')} className="flex items-center text-gray-500 hover:text-black mb-8 transition-colors font-medium">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to My Sessions
                    </button>

                    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                        <div className="flex flex-col items-center text-center mb-8 pb-8 border-b border-gray-50">
                            <AvatarImage
                                src={guide?.photoURL}
                                alt={guideName}
                                className="w-16 h-16 rounded-full object-cover border border-gray-100 mb-4"
                                fallback={
                                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                                        <Heart className="w-8 h-8 text-blue-400" />
                                    </div>
                                }
                            />
                            <h1 className="text-2xl font-bold text-gray-900 mb-1">Session with {guideName}</h1>
                            <p className="text-gray-500 text-sm max-w-md mx-auto">
                                Take a deep breath. You're exactly where you need to be.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                            <div className="bg-gray-50 rounded-2xl p-5 flex items-start gap-4">
                                <Calendar className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-sm font-bold text-gray-900 mb-1">
                                        {startDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                                    </p>
                                    <p className="text-sm text-gray-600">{startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} (IST)</p>
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

                        <div className="text-center mb-8 px-4">
                            <p className="text-sm text-gray-500">
                                The secure waiting room will open <strong className="text-gray-900">5 minutes</strong> before your session begins. Arrive early to settle in.
                            </p>
                        </div>

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
