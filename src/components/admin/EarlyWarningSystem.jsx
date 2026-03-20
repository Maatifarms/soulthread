import React from 'react';

/**
 * EarlyWarningSystem.jsx — Global Crisis Early-Warning System (Task 113)
 *
 * Macro monitoring of regional distress signals, anxiety spikes, and
 * crisis surges to alert health agencies proactively.
 */

const EarlyWarningSystem = () => {
    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={{ margin: 0 }}>Global Sentinel Dashboard</h1>
                <p style={{ color: 'var(--color-text-secondary)', marginTop: '8px' }}>
                    Predictive crisis monitoring across 48 global regions.
                </p>
            </div>

            <div style={styles.grid}>
                <div style={styles.card}>
                    <div style={styles.alertHeader}>
                        <span style={styles.alertIcon}>⚠️</span>
                        <h3 style={{ margin: 0 }}>Active Surge Detection</h3>
                    </div>
                    <div style={styles.surgeItem}>
                        <div style={styles.region}>Eastern Europe Cluster</div>
                        <div style={styles.surgeStatus}>+24% Anxiety Surge</div>
                        <div style={styles.confidence}>Confidence: 94%</div>
                    </div>
                    <p style={styles.details}>
                        Signal correlated with recent socio-economic instability. Suggesting regional NGO campaign activation.
                    </p>
                    <button style={styles.actionBtn}>Contact Regional Partners</button>
                </div>

                <div style={styles.card}>
                    <h3>Global Sentiment Drift</h3>
                    <div style={styles.driftChart}>
                        {/* Mock vertical bars showing sentiment change */}
                        {[40, 60, 30, 80, 50].map((h, i) => (
                            <div key={i} style={{ ...styles.bar, height: `${h}px` }}></div>
                        ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'gray' }}>
                        <span>Last Week</span>
                        <span>Today</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: { padding: '40px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'system-ui' },
    header: { marginBottom: '40px' },
    grid: { display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '24px' },
    card: { background: 'var(--color-surface)', padding: '24px', borderRadius: '16px', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' },
    alertHeader: { display: 'flex', alignItems: 'center', gap: '12px', color: '#ef4444', marginBottom: '20px' },
    alertIcon: { fontSize: '24px' },
    surgeItem: { background: 'rgba(239, 68, 68, 0.05)', padding: '16px', borderRadius: '12px', borderLeft: '4px solid #ef4444', marginBottom: '16px' },
    region: { fontWeight: 'bold', fontSize: '14px' },
    surgeStatus: { color: '#ef4444', fontSize: '18px', fontWeight: 'bold', margin: '4px 0' },
    confidence: { fontSize: '11px', color: 'gray' },
    details: { fontSize: '13px', lineHeight: '1.5', color: 'var(--color-text-secondary)' },
    actionBtn: { width: '100%', padding: '12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '16px' },
    driftChart: { display: 'flex', alignItems: 'flex-end', gap: '8px', height: '100px', marginBottom: '8px', borderBottom: '1px solid var(--color-border)' },
    bar: { flex: 1, background: 'var(--color-primary)', borderRadius: '4px 4px 0 0' }
};

export default EarlyWarningSystem;
