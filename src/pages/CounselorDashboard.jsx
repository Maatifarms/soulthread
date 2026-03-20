import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, setDoc, serverTimestamp, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const AVAILABLE_TIMES = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM',
    '05:00 PM', '06:00 PM', '07:00 PM'
];

const CounselorDashboard = () => {
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [isCounselor, setIsCounselor] = useState(false);
    const [availability, setAvailability] = useState([]); // [{ day: 'Monday', slots: [...] }]
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [bio, setBio] = useState('');
    const [experience, setExperience] = useState('');
    const [activeDay, setActiveDay] = useState('Monday');
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
            const docRef = doc(db, 'psychologists', currentUser.uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                setIsCounselor(true);
                const data = docSnap.data();
                setBio(data.bio || '');
                setExperience(data.experience || '');
                setIsCalendarOpen(data.isCalendarOpen || false);
                setAvailability(data.availability || []);
            }
        } catch (error) {
            console.error("Error fetching counselor data:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchBookings = async () => {
        try {
            const bRef = collection(db, 'bookings');
            const bQuery = query(
                bRef,
                where('psychologistId', '==', currentUser.uid),
                orderBy('createdAt', 'desc'),
                limit(50)
            );
            const bSnap = await getDocs(bQuery);
            setBookings(bSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (error) {
            console.error("Error fetching bookings:", error);
        }
    };

    const handleBecomeCounselor = async () => {
        if (!confirm("Activate your Counselor profile? This will list you in the 'Find Help' sanctuary.")) return;

        try {
            const freshAvailability = DAYS.map(day => ({ day, slots: [] }));
            await setDoc(doc(db, 'psychologists', currentUser.uid), {
                id: currentUser.uid,
                name: currentUser.displayName,
                photoURL: currentUser.photoURL,
                email: currentUser.email,
                bio: "Compassionate listener ready to help.",
                experience: "1 Year",
                isCalendarOpen: false,
                availability: freshAvailability,
                joinedAt: serverTimestamp()
            });
            setIsCounselor(true);
            fetchCounselorData();
        } catch (error) {
            alert("Activation error: " + error.message);
        }
    };

    const toggleSlot = (time) => {
        setAvailability(prev => {
            const dayData = prev.find(d => d.day === activeDay);
            if (!dayData) {
                return [...prev, { day: activeDay, slots: [time] }];
            }
            const updatedSlots = dayData.slots.includes(time)
                ? dayData.slots.filter(t => t !== time)
                : [...dayData.slots, time];

            return prev.map(d => d.day === activeDay ? { ...d, slots: updatedSlots } : d);
        });
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const docRef = doc(db, 'psychologists', currentUser.uid);
            await updateDoc(docRef, {
                bio,
                experience,
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

    const currentDaySlots = availability.find(d => d.day === activeDay)?.slots || [];

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
                    Activate Counselor Profile
                </button>
            </div>
        );
    }

    return (
        <div className="container" style={{ maxWidth: '1000px', padding: '20px', overflowX: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '30px', borderBottom: '1px solid var(--color-border)', paddingBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                <div style={{ minWidth: '250px' }}>
                    <h1 style={{ color: 'var(--color-primary)', fontSize: '2.5rem', marginBottom: '5px' }}>Counselor Dashboard</h1>
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
            <div className="card" style={{ padding: '25px', marginBottom: '30px' }}>
                <h3 style={{ color: 'var(--color-primary)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span>🗓️</span> Upcoming Sessions
                </h3>
                {bookings.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '30px', background: 'rgba(0,0,0,0.02)', borderRadius: '12px' }}>
                        <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>No sessions booked yet. Peace takes time.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {bookings.map(booking => (
                            <div key={booking.id} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '15px',
                                background: 'white',
                                borderRadius: '12px',
                                border: '1px solid var(--color-border)',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                            }}>
                                <div>
                                    <h4 style={{ margin: '0 0 5px 0', color: 'var(--color-text-primary)' }}>{booking.userName}</h4>
                                    <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: '500' }}>
                                        {new Date(booking.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
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
                                    <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '5px' }}>
                                        {booking.userEmail}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

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
                            value={experience}
                            onChange={e => setExperience(e.target.value)}
                            placeholder="e.g. 5+ Years • Trauma Specialist"
                            style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--color-border)', fontSize: '15px' }}
                        />
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

export default CounselorDashboard;
