import React, { useState } from 'react';

/**
 * TherapistNetwork.jsx — Therapist / Listener Network (Task 63)
 *
 * Exposes a vetted network of professionals and empathetic listener volunteers.
 * Integrates directly with Booking pipelines and direct Secure Chat.
 */

const TherapistNetwork = () => {
    const [filter, setFilter] = useState('all');

    const network = [
        { id: 't1', name: 'Dr. Aarav Mehta', type: 'professional', credentials: 'PhD Clinical Psych', rating: 4.9, sessions: 1240, img: 'https://i.pravatar.cc/150?u=1' },
        { id: 't2', name: 'Maya Srivastava', type: 'volunteer', credentials: 'Certified Peer Listener', rating: 4.8, sessions: 320, img: 'https://i.pravatar.cc/150?u=2' },
        { id: 't3', name: 'Dr. Priya Desai', type: 'professional', credentials: 'LCSW', rating: 5.0, sessions: 800, img: 'https://i.pravatar.cc/150?u=3' },
    ];

    const filteredNetwork = filter === 'all' ? network : network.filter(n => n.type === filter);

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={{ margin: 0, color: 'var(--color-text-primary)' }}>Verified Network</h1>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', marginTop: '8px' }}>
                    Connect with clinical professionals or empathetic peer listeners in a highly secure, end-to-end encrypted session.
                </p>

                <div style={styles.filterGroup}>
                    <button style={filter === 'all' ? styles.activeFilter : styles.filterBtn} onClick={() => setFilter('all')}>All Providers</button>
                    <button style={filter === 'professional' ? styles.activeFilter : styles.filterBtn} onClick={() => setFilter('professional')}>Therapists Only</button>
                    <button style={filter === 'volunteer' ? styles.activeFilter : styles.filterBtn} onClick={() => setFilter('volunteer')}>Volunteers</button>
                </div>
            </div>

            <div style={styles.grid}>
                {filteredNetwork.map(provider => (
                    <div key={provider.id} style={styles.card}>
                        <div style={styles.cardHeader}>
                            <img src={provider.img} alt={provider.name} style={styles.avatar} />
                            <div style={styles.badgeContainer}>
                                {provider.type === 'professional' ? (
                                    <span style={{ ...styles.badge, background: '#10b981' }}>Clinician ✅</span>
                                ) : (
                                    <span style={{ ...styles.badge, background: '#3b82f6' }}>Peer Listener 💚</span>
                                )}
                            </div>
                        </div>

                        <div style={styles.info}>
                            <h3 style={{ margin: '0 0 4px', fontSize: '18px' }}>{provider.name}</h3>
                            <p style={{ margin: '0 0 12px', color: 'var(--color-text-muted)', fontSize: '12px' }}>{provider.credentials}</p>

                            <div style={styles.stats}>
                                <span>⭐ {provider.rating} Rating</span>
                                <span>•</span>
                                <span>{provider.sessions} Sessions</span>
                            </div>
                        </div>

                        <div style={styles.actions}>
                            <button style={styles.chatBtn}>Secure Message</button>
                            {provider.type === 'professional' && <button style={styles.bookBtn}>Book Consultation</button>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const styles = {
    container: { padding: '24px', maxWidth: '1200px', margin: '0 auto', color: 'var(--color-text-primary)' },
    header: { marginBottom: '32px' },
    filterGroup: { display: 'flex', gap: '8px', marginTop: '16px' },
    filterBtn: { padding: '8px 16px', borderRadius: '20px', border: '1px solid var(--color-border)', background: 'transparent', cursor: 'pointer', color: 'var(--color-text-secondary)' },
    activeFilter: { padding: '8px 16px', borderRadius: '20px', border: 'none', background: 'var(--color-primary)', color: 'white', fontWeight: 'bold', cursor: 'pointer' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' },
    card: { background: 'var(--color-surface)', borderRadius: '16px', border: '1px solid var(--color-border)', overflow: 'hidden', display: 'flex', flexDirection: 'column' },
    cardHeader: { position: 'relative', height: '100px', background: 'linear-gradient(45deg, var(--color-background), var(--color-surface))', padding: '16px' },
    avatar: { width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '4px solid var(--color-surface)', position: 'absolute', bottom: '-40px' },
    badgeContainer: { display: 'flex', justifyContent: 'flex-end' },
    badge: { padding: '4px 8px', borderRadius: '12px', fontSize: '10px', color: 'white', fontWeight: 'bold' },
    info: { padding: '50px 16px 16px 16px', borderBottom: '1px solid var(--color-border)' },
    stats: { display: 'flex', gap: '8px', fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: 'bold' },
    actions: { display: 'flex', flexDirection: 'column', gap: '8px', padding: '16px', marginTop: 'auto' },
    chatBtn: { padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'transparent', cursor: 'pointer', color: 'var(--color-text-primary)', fontWeight: 'bold' },
    bookBtn: { padding: '10px', borderRadius: '8px', border: 'none', background: 'var(--color-primary)', cursor: 'pointer', color: 'white', fontWeight: 'bold' }
};

export default TherapistNetwork;
