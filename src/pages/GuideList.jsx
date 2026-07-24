import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, where, limit, orderBy } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { paymentService } from '../services/paymentService';
import { analytics } from '../services/analytics';
import MOCK_PSYCHOLOGISTS from '../data/mockGuides';
import GuideRegistrationModal from '../components/common/GuideRegistrationModal';
import LoginModal from '../components/common/LoginModal';
import DesktopLayoutWrapper from '../components/layout/DesktopLayoutWrapper';
import SEO from '../components/common/SEO';
import Breadcrumbs from '../components/common/Breadcrumbs';
import { Heart, UserPlus, LifeBuoy, Star, Lock, Check, ChevronLeft } from 'lucide-react';

import './GuideList.css';

// Guide docs don't carry a per-guide price field yet — this mirrors the flat
// fee functions/pricing.js:SESSION_FEE charges today. Once guides.sessionPrice
// exists, that value takes over automatically via the `||` fallback below.
const DEFAULT_SESSION_PRICE = 999;
const SESSION_DURATION_MINUTES = 50;
const SLOT_WINDOW_DAYS = 7;

const GuideList = () => {
    const { currentUser } = useAuth();
    const [guides, setPsychologists] = useState([]);
    const [selectedPsychologist, setSelectedPsychologist] = useState(null);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [bookingStep, setBookingStep] = useState('slots'); // 'slots' | 'confirm'
    const [availableSlots, setAvailableSlots] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchPsychologists = async () => {
            try {
                const userQ = query(collection(db, 'users'), where('role', '==', 'guide'), limit(20));
                const userSnapshot = await getDocs(userQ);
                const userPsychs = userSnapshot.docs.reduce((acc, doc) => {
                    acc[doc.id] = { id: doc.id, ...doc.data() };
                    return acc;
                }, {});

                const psychQ = query(collection(db, 'guides'), limit(20));
                const psychSnapshot = await getDocs(psychQ);

                let merged = [];
                psychSnapshot.docs.forEach(doc => {
                    const psychData = doc.data();
                    const profileData = userPsychs[doc.id] || {};
                    merged.push({
                        ...profileData,
                        ...psychData,
                        id: doc.id,
                        email: psychData.email || profileData.email || null,
                        name: psychData.name || profileData.displayName || profileData.name || "A Kind Guide"
                    });
                    delete userPsychs[doc.id];
                });

                Object.values(userPsychs).forEach(user => {
                    // Allow specific accounts or ignore placeholders
                    if (user.displayName === 'Unfiltered Rupesh' || user.id === 'WHEs8Ur2rohjTgNg51VP56KiDwH3') return;
                    merged.push({
                        ...user,
                        name: user.displayName || user.name || "A Sanctuary Guide",
                        isCalendarOpen: user.isCalendarOpen || false
                    });
                });

                // ALWAYS ensure primary mock guides are present if they don't have a live profile yet
                const existingNames = new Set(merged.map(m => m.name.toLowerCase()));
                MOCK_PSYCHOLOGISTS.forEach(m => {
                    if (!existingNames.has(m.name.toLowerCase())) {
                        merged.push(m);
                    }
                });

                setPsychologists(merged);
            } catch (error) {
                console.error("Error fetching guides:", error);
                setPsychologists(MOCK_PSYCHOLOGISTS);
            } finally {
                setLoading(false);
            }
        };

        fetchPsychologists();
    }, []);

    const handleBookSession = (guide) => {
        if (!currentUser) {
            setShowLoginModal(true);
            return;
        }
        if (!guide.isCalendarOpen && !guide.isMock) {
            return alert("This guide is currently recharging. Please check back later today.");
        }
        setSelectedPsychologist(guide);
        setSelectedSlot(null);
        setBookingStep('slots');
        setShowBookingModal(true);
    };

    const closeBookingModal = () => {
        setShowBookingModal(false);
        setSelectedPsychologist(null);
        setSelectedSlot(null);
        setAvailableSlots([]);
        setBookingStep('slots');
    };

    // guides/{guideId}/slots — each doc: { available: boolean, slotTime: Timestamp, durationMinutes?: number }
    useEffect(() => {
        if (!showBookingModal || !selectedPsychologist?.id) return;

        let cancelled = false;
        const fetchSlots = async () => {
            setLoadingSlots(true);
            try {
                const now = new Date();
                const windowEnd = new Date(now.getTime() + SLOT_WINDOW_DAYS * 24 * 60 * 60 * 1000);

                const slotsQ = query(
                    collection(db, 'guides', selectedPsychologist.id, 'slots'),
                    where('available', '==', true),
                    orderBy('slotTime', 'asc'),
                    limit(50)
                );
                const snap = await getDocs(slotsQ);

                const slots = snap.docs
                    .map((docSnap) => {
                        const data = docSnap.data();
                        const slotTime = data.slotTime?.toDate ? data.slotTime.toDate() : new Date(data.slotTime);
                        return {
                            id: docSnap.id,
                            slotTime,
                            durationMinutes: data.durationMinutes || SESSION_DURATION_MINUTES
                        };
                    })
                    .filter((slot) => !isNaN(slot.slotTime?.getTime()) && slot.slotTime >= now && slot.slotTime <= windowEnd);

                if (!cancelled) setAvailableSlots(slots);
            } catch (err) {
                console.error('Error fetching guide slots:', err);
                if (!cancelled) setAvailableSlots([]);
            } finally {
                if (!cancelled) setLoadingSlots(false);
            }
        };

        fetchSlots();
        return () => { cancelled = true; };
    }, [showBookingModal, selectedPsychologist?.id]);

    const handleSelectSlot = (slot) => {
        setSelectedSlot(slot);
        setBookingStep('confirm');
    };

    const handlePay = async () => {
        if (!selectedSlot || isSubmitting) return;

        const amount = selectedPsychologist.sessionPrice || DEFAULT_SESSION_PRICE;

        try {
            setIsSubmitting(true);

            analytics.logEvent('session_checkout_started', { guide_id: selectedPsychologist.id });

            // Redirects the page to Cashfree checkout — on success the browser
            // navigates away to /payment-status, so there's nothing to do here.
            await paymentService.initiatePayment({
                amount,
                orderNote: `Session with ${selectedPsychologist.name}`,
                orderType: 'guide_session',
                metadata: {
                    guideId: selectedPsychologist.id,
                    slotId: selectedSlot.id,
                    slotTime: selectedSlot.slotTime.toISOString()
                }
            });
        } catch (err) {
            console.error('Booking payment failed:', err);
            alert(`Payment could not be completed: ${err.message}`);
            setIsSubmitting(false);
        }
    };

    const formatSlotDate = (date) => date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    const formatSlotTime = (date) => date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

    if (loading) return (
        <div className="chat-empty" style={{ height: '60vh' }}>
            <div className="active-indicator" style={{ width: '40px', height: '40px', borderTopColor: 'var(--color-primary)' }} />
            <p>Preparing a calm space for you...</p>
        </div>
    );

    return (
        <DesktopLayoutWrapper>
            <SEO title="Support Network | SoulThread Sanctuary" />
            
            <div className="psych-list-hero animate-fade-in">
                <div className="psych-hero-accent" />
                <div className="psych-badge"><Heart size={14} fill="currentColor" /> Sanctuary Guides</div>
                <h1 className="psych-hero-title">Talk to a Guide</h1>
                <p className="psych-hero-subtitle">
                    Real, trained professionals ready to listen — confidentially, kindly, and without judgment.
                </p>
                <button onClick={() => setShowRegisterModal(true)} className="premium-btn-link" style={{ background: 'white', color: 'var(--color-primary-dark)', display: 'flex', alignItems: 'center', gap: '8px', border: 'none', cursor: 'pointer' }}>
                    <UserPlus size={18} /> Join as a Guide
                </button>
            </div>

            <div className="psych-grid-container">
                <Breadcrumbs />

                {/* Crisis Section */}
                <div className="crisis-banner">
                    <div className="crisis-header">
                        <span className="crisis-icon-red"><LifeBuoy size={20} /></span>
                        <h3 className="crisis-title">In Crisis? Immediate Help</h3>
                    </div>
                    <div className="crisis-grid">
                        {[
                            { name: 'iCall (TISS)', num: '9152987821', info: 'Mon–Sat, 8am–10pm' },
                            { name: 'Kiran (Govt.)', num: '1800-599-0019', info: '24/7 Free Helpline' },
                            { name: 'NIMHANS', num: '080-4611-0007', info: 'Mon–Sat, 8am–8pm' },
                        ].map(line => (
                            <a key={line.name} href={`tel:${line.num}`} className="crisis-item">
                                <span className="crisis-line-name">{line.name}</span>
                                <span className="crisis-line-num">{line.num}</span>
                                <span className="crisis-line-note">{line.info}</span>
                            </a>
                        ))}
                    </div>
                </div>

                {/* Guide Cards */}
                <div className="psych-filters-bar">
                    <h2 className="psych-count">{guides.length} Guides Available</h2>
                    <div className="psych-live-status">
                        <div className="live-ping" /> Accepting Sessions
                    </div>
                </div>

                <div className="psych-cards-grid">
                    {guides.map(psych => (
                        <div key={psych.id} className="psych-card">
                            <div className="psych-card-body">
                                <div className="psych-profile-row">
                                    <div className="psych-avatar-box">
                                        <div className="psych-initial-avatar">
                                            {psych.name?.charAt(0)}
                                        </div>
                                        {(psych.isCalendarOpen || psych.isMock) && <div className="online-dot-badge" />}
                                    </div>
                                    <div className="psych-info-main">
                                        <h3 className="psych-name">{psych.name}</h3>
                                        <div className="psych-qual">{psych.experience || 'Licensed Guide'}</div>
                                        <div className="psych-rating-row">
                                            <div className="psych-stars" style={{ display: 'flex', gap: '2px', color: '#fbbf24' }}>
                                                {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                                            </div>
                                            <span className="psych-rating-num">{psych.rating || '5.0'}</span>
                                            <span className="psych-sessions-count">· {psych.totalSessions || '50+'} sessions</span>
                                        </div>
                                        <div className="psych-tags">
                                            {(psych.specialties || ['Anxiety', 'Growth', 'Mindset']).slice(0, 3).map(tag => (
                                                <span key={tag} className="psych-tag">{tag}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <p className="psych-bio-quote">
                                    "{psych.bio || 'I am here to listen with empathy and without judgment.'}"
                                </p>
                            </div>
                            <div className="psych-card-footer">
                                <div>
                                    <div className={`psych-availability-status ${(psych.isCalendarOpen || psych.isMock) ? 'status-active' : 'status-inactive'}`}>
                                        <div className="status-ping-small" style={{ background: (psych.isCalendarOpen || psych.isMock) ? '#22c55e' : '#9ca3af' }} />
                                        {(psych.isCalendarOpen || psych.isMock) ? 'Available Now' : 'In Session'}
                                    </div>
                                    <span className="session-price-tag" style={{ fontSize: '1rem' }}>
                                        ₹{psych.sessionPrice || DEFAULT_SESSION_PRICE}<span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}> / session</span>
                                    </span>
                                </div>
                                <button
                                    className="book-btn-premium"
                                    disabled={!(psych.isCalendarOpen || psych.isMock)}
                                    onClick={() => handleBookSession(psych)}
                                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                >
                                    <Heart size={16} fill="white" /> Book Session
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Join CTA */}
                <div className="upsell-section" style={{ marginTop: '60px', borderRadius: 'var(--radius-xl)' }}>
                    <h2 className="upsell-title">Become a Sanctuary Guide</h2>
                    <p className="upsell-text">Join our community of compassionate professionals helping people find peace.</p>
                    <button onClick={() => setShowRegisterModal(true)} className="upsell-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', border: 'none', cursor: 'pointer' }}>
                        Apply as a Guide
                    </button>
                </div>
            </div>

            {/* Booking bottom sheet — step 2 (pick a slot) / step 3 (confirm & pay) */}
            {showBookingModal && selectedPsychologist && (
                <div className="modal-overlay" onClick={closeBookingModal}>
                    <div className="modal-content psych-booking-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-psych-header">
                            {bookingStep === 'confirm' && (
                                <button
                                    onClick={() => setBookingStep('slots')}
                                    aria-label="Back to time slots"
                                    style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', padding: 0, display: 'flex' }}
                                >
                                    <ChevronLeft size={20} />
                                </button>
                            )}
                            {selectedPsychologist.photoURL ? (
                                <img
                                    src={selectedPsychologist.photoURL}
                                    alt={selectedPsychologist.name}
                                    className="modal-psych-avatar"
                                    style={{ objectFit: 'cover' }}
                                />
                            ) : (
                                <div className="modal-psych-avatar">{selectedPsychologist.name?.charAt(0)}</div>
                            )}
                            <h3 className="psych-name">{selectedPsychologist.name}</h3>
                        </div>

                        {bookingStep === 'slots' && (
                            <>
                                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: '16px' }}>
                                    Choose a time in the next {SLOT_WINDOW_DAYS} days
                                </p>
                                {loadingSlots ? (
                                    <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '24px 0' }}>
                                        Loading available times...
                                    </p>
                                ) : availableSlots.length === 0 ? (
                                    <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '24px 0' }}>
                                        No open slots in the next {SLOT_WINDOW_DAYS} days. Please check back later.
                                    </p>
                                ) : (
                                    <div className="slot-select-grid">
                                        {availableSlots.map(slot => (
                                            <div
                                                key={slot.id}
                                                className={`slot-option ${selectedSlot?.id === slot.id ? 'selected' : ''}`}
                                                onClick={() => handleSelectSlot(slot)}
                                            >
                                                <div>{formatSlotDate(slot.slotTime)}</div>
                                                <div>{formatSlotTime(slot.slotTime)}</div>
                                                <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                                                    {slot.durationMinutes} min
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}

                        {bookingStep === 'confirm' && selectedSlot && (
                            <>
                                <div className="booking-summary-box">
                                    <div className="booking-summary-row">
                                        <span>Guide</span>
                                        <span>{selectedPsychologist.name}</span>
                                    </div>
                                    <div className="booking-summary-row">
                                        <span>Time</span>
                                        <span>
                                            {formatSlotDate(selectedSlot.slotTime)} · {formatSlotTime(selectedSlot.slotTime)} · {selectedSlot.durationMinutes} min
                                        </span>
                                    </div>
                                    <div className="booking-summary-row">
                                        <span>Session Fee</span>
                                        <span className="session-price-tag">
                                            ₹{selectedPsychologist.sessionPrice || DEFAULT_SESSION_PRICE}
                                        </span>
                                    </div>
                                    <p className="secure-badge"><Lock size={12} /> Secure Payment via Cashfree</p>
                                </div>
                                <button
                                    className="auth-submit-btn"
                                    disabled={isSubmitting}
                                    onClick={handlePay}
                                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                >
                                    {isSubmitting
                                        ? 'Connecting to Payment...'
                                        : <><span>Pay ₹{selectedPsychologist.sessionPrice || DEFAULT_SESSION_PRICE}</span> <Check size={18} /></>}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}

            {showRegisterModal && <GuideRegistrationModal onClose={() => setShowRegisterModal(false)} />}
            {showLoginModal && <LoginModal isOpen={true} onClose={() => setShowLoginModal(false)} />}
        </DesktopLayoutWrapper>
    );
};

export default GuideList;
