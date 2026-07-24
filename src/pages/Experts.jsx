import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, where, limit, orderBy, doc, addDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { paymentService } from '../services/paymentService';
import { analytics } from '../services/analytics';
import GuideRegistrationModal from '../components/common/GuideRegistrationModal';
import LoginModal from '../components/common/LoginModal';
import DesktopLayoutWrapper from '../components/layout/DesktopLayoutWrapper';
import SEO from '../components/common/SEO';
import Breadcrumbs from '../components/common/Breadcrumbs';
import { Heart, UserPlus, LifeBuoy, Star, Lock, Check, ChevronLeft, Phone, Mail } from 'lucide-react';

import './Experts.css';

const DEFAULT_SESSION_PRICE = 999;
const SESSION_DURATION_MINUTES = 50;
const SLOT_WINDOW_DAYS = 7;

const Experts = () => {
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

    // Email Invite State
    const [inviteEmail, setInviteEmail] = useState('');

    useEffect(() => {
        const psychQ = query(collection(db, 'guides'), where('verified', '==', true), limit(50));
        const unsubscribe = onSnapshot(psychQ, (psychSnapshot) => {
            let merged = [];
            psychSnapshot.docs.forEach(doc => {
                merged.push({
                    ...doc.data(),
                    id: doc.id,
                });
            });
            setPsychologists(merged);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching guides:", error);
            setPsychologists([]);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleBookSession = (guide) => {
        if (!currentUser) {
            setShowLoginModal(true);
            return;
        }
        if (!guide.isCalendarOpen) {
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

    useEffect(() => {
        if (!showBookingModal || !selectedPsychologist?.id) return;

        let cancelled = false;
        const fetchSlots = async () => {
            if (!selectedPsychologist.isCalendarOpen) {
                setAvailableSlots([]);
                setLoadingSlots(false);
                return;
            }
            
            setLoadingSlots(true);
            try {
                const now = new Date();
                const slots = [];
                
                // Fetch existing bookings for this guide
                const bookedQuery = query(
                    collection(db, 'bookings'),
                    where('guideId', '==', selectedPsychologist.id),
                    where('status', 'in', ['pending', 'confirmed'])
                );
                const bookedSnap = await getDocs(bookedQuery);
                const bookedSet = new Set(bookedSnap.docs.map(d => {
                    return `${d.data().date}_${d.data().slot}`;
                }));

                for (let i = 0; i < SLOT_WINDOW_DAYS; i++) {
                    const date = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
                    // Format to "YYYY-MM-DD" in local time for comparison
                    const dateStr = [
                        date.getFullYear(),
                        String(date.getMonth() + 1).padStart(2, '0'),
                        String(date.getDate()).padStart(2, '0')
                    ].join('-');
                    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
                    
                    const daySlots = selectedPsychologist?.availability?.[dayName] || [];
                    
                    daySlots.forEach(slotTimeStr => { // e.g. "09:00 AM"
                        if (!bookedSet.has(`${dateStr}_${slotTimeStr}`)) {
                            // Parse time string back to Date object for the UI
                            const [time, period] = slotTimeStr.split(' ');
                            let [hours, mins] = time.split(':');
                            hours = parseInt(hours, 10);
                            if (period === 'PM' && hours < 12) hours += 12;
                            if (period === 'AM' && hours === 12) hours = 0;
                            
                            const slotDate = new Date(date);
                            slotDate.setHours(hours, parseInt(mins, 10), 0, 0);
                            
                            // Only add if it's in the future
                            if (slotDate > now) {
                                slots.push({
                                    id: `${dateStr}_${slotTimeStr}`,
                                    slotTime: slotDate,
                                    dateStr,
                                    slotStr: slotTimeStr,
                                    durationMinutes: SESSION_DURATION_MINUTES
                                });
                            }
                        }
                    });
                }
                
                slots.sort((a, b) => a.slotTime - b.slotTime);
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

            // Create booking
            const bookingRef = await addDoc(collection(db, 'bookings'), {
                guideId: selectedPsychologist.id,
                guideName: selectedPsychologist.displayName || selectedPsychologist.name,
                guidePhotoURL: selectedPsychologist.photoURL || null,
                userId: currentUser.uid,
                userName: currentUser.displayName || 'Anonymous',
                userPhotoURL: currentUser.photoURL || null,
                date: selectedSlot.dateStr,
                slot: selectedSlot.slotStr,
                durationMinutes: 50,
                sessionRate: selectedPsychologist.sessionRate || 500,
                status: 'pending',
                createdAt: serverTimestamp()
            });

            // Notify the psychologist
            await addDoc(collection(db, 'notifications'), {
                recipientId: selectedPsychologist.id,
                type: 'booking_request',
                title: 'New Session Request',
                message: `${currentUser.displayName || 'Someone'} wants to book a session on ${selectedSlot.dateStr} at ${selectedSlot.slotStr}.`,
                bookingId: bookingRef.id,
                read: false,
                createdAt: serverTimestamp()
            });

            // Notify the user (confirmation)
            await addDoc(collection(db, 'notifications'), {
                recipientId: currentUser.uid,
                type: 'booking_request',
                title: 'Booking Sent ✓',
                message: `Your request to ${selectedPsychologist.name} for ${selectedSlot.dateStr} at ${selectedSlot.slotStr} was sent. They will confirm shortly.`,
                bookingId: bookingRef.id,
                read: false,
                createdAt: serverTimestamp()
            });

            alert('Booking request sent successfully!');
            closeBookingModal();
        } catch (err) {
            console.error('Booking payment failed:', err);
            alert(`Payment could not be completed: ${err.message}`);
            setIsSubmitting(false);
        }
    };

    const handleSendInvite = (e) => {
        e.preventDefault();
        if (!inviteEmail.trim()) return;

        const subject = encodeURIComponent("Invitation to join SoulThread as a verified Guide");
        const body = encodeURIComponent(
            `Hello,\n\nI wanted to invite you to join SoulThread as a verified Guide. SoulThread is an anonymous mental health community connecting people in India with professional support.\n\nYou can apply to join here: https://soulthread.in/experts\n\nBest regards!`
        );

        window.location.href = `mailto:${inviteEmail}?subject=${subject}&body=${body}`;
        setInviteEmail('');
        alert("Opening your email client to send the invitation!");
    };

    const formatSlotDate = (date) => date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    const formatSlotTime = (date) => date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

    const teleManas = {
        name: "Tele-MANAS (Govt of India)",
        contacts: ["14416", "1800-891-4416"],
        hours: "24/7",
        description: "National Tele Mental Health Programme of India offering free, round-the-clock psychological support.",
        badge: "GOVT OF INDIA · FREE"
    };

    const otherHelplines = [
        {
            name: "KIRAN (Ministry of Social Justice)",
            contact: "1800-599-0019",
            hours: "24/7",
            description: "Mental health rehabilitation helpline offering free, confidential support.",
            badge: "GOVT OF INDIA · FREE"
        },
        {
            name: "iCall (TISS)",
            contact: "9152987821",
            hours: "Mon-Sat 10am-8pm",
            description: "Trained professionals providing psychosocial support.",
            badge: null
        },
        {
            name: "Vandrevala Foundation",
            contact: "9999 666 555",
            hours: "24/7",
            description: "Crisis intervention and emotional support by counselors.",
            badge: "24/7 Available"
        },
        {
            name: "AASRA",
            contact: "9820466726",
            hours: "24/7",
            description: "24-hour suicide prevention and emotional support.",
            badge: "24/7 Available"
        }
    ];

    if (loading) return (
        <div className="chat-empty" style={{ height: '60vh' }}>
            <div className="active-indicator" style={{ width: '40px', height: '40px', borderTopColor: 'var(--color-primary)' }} />
            <p>Preparing a calm space for you...</p>
        </div>
    );

    return (
        <DesktopLayoutWrapper>
            <SEO title="Get Support | SoulThread" />
            
            <div className="experts-page">
                <Breadcrumbs />

                {/* Hero Header */}
                <div className="experts-hero animate-fade-in">
                    <div className="experts-hero-accent" />
                    <div className="experts-badge"><LifeBuoy size={14} fill="currentColor" /> Expert Support Directory</div>
                    <h1 className="experts-hero-title">Get Support</h1>
                    <p className="experts-hero-subtitle">
                        Find free, immediate crisis support helplines, or connect with verified psychologists for ongoing guidance.
                    </p>
                </div>

                {/* SECTION 1: Free Helplines */}
                <section className="experts-helplines-section">
                    <div className="urgent-danger-banner">
                        <span className="danger-icon">🚨</span>
                        <span><strong>In immediate danger?</strong> Please call <a href="tel:112">112</a> immediately or go to your nearest emergency room.</span>
                    </div>

                    <div className="experts-section-header">
                        <h2>Free, confidential help — available now</h2>
                        <p>Before anything else: if you're struggling, these trained professionals are one call away. Free and confidential.</p>
                    </div>

                    {/* Tele-MANAS Hero Card */}
                    <div className="tele-manas-hero-card">
                        <div className="hero-card-left">
                            <span className="helpline-badge">{teleManas.badge}</span>
                            <h3>{teleManas.name}</h3>
                            <p>{teleManas.description}</p>
                            <div className="helpline-hours">{teleManas.hours}</div>
                        </div>
                        <div className="hero-card-right">
                            {teleManas.contacts.map((c, idx) => (
                                <a key={idx} href={`tel:${c.replace(/\s+/g, '')}`} className="hero-call-btn">
                                    <Phone size={18} />
                                    <span>Call {c}</span>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Compact Helplines Grid */}
                    <div className="compact-helplines-grid">
                        {otherHelplines.map((h, i) => (
                            <div key={i} className="compact-helpline-card">
                                <div className="compact-card-body">
                                    <div className="compact-card-header">
                                        {h.badge && <span className="compact-badge">{h.badge}</span>}
                                        <span className="compact-hours">{h.hours}</span>
                                    </div>
                                    <h3>{h.name}</h3>
                                    <p>{h.description}</p>
                                </div>
                                <a href={`tel:${h.contact.replace(/\s+/g, '')}`} className="compact-call-btn">
                                    <Phone size={14} />
                                    <span>Call {h.contact}</span>
                                </a>
                            </div>
                        ))}
                    </div>
                </section>

                {/* SECTION 2: Verified Psychologists */}
                <section className="experts-psychologists-section">
                    <div className="experts-section-header">
                        <h2>Prefer ongoing support?</h2>
                        <p>Connect with verified professional guides for one-on-one sessions, confidential guidance, and structured healing.</p>
                    </div>

                    <div className="psych-filters-bar">
                        <h2 className="psych-count">{guides.length} Verified Guides</h2>
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
                                            <div className="psych-initial-avatar" style={{ position: 'absolute', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                {psych.name?.charAt(0)}
                                            </div>
                                            {psych.photoURL && (
                                                <div className="psych-real-avatar" style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', backgroundImage: `url(${psych.photoURL})`, backgroundSize: 'cover', backgroundPosition: 'center', zIndex: 1 }} />
                                            )}
                                            {(psych.isCalendarOpen) && <div className="online-dot-badge" />}
                                        </div>
                                        <div className="psych-info-main">
                                            <h3 className="psych-name">{psych.name}</h3>
                                            <div className="psych-qual" style={{ color: 'var(--color-text-secondary)', fontWeight: 'normal' }}>{psych.specialization || psych.experience || 'Licensed Guide'}</div>
                                            <div style={{ display:'flex', alignItems:'center', gap:'12px', marginTop:'6px', flexWrap:'wrap' }}>
                                                {psych.sessionRate && (
                                                    <span style={{ fontSize:'14px', fontWeight:'700', color:'var(--color-primary)' }}>
                                                    ₹{psych.sessionRate} / 50 min
                                                    </span>
                                                )}
                                                {psych.languages?.length > 0 && (
                                                    <span style={{ fontSize:'12px', color:'var(--color-text-muted)' }}>
                                                    🗣 {psych.languages.join(', ')}
                                                    </span>
                                                )}
                                            </div>
                                            {(psych.ratingCount > 0 || psych.totalRatings > 0) && (
                                                <div className="psych-rating-row">
                                                    <div className="psych-stars" style={{ display: 'flex', gap: '2px', color: '#fbbf24' }}>
                                                        {[...Array(Math.max(1, Math.round(psych.rating || 5)))].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                                                    </div>
                                                    <span className="psych-rating-num">{psych.rating || '5.0'}</span>
                                                    <span className="psych-sessions-count">· {psych.ratingCount || psych.totalRatings || 0} reviews</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <p className="psych-bio-plain" style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '12px', lineHeight: '1.5' }}>
                                        {psych.bio || 'I am here to listen with empathy and without judgment.'}
                                    </p>
                                </div>
                                <div className="psych-card-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span className="session-price-tag" style={{ fontSize: '1rem', fontWeight: 'bold' }}>
                                        ₹{psych.sessionRate || 499}<span style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 500 }}> / 50 min</span>
                                    </span>
                                    <button
                                        className="book-btn-premium"
                                        disabled={!(psych.isCalendarOpen)}
                                        onClick={() => handleBookSession(psych)}
                                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                    >
                                        <Heart size={16} fill="white" /> Book Session
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* SECTION 3: Invite Form */}
                <section className="experts-invite-section">
                    <div className="invite-box">
                        <div className="invite-icon-wrap">
                            <Mail size={32} />
                        </div>
                        <h2>Are you a licensed psychologist?</h2>
                        <p>Or know a professional who should be here? Invite them to join SoulThread. Enter their email address below to send an invitation.</p>
                        
                        <form onSubmit={handleSendInvite} className="invite-form">
                            <input
                                type="email"
                                placeholder="psychologist@example.com"
                                required
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                className="invite-input"
                            />
                            <button type="submit" className="invite-submit-btn">
                                Send Invite
                            </button>
                        </form>
                    </div>
                </section>

            </div>

            {/* Booking Modal (Reused from GuideList.jsx) */}
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
                                {!selectedPsychologist.isCalendarOpen && (
                                    <div style={{ padding: '12px 16px', borderRadius: '10px',
                                        background: '#fef3c7', color: '#92400e',
                                        fontSize: '13px', fontWeight: '500', marginBottom: '12px' }}>
                                        ⏸ This psychologist is currently not accepting new bookings.
                                        Check back later.
                                    </div>
                                )}
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
                                            ₹{selectedPsychologist.sessionRate || 500}
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
                                        ? 'Connecting...'
                                        : <><span>Book Session for ₹{selectedPsychologist.sessionRate || 500}</span> <Check size={18} /></>}
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

export default Experts;
