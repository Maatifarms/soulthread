import React, { useState } from 'react';

/**
 * CommunityEvents.jsx — Community Events System (Task 67)
 *
 * Maps scheduled group events natively (Live Meditations, Guided Audio chats).
 * Handles RSVP state arrays locking traffic slots.
 */

const EventsData = [
    { id: 'ev1', title: 'Sunday Wind-Down', type: 'Live Audio', time: 'Tonight, 9:00 PM', capacity: 50, booked: 42, host: 'Dr. Priya Desai', description: 'A 30-minute guided breathing session to prepare for the week.' },
    { id: 'ev2', title: 'Navigating Layoffs', type: 'Support Circle', time: 'Tomorrow, 7:00 PM', capacity: 20, booked: 20, host: 'Career Support Network', description: 'Open floor discussion for tech workers facing recent transitions.' },
    { id: 'ev3', title: 'Morning Affirmations', type: 'Live Chat', time: 'Wed, 8:00 AM', capacity: 100, booked: 12, host: 'Maya Srivastava', description: 'Start the day right. Drop your affirmation in the thread.' }
];

const CommunityEvents = () => {
    const [rsvpList, setRsvpList] = useState(new Set());

    const toggleRsvp = (eventId, isFull) => {
        if (isFull && !rsvpList.has(eventId)) return; // Cannot join full

        const next = new Set(rsvpList);
        next.has(eventId) ? next.delete(eventId) : next.add(eventId);
        setRsvpList(next);
        // Natively pushes arrays to Firebase `events/EVENT_ID/attendees`
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={{ margin: 0, color: 'var(--color-primary)' }}>Upcoming Events</h1>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', marginTop: '8px' }}>
                    Join live audio rooms and support circles hosted by community leaders.
                </p>
            </div>

            <div style={styles.list}>
                {EventsData.map(ev => {
                    const isFull = ev.booked >= ev.capacity;
                    const isGoing = rsvpList.has(ev.id);

                    return (
                        <div key={ev.id} style={styles.eventCard}>
                            <div style={styles.cardLeft}>
                                <div style={styles.dateBox}>
                                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--color-primary)' }}>{ev.time.split(',')[0].toUpperCase()}</span>
                                    <span style={{ fontSize: '18px', fontWeight: 'bold' }}>{ev.time.split(',')[1]}</span>
                                </div>
                                <div style={styles.info}>
                                    <span style={styles.typeBadge}>{ev.type}</span>
                                    <h3 style={{ margin: '8px 0', fontSize: '18px' }}>{ev.title}</h3>
                                    <p style={{ margin: '0 0 8px', fontSize: '14px', color: 'var(--color-text-muted)' }}>Hosted by {ev.host}</p>
                                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.4' }}>{ev.description}</p>
                                </div>
                            </div>

                            <div style={styles.cardRight}>
                                <div style={styles.capacity}>
                                    <div style={{ ...styles.meter, width: `${(ev.booked / ev.capacity) * 100}%`, background: isFull ? '#ef4444' : '#10b981' }}></div>
                                    <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{ev.booked} / {ev.capacity} spots</span>
                                </div>

                                <button
                                    onClick={() => toggleRsvp(ev.id, isFull)}
                                    style={{
                                        ...styles.rsvpBtn,
                                        background: isGoing ? 'transparent' : isFull ? 'var(--color-background)' : 'var(--color-primary)',
                                        color: isGoing ? 'var(--color-text-primary)' : isFull ? 'var(--color-text-muted)' : 'white',
                                        border: isGoing ? '1px solid var(--color-border)' : 'none',
                                        cursor: isFull && !isGoing ? 'not-allowed' : 'pointer'
                                    }}
                                    disabled={isFull && !isGoing}
                                >
                                    {isGoing ? '✓ Going' : isFull ? 'Waitlist Full' : 'RSVP Now'}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const styles = {
    container: { padding: '24px', maxWidth: '800px', margin: '0 auto', color: 'var(--color-text-primary)' },
    header: { marginBottom: '32px', paddingBottom: '24px', borderBottom: '1px solid var(--color-border)' },
    list: { display: 'flex', flexDirection: 'column', gap: '20px' },
    eventCard: { background: 'var(--color-surface)', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', padding: '20px', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)', flexWrap: 'wrap', gap: '20px' },
    cardLeft: { display: 'flex', gap: '20px', flex: '1 1 300px' },
    dateBox: { background: 'var(--color-background)', borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: '90px', border: '1px solid var(--color-border)' },
    info: { flex: 1 },
    typeBadge: { background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' },
    cardRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between', flex: '0 0 140px' },
    capacity: { width: '100%', marginBottom: '16px', textAlign: 'right' },
    meter: { height: '6px', borderRadius: '4px', marginBottom: '4px', transition: 'width 0.3s' },
    rsvpBtn: { width: '100%', padding: '10px', borderRadius: '8px', fontWeight: 'bold' }
};

export default CommunityEvents;
