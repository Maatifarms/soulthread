import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import DesktopLayoutWrapper from '../components/layout/DesktopLayoutWrapper';
import SEO from '../components/common/SEO';
import { Calendar as CalendarIcon, Video, UserPlus, X, Heart, Mail } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Spinner } from '../components/common/Spinner';
import AvatarImage from '../components/common/AvatarImage';

// Builds a "Add to Google Calendar" link from the actual booked slot — no backend needed.
const buildGoogleCalendarUrl = (guideName, slot) => {
    if (!slot?.start || !slot?.end) return null;
    const toUtcStamp = (iso) => new Date(iso).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: `Session with ${guideName || 'your SoulThread guide'}`,
        dates: `${toUtcStamp(slot.start)}/${toUtcStamp(slot.end)}`,
        details: 'SoulThread video consultation. The session link will be shared before the session.'
    });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

// Builds a plain-text receipt from the actual booking data — no backend/PDF service needed.
const buildReceiptText = ({ bookingId, guestName, guideName, guideTitle, slot, amountPaid }) => {
    const lines = [
        'SoulThread — Booking Receipt',
        '=============================',
        '',
        `Booking ID: ${bookingId || 'N/A'}`,
        `Booked for: ${guestName || 'N/A'}`,
        `Guide: ${guideName || 'N/A'}${guideTitle ? ` (${guideTitle})` : ''}`,
        slot?.start
            ? `Date & Time: ${new Date(slot.start).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at ${new Date(slot.start).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} (IST)`
            : 'Date & Time: See confirmation email',
        `Amount Paid: ₹${amountPaid ?? 'N/A'} (Test Mode — no real payment charged)`,
        '',
        'This is a test-mode receipt. No real payment was processed.'
    ];
    return lines.join('\n');
};

