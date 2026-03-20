import React from 'react';

/**
 * CampusSupportMode.jsx — University Campus Support Mode (Task 92)
 *
 * Dedicated geo-locked UI mapping verified `.edu` domains into 
 * localized campus networks offering direct peer listening programs safely.
 */

const CampusSupportMode = ({ universityName = "Stanford University" }) => {
    return (
        <div style={styles.container}>
            <div style={styles.banner}>
                <div style={styles.bannerContent}>
                    <span style={styles.verifiedBadge}>✓ Verified Campus Network</span>
                    <h1 style={{ margin: '8px 0 0', color: 'white' }}>{universityName} Sanctuary</h1>
                    <p style={{ margin: '8px 0 0', opacity: 0.9 }}>Connect securely with peers, verified listeners, and campus groups.</p>
                </div>
            </div>

            <div style={styles.grid}>
                <div style={styles.card}>
                    <div style={styles.iconBox}>🎧</div>
                    <h3>Campus Peer Listeners</h3>
                    <p style={styles.desc}>Talk anonymously to trained student listeners from your university.</p>
                    <button style={styles.btn}>Find a Listener</button>
                    <div style={styles.onlineStatus}>🟢 12 listeners currently online</div>
                </div>

                <div style={styles.card}>
                    <div style={styles.iconBox}>💬</div>
                    <h3>Campus Support Groups</h3>
                    <div style={styles.groupList}>
                        <div style={styles.groupItem}>
                            <span>Exam Stress Support</span>
                            <span style={styles.members}>142 peers</span>
                        </div>
                        <div style={styles.groupItem}>
                            <span>International Students Network</span>
                            <span style={styles.members}>84 peers</span>
                        </div>
                    </div>
                    <button style={{ ...styles.btn, background: 'transparent', color: 'var(--color-primary)', border: '1px solid var(--color-primary)' }}>View All Groups</button>
                </div>

                <div style={styles.card}>
                    <div style={styles.iconBox}>📅</div>
                    <h3>Campus Wellness Events</h3>
                    <div style={styles.eventItem}>
                        <div style={styles.eventDate}>OCT<br /><b>14</b></div>
                        <div>
                            <div style={{ fontWeight: 'bold', fontSize: '14px' }}>Quad Meditation Session</div>
                            <div style={styles.desc}>Main Campus • 12:00 PM</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: { padding: '24px', maxWidth: '1000px', margin: '0 auto', color: 'var(--color-text-primary)' },
    banner: { background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)', borderRadius: '16px', padding: '40px', color: 'white', marginBottom: '32px', boxShadow: '0 10px 25px rgba(59, 130, 246, 0.2)' },
    bannerContent: { maxWidth: '600px' },
    verifiedBadge: { background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' },
    card: { background: 'var(--color-surface)', padding: '24px', borderRadius: '16px', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' },
    iconBox: { width: '48px', height: '48px', background: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', fontSize: '24px', marginBottom: '16px' },
    desc: { fontSize: '13px', color: 'var(--color-text-secondary)', margin: '8px 0 16px' },
    btn: { width: '100%', padding: '12px', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' },
    onlineStatus: { fontSize: '12px', color: '#10b981', marginTop: '12px', textAlign: 'center', fontWeight: 'bold' },
    groupList: { display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' },
    groupItem: { display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'var(--color-background)', borderRadius: '8px', fontSize: '13px', fontWeight: '500' },
    members: { color: 'var(--color-text-secondary)' },
    eventItem: { display: 'flex', gap: '16px', alignItems: 'center', background: 'var(--color-background)', padding: '12px', borderRadius: '8px' },
    eventDate: { background: 'var(--color-surface)', padding: '8px', borderRadius: '8px', textAlign: 'center', fontSize: '11px', color: 'var(--color-primary)', border: '1px solid var(--color-primary-light)', width: '44px' }
};

export default CampusSupportMode;
