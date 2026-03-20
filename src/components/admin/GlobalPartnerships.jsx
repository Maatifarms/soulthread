import React from 'react';

/**
 * GlobalPartnerships.jsx — Global Wellness Partnerships Platform (Task 96)
 *
 * Dashboard for partner NGOs and Healthcare grids to track campaigns,
 * initiate awareness drives, and measure macro impact funnels.
 */

const GlobalPartnerships = () => {
    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={{ margin: 0 }}>Partner Campaign Dashboard</h1>
                <span style={styles.badge}>WHO Initiative Partner</span>
            </div>

            <div style={styles.statsRow}>
                <div style={styles.statCard}>
                    <div style={styles.statLabel}>Active Campaigns</div>
                    <div style={styles.statValue}>3</div>
                </div>
                <div style={styles.statCard}>
                    <div style={styles.statLabel}>Global Reach</div>
                    <div style={styles.statValue}>2.4M</div>
                </div>
                <div style={styles.statCard}>
                    <div style={styles.statLabel}>Intervention Success</div>
                    <div style={styles.statValue}>84%</div>
                </div>
            </div>

            <div style={styles.campaignTable}>
                <h3>Current Public Wellness Initiatives</h3>
                <div style={styles.tableRow}>
                    <div style={{ flex: 2, fontWeight: 'bold' }}>Men's Mental Health Awareness Month</div>
                    <div style={{ flex: 1 }}>Geo: Global</div>
                    <div style={{ flex: 1, color: '#10b981' }}>Active</div>
                    <button style={styles.actionBtn}>View Metrics</button>
                </div>
                <div style={styles.tableRow}>
                    <div style={{ flex: 2, fontWeight: 'bold' }}>Student Debt Anxiety Support</div>
                    <div style={{ flex: 1 }}>Geo: North America</div>
                    <div style={{ flex: 1, color: '#3b82f6' }}>Drafting</div>
                    <button style={styles.actionBtn}>Edit Campaign</button>
                </div>
            </div>

            <button style={{ ...styles.actionBtn, background: 'var(--color-primary)', color: 'white', border: 'none', padding: '12px 24px', fontSize: '15px' }}>+ Launch New Awareness Campaign</button>
        </div>
    );
};

const styles = {
    container: { padding: '32px', maxWidth: '1000px', margin: '0 auto', background: 'var(--color-background)', color: 'var(--color-text-primary)' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' },
    badge: { background: 'var(--color-primary-light)', color: 'var(--color-primary-dark)', padding: '6px 16px', borderRadius: '20px', fontWeight: 'bold', fontSize: '14px' },
    statsRow: { display: 'flex', gap: '24px', marginBottom: '40px' },
    statCard: { flex: 1, background: 'var(--color-surface)', padding: '24px', borderRadius: '12px', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' },
    statLabel: { fontSize: '13px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' },
    statValue: { fontSize: '36px', fontWeight: 'bold', margin: '8px 0 0', color: 'var(--color-primary)' },
    campaignTable: { background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '24px', marginBottom: '32px' },
    tableRow: { display: 'flex', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid var(--color-border)', fontSize: '14px' },
    actionBtn: { padding: '8px 16px', borderRadius: '6px', background: 'transparent', border: '1px solid var(--color-border)', cursor: 'pointer', fontWeight: 'bold', color: 'var(--color-text-primary)' }
};

export default GlobalPartnerships;
