import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, setDoc, serverTimestamp, collection, query, where, getDocs, orderBy, limit, addDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const AVAILABLE_TIMES = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM',
    '05:00 PM', '06:00 PM', '07:00 PM'
];

const GuideDashboard = () => {
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [isCounselor, setIsCounselor] = useState(false);
    const [availability, setAvailability] = useState([]); // [{ day: 'Monday', slots: [...] }]
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [bio, setBio] = useState('');
    const [experience, setExperience] = useState('');
    const [activeDay, setActiveDay] = useState('Monday');
    const [sessionRate, setSessionRate] = useState(500);
    const [languages, setLanguages] = useState(['English']);
    const [specialization, setSpecialization] = useState('');
    const [bookings, setBookings] = useState([]);
    const [stats, setStats] = useState({
        totalMembers: 0,
        avgAttendance: 0,
        totalCircles: 0
    });

    useEffect(() => {
        if (!currentUser) return;
        fetchCounselorData();
        fetchBookings();
        fetchCounselorMetrics();
    }, [currentUser]);

    const fetchCounselorMetrics = async () => {
        try {
            // 1. Circles Count
            const circlesQuery = query(collection(db, 'circles'), where('counselorId', '==', currentUser.uid));
            const circlesSnap = await getDocs(circlesQuery);
            const circleIds = circlesSnap.docs.map(d => d.id);
            const totalCircles = circlesSnap.size;

            // 2. Total Unique Members
            // Since we limit circles to 15 members, we can fetch circle documents
            let totalMembers = 0;
            circlesSnap.forEach(d => {
                totalMembers += (d.data().memberCount || 0);
            });

            // 3. Attendance Rate from counters
            const sessionsQuery = query(collection(db, 'circle_sessions'), where('circleId', 'in', circleIds.length > 0 ? circleIds : ['none']));
            const sessionsSnap = await getDocs(sessionsQuery);

            let totalRegistered = 0;
            let totalAttended = 0;
            sessionsSnap.forEach(d => {
                const data = d.data();
                totalRegistered += (data.registeredCount || 0);
                totalAttended += (data.attendedCount || 0);
            });

            setStats({
                totalMembers,
                totalCircles,
                avgAttendance: totalRegistered > 0 ? Math.round((totalAttended / totalRegistered) * 100) : 0
            });

        } catch (error) {
            console.error("Metrics Error:", error);
        }
    };

    const fetchCounselorData = async () => {
        setLoading(true);
        try {
            const docRef = doc(db, 'guides', currentUser.uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                setIsCounselor(true);
                const data = docSnap.data();
                setBio(data.bio || '');
                setExperience(data.experience || '');
                setSpecialization(data.specialization || data.experience || '');
                setSessionRate(data.sessionRate || 500);
                setLanguages(data.languages || ['English']);
                setIsCalendarOpen(data.isCalendarOpen || false);
                setAvailability(data.availability || {});
            }
        } catch (error) {
            console.error("Error fetching guide data:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchBookings = async () => {
        try {
            const bRef = collection(db, 'bookings');
            const bQuery = query(
                bRef,
                where('guideId', '==', currentUser.uid),
                orderBy('createdAt', 'desc'),
                limit(50)
            );
            const bSnap = await getDocs(bQuery);
            setBookings(bSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (error) {
            console.error("Error fetching bookings:", error);
        }
    };

    const confirmBooking = async (booking) => {
        try {
            // Update booking status
            await updateDoc(doc(db, 'bookings', booking.id), {
                status: 'confirmed',
                confirmedAt: serverTimestamp()
            });

            // Notify the user
            await addDoc(collection(db, 'notifications'), {
                recipientId: booking.userId,
                type: 'booking_confirmed',
                title: 'Session Confirmed ✓',
                message: `${currentUser.displayName} confirmed your session on ${booking.date} at ${booking.slot}.`,
                bookingId: booking.id,
                read: false,
                createdAt: serverTimestamp()
            });

            // Refresh bookings list
            fetchBookings();
        } catch (err) {
            alert('Could not confirm booking: ' + err.message);
        }
    };

    const cancelBooking = async (booking) => {
        if (!window.confirm('Cancel this session?')) return;
        try {
            await updateDoc(doc(db, 'bookings', booking.id), {
                status: 'cancelled'
            });
            await addDoc(collection(db, 'notifications'), {
                recipientId: booking.userId,
                type: 'booking_cancelled',
                title: 'Session Cancelled',
                message: `Your session with ${currentUser.displayName} on ${booking.date} at ${booking.slot} was cancelled. Please rebook.`,
                bookingId: booking.id,
                read: false,
                createdAt: serverTimestamp()
            });
            fetchBookings();
        } catch (err) {
            alert('Could not cancel: ' + err.message);
        }
    };

    const saveMeetLink = async (bookingId, link) => {
        try {
            await updateDoc(doc(db, 'bookings', bookingId), { meetLink: link });
        } catch (err) {
            console.error('Could not save meet link:', err);
        }
    };

    const markCompleted = async (bookingId) => {
        if (!window.confirm('Mark this session as completed?')) return;
        try {
            await updateDoc(doc(db, 'bookings', bookingId), {
                status: 'completed',
                completedAt: serverTimestamp()
            });
            fetchBookings();
        } catch (err) {
            alert('Could not mark completed: ' + err.message);
        }
    };

    const handleBecomeCounselor = async () => {
        if (!confirm("Activate your Guide profile? This will list you in the 'Find Help' sanctuary.")) return;

        try {
            const freshAvailability = {};
            DAYS.forEach(day => freshAvailability[day] = []);
            await setDoc(doc(db, 'guides', currentUser.uid), {
                id: currentUser.uid,
                name: currentUser.displayName,
                photoURL: currentUser.photoURL,
                email: currentUser.email,
                bio: "Compassionate listener ready to help.",
                specialization: "1 Year",
                sessionRate: 500,
                languages: ['English'],
                isCalendarOpen: false,
                verified: false,
                availability: freshAvailability,
                joinedAt: serverTimestamp()
            });
            setIsCounselor(true);
            alert("Profile created! It is now pending admin approval.");
            fetchCounselorData();
        } catch (error) {
            alert("Activation error: " + error.message);
        }
    };

    const toggleSlot = (time) => {
        setAvailability(prev => {
            const current = prev[activeDay] || [];
            const updated = current.includes(time)
                ? current.filter(t => t !== time)
                : [...current, time];
            return { ...prev, [activeDay]: updated };
        });
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const docRef = doc(db, 'guides', currentUser.uid);
            await updateDoc(docRef, {
                bio,
                specialization,
                sessionRate: Number(sessionRate),
                languages,
                isCalendarOpen,
                availability
            });
            alert("Settings saved successfully! You are now " + (isCalendarOpen ? "available" : "unavailable") + " for bookings.");
        } catch (error) {
            alert("Save error: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const currentDaySlots = availability[activeDay] || [];

    if (loading && !isCounselor) return <div className="container" style={{ textAlign: 'center', marginTop: '100px', color: 'var(--color-primary)' }}>Opening your workspace...</div>;

    if (!isCounselor) {
        return (
            <div className="container" style={{ textAlign: 'center', marginTop: '100px', maxWidth: '500px' }}>
                <div style={{ fontSize: '50px', marginBottom: '20px' }}>🧘‍♀️</div>
                <h2 style={{ color: 'var(--color-primary)' }}>Healing Sanctuary</h2>
                <p style={{ color: 'var(--color-text-secondary)', marginBottom: '30px' }}>
                    Welcome, Guide. Please activate your profile to start accepting sessions and helping others find peace.
                </p>
                <button onClick={handleBecomeCounselor} className="btn-primary" style={{ width: '100%', padding: '15px' }}>
                    Activate Guide Profile
                </button>
            </div>
        );
    }

    return (
        <div className="container" style={{ maxWidth: '1000px', padding: '20px', overflowX: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '30px', borderBottom: '1px solid var(--color-border)', paddingBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                <div style={{ minWidth: '250px' }}>
                    <h1 style={{ color: 'var(--color-primary)', fontSize: '2.5rem', marginBottom: '5px' }}>Guide Dashboard</h1>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem' }}>Manage your sanctuary availability</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: isCalendarOpen ? '#e8f5e9' : '#fff5f5', padding: '10px 20px', borderRadius: '12px', border: `1px solid ${isCalendarOpen ? '#c8e6c9' : '#fed7d7'}` }}>
                        <span style={{ fontWeight: 'bold', color: isCalendarOpen ? '#2e7d32' : '#c62828' }}>
                            {isCalendarOpen ? '● ONLINE' : '○ OFFLINE'}
                        </span>
                        <label style={{ position: 'relative', display: 'inline-block', width: '40px', height: '20px' }}>
                            <input type="checkbox" checked={isCalendarOpen} onChange={e => setIsCalendarOpen(e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }} />
                            <span style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: isCalendarOpen ? 'var(--color-primary)' : '#ccc', transition: '.4s', borderRadius: '20px' }}>
                                <span style={{ position: 'absolute', content: '""', height: '14px', width: '14px', left: isCalendarOpen ? '22px' : '4px', bottom: '3px', backgroundColor: 'white', transition: '.4s', borderRadius: '50%' }}></span>
                            </span>
                        </label>
                    </div>
                </div>
            </div>

            {/* Growth & Analytics Section (R64) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                <div className="card" style={{ padding: '20px', textAlign: 'center', background: 'var(--color-primary-soft)', border: '1px solid var(--color-primary)' }}>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--color-text-secondary)', textTransform: 'uppercase', marginBottom: '8px' }}>Active Members</div>
                    <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--color-primary)' }}>{stats.totalMembers}</div>
                </div>
                <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--color-text-secondary)', textTransform: 'uppercase', marginBottom: '8px' }}>Avg. Attendance</div>
                    <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--color-secondary)' }}>{stats.avgAttendance}%</div>
                </div>
                <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--color-text-secondary)', textTransform: 'uppercase', marginBottom: '8px' }}>Your Circles</div>
                    <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--color-text-primary)' }}>{stats.totalCircles}</div>
                </div>
            </div>

            {/* Bookings Section */}
            {(() => {
                const today = new Date().toISOString().split('T')[0];
                const upcomingSessions = bookings.filter(b => b.status === 'confirmed' && b.date >= today).sort((a, b) => (a.date + a.slot).localeCompare(b.date + b.slot));
                const pendingRequests = bookings.filter(b => b.status === 'pending');
                const pastSessions = bookings.filter(b => b.status === 'completed' || (b.status === 'confirmed' && b.date < today));
                
                const BookingCard = ({ booking, type }) => (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '15px',
                        background: 'white',
                        borderRadius: '12px',
                        border: '1px solid var(--color-border)',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                        marginBottom: '15px'
                    }}>
                        <div>
                            <h4 style={{ margin: '0 0 5px 0', color: 'var(--color-text-primary)' }}>{booking.userName}</h4>
                            <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: '500' }}>
                                {new Date(booking.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                {' • '}₹{booking.sessionRate || sessionRate}
                            </div>
                            <div style={{ display:'flex', gap:'8px', marginTop:'8px' }}>
                                {booking.status === 'pending' && (
                                    <>
                                        <button onClick={() => confirmBooking(booking)}
                                            style={{ padding:'6px 16px', borderRadius:'8px', border:'none',
                                                background:'var(--color-primary)', color:'white',
                                                fontSize:'13px', fontWeight:'600', cursor:'pointer' }}>
                                            Confirm
                                        </button>
                                        <button onClick={() => cancelBooking(booking)}
                                            style={{ padding:'6px 16px', borderRadius:'8px', border:'none',
                                                background:'transparent', color:'var(--color-error)',
                                                border:'1px solid var(--color-error)',
                                                fontSize:'13px', fontWeight:'600', cursor:'pointer' }}>
                                            Cancel
                                        </button>
                                    </>
                                )}
                                {booking.status === 'confirmed' && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <span style={{ fontSize:'12px', color:'var(--color-success)', fontWeight:'600' }}>✓ Confirmed</span>
                                        <input 
                                            type="url" 
                                            placeholder="Paste Google Meet / Zoom link"
                                            defaultValue={booking.meetLink || ''}
                                            onBlur={(e) => saveMeetLink(booking.id, e.target.value)}
                                            style={{ padding: '6px 10px', fontSize: '13px', borderRadius: '6px', border: '1px solid var(--color-border)', width: '220px' }}
                                        />
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button onClick={() => markCompleted(booking.id)}
                                                style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: 'var(--color-surface-soft)', color: 'var(--color-text-primary)', fontSize: '12px', fontWeight: '600', cursor: 'pointer', width: 'fit-content' }}>
                                                Mark Completed
                                            </button>
                                            <a href={`/messages?with=${booking.userId}&name=${encodeURIComponent(booking.userName || 'Patient')}`}
                                                style={{
                                                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                                                    padding: '7px 14px', borderRadius: '8px',
                                                    border: '1.5px solid var(--color-primary)',
                                                    color: 'var(--color-primary)', textDecoration: 'none',
                                                    fontSize: '13px', fontWeight: '600', background: 'transparent'
                                                }}>
                                                💬 Message Patient
                                            </a>
                                        </div>
                                    </div>
                                )}
                                {booking.status === 'completed' && (
                                    <span style={{ fontSize:'12px', color:'var(--color-text-muted)', fontWeight:'600', padding:'6px 0' }}>● Completed</span>
                                )}
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{
                                background: 'var(--color-primary-soft)',
                                color: 'var(--color-primary-dark)',
                                padding: '5px 12px',
                                borderRadius: '8px',
                                fontWeight: 'bold',
                                fontSize: '14px'
                            }}>
                                {booking.slot}
                            </div>
                        </div>
                    </div>
                );

                return (
                    <div className="card" style={{ padding: '25px', marginBottom: '30px' }}>
                        <h3 style={{ color: 'var(--color-primary)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span>🗓️</span> Manage Bookings
                        </h3>
                        {bookings.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '30px', background: 'rgba(0,0,0,0.02)', borderRadius: '12px' }}>
                                <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>No sessions booked yet. Peace takes time.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                {/* Upcoming confirmed sessions */}
                                {upcomingSessions.length > 0 && (
                                    <div style={{ marginBottom: '24px' }}>
                                        <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--color-primary)',
                                            marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            Upcoming Sessions ({upcomingSessions.length})
                                        </h3>
                                        {upcomingSessions.map(booking => (
                                            <BookingCard key={booking.id} booking={booking} type="upcoming" />
                                        ))}
                                    </div>
                                )}

                                {/* Pending requests */}
                                {pendingRequests.length > 0 && (
                                    <div style={{ marginBottom: '24px' }}>
                                        <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#f59e0b',
                                            marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            Pending Requests ({pendingRequests.length})
                                        </h3>
                                        {pendingRequests.map(booking => (
                                            <BookingCard key={booking.id} booking={booking} type="pending" />
                                        ))}
                                    </div>
                                )}

                                {/* Past sessions */}
                                {pastSessions.length > 0 && (
                                    <div style={{ marginBottom: '24px' }}>
                                        <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--color-text-muted)',
                                            marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            Past Sessions ({pastSessions.length})
                                        </h3>
                                        {pastSessions.map(booking => (
                                            <BookingCard key={booking.id} booking={booking} type="past" />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                );
            })()}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
                {/* Left Panel: Profile Info */}
                <div className="card" style={{ padding: '25px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <h3 style={{ color: 'var(--color-primary)' }}>Your Professional Voice</h3>
                    <div>
                        <label style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '8px' }}>PROFESSIONAL BIO</label>
                        <textarea
                            value={bio}
                            onChange={e => setBio(e.target.value)}
                            placeholder="Introduce yourself to those seeking help..."
                            style={{ width: '100%', minHeight: '120px', padding: '12px', borderRadius: '12px', border: '1px solid var(--color-border)', fontSize: '15px' }}
                        />
                    </div>
                    <div>
                        <label style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '8px' }}>EXPERIENCE / SPECIALIZATION</label>
                        <input
                            value={specialization}
                            onChange={e => setSpecialization(e.target.value)}
                            placeholder="e.g. 5+ Years • Trauma Specialist"
                            style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--color-border)', fontSize: '15px' }}
                        />
                    </div>
                    <div>
                        <label style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '8px' }}>SESSION RATE (₹)</label>
                        <input
                            type="number"
                            value={sessionRate}
                            onChange={e => setSessionRate(e.target.value)}
                            placeholder="e.g. 500"
                            style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--color-border)', fontSize: '15px' }}
                        />
                    </div>
                    <div>
                        <label style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '8px' }}>LANGUAGES</label>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {['English', 'Hindi', 'Tamil', 'Telugu', 'Bengali', 'Marathi', 'Gujarati', 'Kannada'].map(lang => (
                                <button key={lang} type="button"
                                    onClick={() => setLanguages(prev =>
                                        prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]
                                    )}
                                    style={{
                                        padding: '6px 14px', borderRadius: '20px', border: '1.5px solid',
                                        borderColor: languages.includes(lang) ? 'var(--color-primary)' : 'var(--color-border)',
                                        background: languages.includes(lang) ? 'var(--color-primary-soft)' : 'transparent',
                                        color: languages.includes(lang) ? 'var(--color-primary)' : 'var(--color-text-muted)',
                                        fontSize: '13px', fontWeight: '500', cursor: 'pointer'
                                    }}>
                                    {lang}
                                </button>
                            ))}
                        </div>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="btn-primary"
                        style={{ width: '100%', marginTop: 'auto', padding: '15px' }}
                    >
                        {loading ? 'Saving...' : 'Update Sanctuary Settings'}
                    </button>
                </div>

                {/* Right Panel: Slot Manager */}
                <div className="card" style={{ padding: '25px' }}>
                    <h3 style={{ color: 'var(--color-primary)', marginBottom: '20px' }}>Weekly Availability</h3>

                    {/* Day Selector */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
                        {DAYS.map(day => (
                            <button
                                key={day}
                                onClick={() => setActiveDay(day)}
                                style={{
                                    padding: '6px 12px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: activeDay === day ? 'var(--color-primary)' : 'rgba(10, 141, 128, 0.05)',
                                    color: activeDay === day ? 'white' : 'var(--color-primary)',
                                    fontSize: '13px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer'
                                }}
                            >
                                {day.substring(0, 3)}
                            </button>
                        ))}
                    </div>

                    <div style={{ background: 'rgba(0,0,0,0.02)', padding: '20px', borderRadius: '16px', border: '1px dashed var(--color-border)' }}>
                        <h4 style={{ margin: '0 0 15px 0', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Slots for {activeDay}</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '10px' }}>
                            {AVAILABLE_TIMES.map(time => (
                                <button
                                    key={time}
                                    onClick={() => toggleSlot(time)}
                                    style={{
                                        padding: '10px 5px',
                                        borderRadius: '10px',
                                        border: currentDaySlots.includes(time) ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                                        background: currentDaySlots.includes(time) ? 'white' : 'transparent',
                                        color: currentDaySlots.includes(time) ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                                        fontSize: '12px',
                                        fontWeight: '700',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {time}
                                </button>
                            ))}
                        </div>
                    </div>

                    <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '15px', fontStyle: 'italic' }}>
                        * These slots will repeat every {activeDay}. Remember to toggle your status to "ONLINE" to appear in the guide list.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default GuideDashboard;