const downloadReceipt = (receiptText, bookingId) => {
    const blob = new Blob([receiptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `soulthread-receipt-${bookingId || 'booking'}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
};

export default function BookingSuccess() {
    const { psychologistId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { currentUser } = useAuth();
    const { scheduledSlot, bookingId, amountPaid, guestName } = location.state || {};
    const [guide, setGuide] = useState(null);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);
    const [showAccountPrompt, setShowAccountPrompt] = useState(!currentUser);

    useEffect(() => {
        let cancelled = false;
        const fetchGuide = async () => {
            setLoading(true);
            setFetchError(null);
            try {
                const docRef = doc(db, 'guides', psychologistId);
                const docSnap = await getDoc(docRef);
                if (!cancelled) setGuide(docSnap.exists() ? docSnap.data() : null);
            } catch (err) {
                console.error('[BookingSuccess] Failed to fetch guide:', err);
                if (!cancelled) setFetchError('Could not load your session details.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        fetchGuide();
        return () => { cancelled = true; };
    }, [psychologistId]);

    const calendarUrl = guide ? buildGoogleCalendarUrl(guide.name, scheduledSlot) : null;

    return (
        <DesktopLayoutWrapper>
            <SEO title="Session Confirmed | SoulThread" />
            
            <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center p-4 py-12">
                <Card premium className="max-w-2xl w-full p-8 md:p-12 text-center relative overflow-hidden">
                    
                    {/* Calming Header */}
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Heart className="w-10 h-10 text-green-600" />
                    </div>

                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">You're all set. We'll be here for you.</h1>
                    <p className="text-gray-500 mb-10 text-lg max-w-md mx-auto">Take a deep breath. Your session has been successfully scheduled and we've emailed you the details.</p>

                    {/* Appointment Summary */}
                    {loading ? (
                        <div className="bg-gray-50/50 border border-gray-200 rounded-2xl p-6 mb-10 flex items-center justify-center">
                            <Spinner size="md" />
                        </div>
                    ) : fetchError ? (
                        <div className="bg-gray-50/50 border border-gray-200 rounded-2xl p-6 mb-10 text-left text-sm text-gray-500">
                            {fetchError} Check your email or the Sessions page for the full details.
                        </div>
                    ) : guide ? (
                        <div className="bg-gray-50/50 border border-gray-200 rounded-2xl p-6 mb-10 text-left shadow-sm">
                            <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-200">
                                <AvatarImage
                                    src={guide.photoURL}
                                    alt={guide.name}
                                    className="w-14 h-14 rounded-full border border-gray-200 object-cover shadow-sm"
                                    fallback={
                                        <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500 shadow-sm">{guide.name?.[0]}</div>
                                    }
                                />
                                <div>
                                    <p className="font-bold text-gray-900 text-lg">{guide.name}</p>
                                    <p className="text-sm text-gray-500">{guide.title || 'Clinical Psychologist'}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-start gap-3">
                                    <CalendarIcon className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">Date & Time</p>
                                        <p className="text-sm text-gray-600">
                                            {scheduledSlot?.start
                                                ? `${new Date(scheduledSlot.start).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at ${new Date(scheduledSlot.start).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} (IST)`
                                                : 'Check your email or the Sessions page for the exact time'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Video className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">Consultation Mode</p>
                                        <p className="text-sm text-gray-600">Video (Link sent 15 mins prior)</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : null}

                    {/* What Happens Next Timeline */}
                    <div className="mb-10 text-left border-l-2 border-gray-100 ml-3 pl-6 space-y-6">
                        <div className="relative">
                            <div className="absolute -left-[31px] bg-green-500 w-3 h-3 rounded-full ring-4 ring-white"></div>
                            <h4 className="font-semibold text-gray-900 text-sm">Booking Confirmed</h4>
                            <p className="text-xs text-gray-500 mt-1">You will receive a confirmation email shortly.</p>
                        </div>
                        <div className="relative">
                            <div className="absolute -left-[31px] bg-gray-300 w-3 h-3 rounded-full ring-4 ring-white"></div>
                            <h4 className="font-semibold text-gray-900 text-sm">Reminder Before Session</h4>
                            <p className="text-xs text-gray-500 mt-1">We'll send a gentle reminder 24 hours and 15 minutes before.</p>
                        </div>
                        <div className="relative">
                            <div className="absolute -left-[31px] bg-gray-300 w-3 h-3 rounded-full ring-4 ring-white"></div>
                            <h4 className="font-semibold text-gray-900 text-sm">Join Session</h4>
                            <p className="text-xs text-gray-500 mt-1">Click the secure link in your email to join the video call.</p>
                        </div>
                    </div>

                    {/* Preparation Guidance */}
                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mb-8 text-left">
                        <h4 className="font-semibold text-blue-900 mb-3 text-sm uppercase tracking-wider">How to prepare</h4>
                        <ul className="text-sm text-blue-800 space-y-2 list-disc list-inside">
                            <li>Find a quiet, private space where you feel comfortable.</li>
                            <li>Join 5 minutes early to test your internet connection.</li>
                            <li>Keep a glass of water nearby.</li>
                            <li>There's no pressure—just bring yourself as you are.</li>
                        </ul>
                    </div>


                    {/* Quick Actions */}
                    <div className="space-y-4 mb-10">
                        {calendarUrl && (
                            <Button
                                variant="primary"
                                style={{ width: '100%' }}
                                onClick={() => window.open(calendarUrl, '_blank', 'noopener,noreferrer')}
                            >
                                Add to Google Calendar
                            </Button>
                        )}
                        {guide && (
                            <Button
                                variant="outline"
                                style={{ width: '100%' }}
                                onClick={() => downloadReceipt(
                                    buildReceiptText({
                                        bookingId,
                                        guestName,
                                        guideName: guide.name,
                                        guideTitle: guide.title,
                                        slot: scheduledSlot,
                                        amountPaid
                                    }),
                                    bookingId
                                )}
                            >
                                Download Receipt
                            </Button>
                        )}
                        <Button variant="secondary" onClick={() => navigate(currentUser ? '/' : '/experts')} style={{ width: '100%' }}>
                            {currentUser ? 'Go to Dashboard' : 'Explore Community'}
                        </Button>
                    </div>
                    
                    {/* Guest Account Prompt */}
                    {showAccountPrompt && (
                        <div className="bg-gray-900 rounded-2xl p-6 text-left relative text-white">
                            <button onClick={() => setShowAccountPrompt(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center">
                                    <UserPlus className="w-5 h-5 text-gray-300" />
                                </div>
                                <h3 className="text-lg font-bold">Continue your healing journey</h3>
                            </div>
                            <p className="text-sm text-gray-300 mb-5 leading-relaxed pr-6">
                                Create a free SoulThread account to track this appointment, access your clinical notes, and manage future bookings seamlessly.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <button onClick={() => navigate('/signup')} className="flex-1 py-3 bg-white text-black rounded-xl font-bold hover:bg-gray-100 transition-colors text-center">
                                    Create Free Account
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Support Block */}
                    <div className="mt-12 pt-8 border-t border-gray-100 text-center">
                        <p className="text-sm text-gray-500 mb-2">Need to reschedule or ask a question?</p>
                        <div className="flex justify-center gap-6">
                            <a href="mailto:support@soulthread.in" className="flex items-center text-sm font-medium text-gray-900 hover:text-blue-600">
                                <Mail className="w-4 h-4 mr-1.5" /> Contact Support
                            </a>
                        </div>
                    </div>

                </Card>
            </div>
        </DesktopLayoutWrapper>
    );
}
