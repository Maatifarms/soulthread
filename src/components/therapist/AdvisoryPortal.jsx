import React, { useState } from 'react';

/**
 * AdvisoryPortal.jsx — Professional Advisory Portal (Task 103)
 *
 * Dedicated space for licensed clinicians to review system-generated content,
 * submit expert articles, and authenticate AI therapeutic logic.
 */

const AdvisoryPortal = () => {
    const [submissions] = useState([
        { id: 1, type: 'AI Exercise Review', title: 'Box Breathing for Panic', status: 'Pending Review' },
        { id: 2, type: 'Expert Article', title: 'Neuroplasticity in Trauma', status: 'Approved' }
    ]);

    return (
        <div style={styles.container}>
            <div style={styles.sidebar}>
                <h3 style={{ color: 'var(--color-primary)' }}>Advisory Panel</h3>
                <nav style={styles.nav}>
                    <div style={styles.navItemActive}>Content Review</div>
                    <div style={styles.navItem}>Community Q&A</div>
                    <div style={styles.navItem}>Clinical Guidelines</div>
                </nav>
            </div>

            <div style={styles.content}>
                <h1>Professional Contribution Portal</h1>
                <p>Welcome, Dr. Sarah. Your expertise ensures the clinical safety of the SoulThread ecosystem.</p>

                <div style={styles.grid}>
                    <div style={styles.card}>
                        <h3>Queue for Review</h3>
                        {submissions.map(item => (
                            <div key={item.id} style={styles.item}>
                                <div>
                                    <div style={{ fontSize: '11px', color: 'var(--color-primary)', fontWeight: 'bold' }}>{item.type}</div>
                                    <div style={{ fontWeight: '500' }}>{item.title}</div>
                                </div>
                                <button style={styles.actionBtn}>Evaluate</button>
                            </div>
                        ))}
                    </div>

                    <div style={styles.card}>
                        <h3>Submit New Resource</h3>
                        <p style={{ fontSize: '13px', color: 'gray' }}>Share clinical exercises or validation studies with the community.</p>
                        <button style={styles.primaryBtn}>Create Submission</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: { display: 'flex', height: '100vh', background: 'var(--color-background)', fontFamily: 'system-ui' },
    sidebar: { width: '260px', background: 'var(--color-surface)', borderRight: '1px solid var(--color-border)', padding: '32px' },
    nav: { marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '8px' },
    navItem: { padding: '12px', borderRadius: '8px', cursor: 'pointer', color: 'var(--color-text-secondary)', fontWeight: '500' },
    navItemActive: { padding: '12px', borderRadius: '8px', background: 'var(--color-primary-light)', color: 'var(--color-primary-dark)', fontWeight: 'bold' },
    content: { flex: 1, padding: '48px', overflowY: 'auto' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px', marginTop: '32px' },
    card: { background: 'var(--color-surface)', padding: '24px', borderRadius: '16px', border: '1px solid var(--color-border)' },
    item: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid var(--color-border)' },
    actionBtn: { padding: '6px 16px', borderRadius: '6px', border: '1px solid var(--color-primary)', color: 'var(--color-primary)', background: 'transparent', fontWeight: 'bold', cursor: 'pointer' },
    primaryBtn: { width: '100%', padding: '14px', borderRadius: '10px', background: 'var(--color-primary)', color: 'white', border: 'none', fontWeight: 'bold', cursor: 'pointer', marginTop: '16px' }
};

export default AdvisoryPortal;
