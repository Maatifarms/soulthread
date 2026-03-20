import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, query, limit, getDocs } from 'firebase/firestore';

/**
 * SupportGroups.jsx — Group Support Spaces (Task 62)
 *
 * Dedicated threaded discussion hubs sorted strictly by category.
 * Features AI pre-moderation buffers and pinned health resources.
 */

const SupportGroups = () => {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                // Mocking global groups, this usually queries 'support_spaces'
                const mockGroups = [
                    { id: 'anx_01', title: 'Anxiety & Overthinking', memberCount: 1420, theme: '🌿', description: 'Strategies to ground yourself instantly.' },
                    { id: 'rel_02', title: 'Relationship Support', memberCount: 980, theme: '❤️', description: 'Navigating breakups and boundary setting.' },
                    { id: 'car_03', title: 'Career Burnout Recovery', memberCount: 2200, theme: '💼', description: 'Finding balance and dealing with imposter syndrome.' },
                    { id: 'iso_04', title: 'Navigating Loneliness', memberCount: 310, theme: '🌙', description: 'You are never truly alone. Find your thread.' }
                ];
                setGroups(mockGroups);
            } catch (e) {
                console.error("Failed loading groups", e);
            }
            setLoading(false);
        };
        fetchGroups();
    }, []);

    if (loading) return <div style={{ padding: '32px' }}>Loading Support Spaces...</div>;

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={{ margin: 0, color: 'var(--color-primary)' }}>Topic-Based Support Spaces</h1>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', marginTop: '8px' }}>
                    Join a dedicated threaded community curated explicitly for your current season. Monitored securely by AI moderation tools.
                </p>
            </div>

            <div style={styles.grid}>
                {groups.map(g => (
                    <div key={g.id} style={styles.groupCard}>
                        <div style={styles.cardHeader}>
                            <span style={styles.themeIcon}>{g.theme}</span>
                            <span style={styles.memberBadge}>{g.memberCount} Members</span>
                        </div>
                        <h3 style={{ margin: '16px 0 8px', fontSize: '18px' }}>{g.title}</h3>
                        <p style={{ margin: '0 0 16px', fontSize: '14px', color: 'var(--color-text-muted)' }}>{g.description}</p>

                        <div style={styles.buttonGroup}>
                            <button style={styles.joinBtn}>Join Group</button>
                            <button style={styles.resourceBtn}>View Pinned Resources</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const styles = {
    container: { padding: '24px', maxWidth: '1200px', margin: '0 auto', color: 'var(--color-text-primary)' },
    header: { marginBottom: '32px', borderBottom: '1px solid var(--color-border)', paddingBottom: '24px' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' },
    groupCard: { background: 'var(--color-surface)', borderRadius: '16px', padding: '20px', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' },
    cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    themeIcon: { fontSize: '32px' },
    memberBadge: { background: 'rgba(139, 169, 137, 0.1)', color: 'var(--color-primary)', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' },
    buttonGroup: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
    joinBtn: { flex: 1, padding: '10px 16px', borderRadius: '8px', background: 'var(--color-primary)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' },
    resourceBtn: { flex: 1, padding: '10px 16px', borderRadius: '8px', background: 'var(--color-background)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)', cursor: 'pointer', fontSize: '12px' }
};

export default SupportGroups;
