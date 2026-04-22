import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, getDocs, addDoc, serverTimestamp, where, limit } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import MOCK_PSYCHOLOGISTS from '../data/mockPsychologists';
import PsychologistRegistrationModal from '../components/common/PsychologistRegistrationModal';
import LoginModal from '../components/common/LoginModal';
import DesktopLayoutWrapper from '../components/layout/DesktopLayoutWrapper';
import SEO from '../components/common/SEO';
import Breadcrumbs from '../components/common/Breadcrumbs';
import { Heart, UserPlus, LifeBuoy, Star, Lock, Check, ArrowRight } from 'lucide-react';

import './PsychologistList.css';

const PsychologistList = () => {
    const { currentUser } = useAuth();
    const [psychologists, setPsychologists] = useState([]);
    const [selectedPsychologist, setSelectedPsychologist] = useState(null);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchPsychologists = async () => {
            try {
                const userQ = query(collection(db, 'users'), where('role', '==', 'psychologist'), limit(20));
                const userSnapshot = await getDocs(userQ);
                const userPsychs = userSnapshot.docs.reduce((acc, doc) => {
                    acc[doc.id] = { id: doc.id, ...doc.data() };
                    return acc;
                }, {});

                const psychQ = query(collection(db, 'psychologists'), limit(20));
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

                // ALWAYS ensure primary mock counselors are present if they don't have a live profile yet
                const existingNames = new Set(merged.map(m => m.name.toLowerCase()));
                MOCK_PSYCHOLOGISTS.forEach(m => {
                    if (!existingNames.has(m.name.toLowerCase())) {
                        merged.push(m);
                    }
                });

                setPsychologists(merged);
            } catch (error) {
                console.error("Error fetching psychologists:", error);
                setPsychologists(MOCK_PSYCHOLOGISTS);
            } finally {
                setLoading(false);
            }
        };

        fetchPsychologists();
    }, []);

    const handleBookSession = (psychologist) => {
        if (!currentUser) {
            setShowLoginModal(true);
            return;
        }
        if (!psychologist.isCalendarOpen && !psychologist.isMock) {
            return alert("This guide is currently recharging. Please check back later today.");
        }
        setSelectedPsychologist(psychologist);
        setSelectedDate(new Date());
        setShowBookingModal(true);
    };

    const confirmBooking = async () => {
        if (!selectedSlot) return alert("Please select a time that works for you.");
        if (isSubmitting) return;

        const sessionFee = 999; // Base fee for the test phase
        
        try {
            setIsSubmitting(true);
            
            // Phase 2: Secure Payment before confirmation
            const paymentTier = {
                id: 'counselor_session',
                name: `Session with ${selectedPsychologist.name}`,
                price: sessionFee
            };

            const payment = await paymentService.initializeRazorpay(currentUser, paymentTier, sessionFee);
            
            if (payment) {
                await addDoc(collection(db, 'bookings'), {
                    psychologistId: selectedPsychologist.id,
                    psychologistName: selectedPsychologist.name,
                    userId: currentUser.uid,
                    userName: currentUser.displayName || 'Friend',
                    userEmail: currentUser.email,
                    date: selectedDate.toISOString().split('T')[0],
                    slot: selectedSlot,
                    status: 'confirmed',
                    paymentId: payment.razorpay_payment_id,
                    amountPaid: sessionFee,
                    currency: 'INR',
                    platformCommission: Math.floor(sessionFee * 0.2), // 20% commission
                    createdAt: serverTimestamp()
                });

                analytics.logEvent('booking_payment_success', {
                    psychologist_id: selectedPsychologist.id,
                    amount: sessionFee
                });

                alert("Your session is confirmed! Check your email for a gentle reminder.");
                setShowBookingModal(false);
                setSelectedSlot(null);
                setSelectedPsychologist(null);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const getAvailableSlots = () => {
        if (!selectedPsychologist) return [];
        let slots = ['10:00 AM', '12:00 PM', '02:00 PM', '04:00 PM', '06:00 PM'];
        const now = new Date();
        if (selectedDate.toDateString() === now.toDateString()) {
            slots = slots.filter(slot => {
                const [time, period] = slot.split(' ');
                const [hours, minutes] = time.split(':').map(Number);
                let slotHours = hours === 12 ? (period === 'AM' ? 0 : 12) : (period === 'PM' ? hours + 12 : hours);
                const slotTime = new Date();
                slotTime.setHours(slotHours, minutes || 0, 0, 0);
                return slotTime > now;
            });
        }
        return slots;
    };

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
                <h1 className="psych-hero-title">Talk to a Psychologist</h1>
                <p className="psych-hero-subtitle">
                    Real, trained professionals ready to listen — confidentially, kindly, and without judgment.
                </p>
                <Link to="/join-counselor" className="premium-btn-link" style={{ background: 'white', color: 'var(--color-primary-dark)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <UserPlus size={18} /> Join as a Guide
                </Link>
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

                {/* Psychologist Cards */}
                <div className="psych-filters-bar">
                    <h2 className="psych-count">{psychologists.length} Guides Available</h2>
                    <div className="psych-live-status">
                        <div className="live-ping" /> Accepting Sessions
                    </div>
                </div>

                <div className="psych-cards-grid">
                    {psychologists.map(psych => (
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
                                        <div className="psych-qual">{psych.experience || 'Licensed Psychologist'}</div>
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
                                <div className={`psych-availability-status ${(psych.isCalendarOpen || psych.isMock) ? 'status-active' : 'status-inactive'}`}>
                                    <div className="status-ping-small" style={{ background: (psych.isCalendarOpen || psych.isMock) ? '#22c55e' : '#9ca3af' }} />
                                    {(psych.isCalendarOpen || psych.isMock) ? 'Available Now' : 'In Session'}
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
                    <Link to="/join-counselor" className="upsell-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        Apply as a Guide <ArrowRight size={18} />
                    </Link>
                </div>
            </div>

            {/* Modals placeholders for brevity */}
            {showBookingModal && selectedPsychologist && (
                <div className="modal-overlay" onClick={() => setShowBookingModal(false)}>
                    <div className="psych-booking-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-psych-header">
                            <div className="modal-psych-avatar">{selectedPsychologist.name?.charAt(0)}</div>
                            <h3 className="psych-name">Secure a Session</h3>
                        </div>
                        <input 
                            type="date" 
                            className="auth-input" 
                            style={{ marginBottom: '20px' }}
                            value={selectedDate.toISOString().split('T')[0]} 
                            onChange={e => setSelectedDate(new Date(e.target.value))}
                        />
                        <div className="slot-select-grid">
                            {getAvailableSlots().map(slot => (
                                <div 
                                    key={slot} 
                                    className={`slot-option ${selectedSlot === slot ? 'selected' : ''}`}
                                    onClick={() => setSelectedSlot(slot)}
                                >
                                    {slot}
                                </div>
                            ))}
                        </div>
                        <div className="booking-summary-box">
                            <div className="booking-summary-row">
                                <span>Professional Session Fee</span>
                                <span className="session-price-tag">₹999</span>
                            </div>
                            <p className="secure-badge"><Lock size={12} /> Secure Payment via Razorpay</p>
                        </div>
                        <button className="auth-submit-btn" disabled={!selectedSlot} onClick={confirmBooking} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            {isSubmitting ? 'Connecting to Payment...' : <><span style={{ marginRight: '8px' }}>Secure Session</span> <Check size={18} /></>}
                        </button>
                    </div>
                </div>
            )}

            {showRegisterModal && <PsychologistRegistrationModal onClose={() => setShowRegisterModal(false)} />}
            {showLoginModal && <LoginModal isOpen={true} onClose={() => setShowLoginModal(false)} />}
        </DesktopLayoutWrapper>
    );
};

export default PsychologistList;
