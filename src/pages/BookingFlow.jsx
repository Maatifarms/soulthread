import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { BookingClientService } from '../services/clinical/bookingClientService';
import { useAuth } from '../contexts/AuthContext';
import DesktopLayoutWrapper from '../components/layout/DesktopLayoutWrapper';
import SEO from '../components/common/SEO';
import { Calendar as CalendarIcon, Clock, Video, ShieldCheck, ArrowLeft, CheckCircle2, User, Mail, Phone, FileText } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Spinner } from '../components/common/Spinner';
import { functions } from '../services/firebase';
import { httpsCallable } from 'firebase/functions';

export default function BookingFlow() {
    const { psychologistId } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    
    const [guide, setGuide] = useState(null);
    const [loading, setLoading] = useState(true);
    const [guideFetchError, setGuideFetchError] = useState(null);
    const [step, setStep] = useState(1);
    
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    
    // Guest Details State
    const [guestDetails, setGuestDetails] = useState({
        name: currentUser?.displayName || '',
        email: currentUser?.email || '',
        phone: currentUser?.phoneNumber || '',
        city: '',
        reason: '',
        notes: ''
    });
    const [validationErrors, setValidationErrors] = useState({});

    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [bookingError, setBookingError] = useState('');

    useEffect(() => {
        let cancelled = false;
        const fetchGuide = async () => {
            setLoading(true);
            setGuideFetchError(null);
            try {
                const docRef = doc(db, 'guides', psychologistId);
                const docSnap = await getDoc(docRef);
                if (!cancelled) setGuide(docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null);
            } catch (err) {
                console.error('[BookingFlow] Failed to fetch guide:', err);
                if (!cancelled) setGuideFetchError('Failed to load this guide. Please try again later.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        fetchGuide();
        return () => { cancelled = true; };
    }, [psychologistId]);

    useEffect(() => {
        const fetchSlots = async () => {
            if (!selectedDate || !psychologistId) return;
            setLoadingSlots(true);
            try {
                const targetDateStr = selectedDate.toISOString().split('T')[0];
                const getAvailableSlots = httpsCallable(functions, 'getAvailableSlots');
                const result = await getAvailableSlots({ guideId: psychologistId, targetDate: targetDateStr });
                setAvailableSlots(result.data.slots || []);
            } catch (err) {
                console.error("Failed to fetch slots:", err);
                setAvailableSlots([]);
            } finally {
                setLoadingSlots(false);
            }
        };
        fetchSlots();
    }, [selectedDate, psychologistId]);

    const handleContinueToGuestDetails = () => {
        setStep(2);
    };

    const validateGuestDetails = () => {
        const errors = {};
        if (!guestDetails.name.trim()) errors.name = 'Name is required';
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!guestDetails.email.trim() || !emailRegex.test(guestDetails.email)) {
            errors.email = 'Valid email is required';
        }
        
        // Basic 10-digit mobile validation
        const phoneRegex = /^[0-9]{10}$/;
        if (!guestDetails.phone.trim() || !phoneRegex.test(guestDetails.phone.replace(/[^0-9]/g, ''))) {
            errors.phone = 'Valid 10-digit mobile number is required';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleContinueToReview = () => {
        if (validateGuestDetails()) {
            setStep(3);
        }
    };

    const handlePayment = async () => {
        setIsProcessingPayment(true);
        setBookingError('');
        try {
            // Mocking payment gateway network delay
            await new Promise(res => setTimeout(res, 1500));
            
            // V2: Delegate logic to client service
            await BookingClientService.submitBooking({
                psychologistId,
                guideName: guide.name,
                guidePhotoURL: guide.photoURL,
                currentUser,
                guestDetails,
                selectedDate,
                selectedSlot,
                amountPaid: guide.sessionRate || 1000
            });
            
            navigate(`/booking-success/${psychologistId}`, {
                state: { scheduledSlot: selectedSlot }
            });
        } catch (err) {
            console.error("Payment or booking failed", err);
            setBookingError(err.message || 'An unexpected error occurred. Please try again.');
            setIsProcessingPayment(false);
        }
    };

    if (loading) {
        return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><Spinner size="lg" /></div>;
    }

    if (guideFetchError) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center px-6">
                <p className="text-gray-600 mb-4">{guideFetchError}</p>
                <Button variant="secondary" onClick={() => navigate('/experts')}>Back to Discover</Button>
            </div>
        );
    }

    if (!guide) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center px-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Guide not found</h1>
                <p className="text-gray-500 mb-6">This guide may no longer be available.</p>
                <Button variant="secondary" onClick={() => navigate('/experts')}>Back to Discover</Button>
            </div>
        );
    }

    const dates = Array.from({ length: 5 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i + 1); // Start from tomorrow
        return d;
    });

    return (
        <DesktopLayoutWrapper>
            <SEO title={`Book Session with ${guide.name} | SoulThread`} />
            
            <div className="bg-gray-50 min-h-screen pb-24 pt-8">
                <div className="max-w-5xl mx-auto px-4 sm:px-6">
                    
                    {/* Header */}
                    <div className="flex items-center mb-8">
                        <button onClick={() => {
                            if (step > 1) setStep(step - 1);
                            else navigate(-1);
                        }} className="p-2 hover:bg-gray-200 rounded-full transition-colors mr-4">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {step === 1 && 'Select Date & Time'}
                            {step === 2 && 'Your Details'}
                            {step === 3 && 'Review & Pay'}
                        </h1>
                    </div>

                    {/* Progress Bar */}
                    <div className="flex items-center justify-between mb-8 max-w-2xl">
                        <div className={`flex flex-col items-center ${step >= 1 ? 'text-black' : 'text-gray-400'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mb-2 ${step >= 1 ? 'bg-black text-white' : 'bg-gray-200'}`}>1</div>
                            <span className="text-xs font-semibold uppercase">Schedule</span>
                        </div>
                        <div className={`h-1 flex-1 mx-4 rounded ${step >= 2 ? 'bg-black' : 'bg-gray-200'}`}></div>
                        <div className={`flex flex-col items-center ${step >= 2 ? 'text-black' : 'text-gray-400'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mb-2 ${step >= 2 ? 'bg-black text-white' : 'bg-gray-200'}`}>2</div>
                            <span className="text-xs font-semibold uppercase">Details</span>
                        </div>
                        <div className={`h-1 flex-1 mx-4 rounded ${step >= 3 ? 'bg-black' : 'bg-gray-200'}`}></div>
                        <div className={`flex flex-col items-center ${step >= 3 ? 'text-black' : 'text-gray-400'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mb-2 ${step >= 3 ? 'bg-black text-white' : 'bg-gray-200'}`}>3</div>
                            <span className="text-xs font-semibold uppercase">Payment</span>
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-8">
                        
                        {/* Main Interaction Area */}
                        <div className="flex-1 space-y-6">
                            {step === 1 && (
                                <>
                                    <div className="bg-blue-50 text-blue-800 text-xs font-semibold px-4 py-2 rounded-lg mb-2">
                                        Times shown in your local timezone (IST)
                                    </div>
                                    <Card>
                                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                            <CalendarIcon className="w-5 h-5 mr-2 text-gray-400" /> Choose Date
                                        </h3>
                                        <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
                                            {dates.map((d, i) => (
                                                <button 
                                                    key={i}
                                                    onClick={() => { setSelectedDate(d); setSelectedSlot(null); }}
                                                    className={`shrink-0 w-20 py-3 flex flex-col items-center justify-center rounded-xl border transition-colors ${selectedDate === d ? 'border-black bg-black text-white shadow-md' : 'border-gray-200 bg-white hover:border-gray-400 text-gray-700'}`}
                                                >
                                                    <span className="text-xs uppercase font-medium mb-1">{d.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                                                    <span className="text-xl font-bold">{d.getDate()}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </Card>

                                    <Card className={`transition-opacity ${!selectedDate ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                            <Clock className="w-5 h-5 mr-2 text-gray-400" /> Available Slots
                                        </h3>
                                        
                                        {loadingSlots ? (
                                            <div className="flex items-center justify-center p-8">
                                                <Spinner size="md" />
                                            </div>
                                        ) : availableSlots.length === 0 ? (
                                            <div className="p-6 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                                No available slots on this date.
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                                {availableSlots.map((slot, idx) => {
                                                    const sTime = new Date(slot.start).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                                                    return (
                                                        <button
                                                            key={idx}
                                                            onClick={() => setSelectedSlot(slot)}
                                                            className={`py-3 px-2 text-sm font-medium rounded-xl border transition-all ${selectedSlot === slot ? 'border-black bg-black text-white shadow-md' : 'border-gray-200 bg-white hover:border-black text-gray-700'}`}
                                                        >
                                                            {sTime}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </Card>
                                </>
                            )}

                            {step === 2 && (
                                <Card className="space-y-6">
                                    <h3 className="text-lg font-bold text-gray-900 border-b pb-3">Guest Details</h3>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Required Fields */}
                                        <div className="space-y-1 md:col-span-2">
                                            <label className="text-sm font-medium text-gray-700">Full Name *</label>
                                            <div className="relative">
                                                <User className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                                <input 
                                                    type="text" 
                                                    value={guestDetails.name}
                                                    onChange={e => setGuestDetails({...guestDetails, name: e.target.value})}
                                                    className={`w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-1 focus:ring-black ${validationErrors.name ? 'border-red-500' : 'border-gray-200'}`}
                                                    placeholder="John Doe"
                                                />
                                            </div>
                                            {validationErrors.name && <p className="text-xs text-red-500 mt-1">{validationErrors.name}</p>}
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-sm font-medium text-gray-700">Email Address *</label>
                                            <div className="relative">
                                                <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                                <input 
                                                    type="email" 
                                                    value={guestDetails.email}
                                                    onChange={e => setGuestDetails({...guestDetails, email: e.target.value})}
                                                    className={`w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-1 focus:ring-black ${validationErrors.email ? 'border-red-500' : 'border-gray-200'}`}
                                                    placeholder="john@example.com"
                                                />
                                            </div>
                                            {validationErrors.email && <p className="text-xs text-red-500 mt-1">{validationErrors.email}</p>}
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-sm font-medium text-gray-700">Mobile Number *</label>
                                            <div className="relative">
                                                <Phone className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                                <input 
                                                    type="tel" 
                                                    value={guestDetails.phone}
                                                    onChange={e => setGuestDetails({...guestDetails, phone: e.target.value})}
                                                    className={`w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-1 focus:ring-black ${validationErrors.phone ? 'border-red-500' : 'border-gray-200'}`}
                                                    placeholder="10-digit mobile number"
                                                />
                                            </div>
                                            {validationErrors.phone && <p className="text-xs text-red-500 mt-1">{validationErrors.phone}</p>}
                                        </div>
                                    </div>

                                    <h3 className="text-lg font-bold text-gray-900 border-b pb-3 mt-8">Optional Information</h3>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-1 md:col-span-2">
                                            <label className="text-sm font-medium text-gray-700">Notes for Psychologist</label>
                                            <div className="relative">
                                                <FileText className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                                                <textarea 
                                                    value={guestDetails.notes}
                                                    onChange={e => setGuestDetails({...guestDetails, notes: e.target.value})}
                                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-black min-h-[100px]"
                                                    placeholder="Any specific context you'd like the psychologist to know beforehand?"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            )}

                            {step === 3 && (
                                <Card className="space-y-6">
                                    <div className="flex items-center justify-between border-b pb-3">
                                        <h3 className="text-lg font-bold text-gray-900">Payment Summary</h3>
                                        <span className="text-xs font-bold uppercase tracking-wide text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                                            Test Mode
                                        </span>
                                    </div>

                                    <div className="space-y-4 pt-2">
                                        <div className="flex justify-between items-center text-gray-600">
                                            <span>Session Fee (45 mins)</span>
                                            <span className="text-gray-900 font-medium">₹{guide.sessionRate || 1000}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-gray-600">
                                            <span>Platform Standard Fee</span>
                                            <span className="text-gray-900 font-medium">₹0</span>
                                        </div>
                                        <div className="w-full h-px bg-gray-200 my-2"></div>
                                        <div className="flex justify-between items-center text-xl font-bold text-gray-900">
                                            <span>Total Due</span>
                                            <span>₹{guide.sessionRate || 1000}</span>
                                        </div>
                                    </div>

                                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start mt-8">
                                        <ShieldCheck className="w-5 h-5 text-amber-600 mr-3 mt-0.5 shrink-0" />
                                        <p className="text-sm text-amber-800 leading-relaxed">
                                            This booking runs in test mode — no real payment is charged. You can cancel and receive a full refund up to 24 hours before the session.
                                        </p>
                                    </div>
                                </Card>
                            )}
                        </div>

                        {/* Right Sidebar Summary */}
                        <div className="lg:w-1/3">
                            <Card className="sticky top-24 shadow-sm">
                                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                                    {guide.photoURL ? (
                                        <img src={guide.photoURL} alt={guide.name} className="w-16 h-16 rounded-full object-cover border border-gray-100 shadow-sm" />
                                    ) : (
                                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-xl font-bold text-gray-400 border border-gray-100 shadow-sm">
                                            {guide.name[0]}
                                        </div>
                                    )}
                                    <div>
                                        <h4 className="font-bold text-gray-900">{guide.name}</h4>
                                        <p className="text-xs text-gray-500 font-medium">{guide.title || 'Clinical Psychologist'}</p>
                                    </div>
                                </div>

                                <div className="space-y-5 mb-8">
                                    <div className="flex items-start gap-3">
                                        <Video className="w-5 h-5 text-gray-400 shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Video Consultation</p>
                                            <p className="text-xs text-gray-500">Google Meet / SoulThread Video</p>
                                        </div>
                                    </div>
                                    
                                    {selectedDate && selectedSlot && (
                                        <div className="flex items-start gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                            <CalendarIcon className="w-5 h-5 text-green-500 shrink-0" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                                                <p className="text-xs font-semibold text-green-700">{new Date(selectedSlot.start).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} (IST)</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {step === 1 && (
                                    <Button 
                                        variant="primary"
                                        disabled={!selectedDate || !selectedSlot}
                                        onClick={handleContinueToGuestDetails}
                                        style={{ width: '100%', padding: '16px 0', fontSize: '16px' }}
                                    >
                                        Continue
                                    </Button>
                                )}

                                {step === 2 && (
                                    <Button 
                                        variant="primary"
                                        onClick={handleContinueToReview}
                                        style={{ width: '100%', padding: '16px 0', fontSize: '16px' }}
                                    >
                                        Continue to Payment
                                    </Button>
                                )}

                                {step === 3 && (
                                    <div className="space-y-4">
                                        {bookingError && (
                                            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm font-medium border border-red-200">
                                                {bookingError}
                                            </div>
                                        )}
                                        <Button 
                                            disabled={isProcessingPayment}
                                            onClick={handlePayment}
                                            style={{ width: '100%', padding: '16px 0', fontSize: '16px', backgroundColor: '#16a34a', borderColor: '#16a34a' }}
                                        >
                                            {isProcessingPayment ? <><Spinner size="sm" className="mr-2" /> Processing...</> : `Pay ₹${guide.sessionRate || 1000}`}
                                        </Button>
                                    </div>
                                )}
                            </Card>
                        </div>

                    </div>
                </div>
            </div>
        </DesktopLayoutWrapper>
    );
}
