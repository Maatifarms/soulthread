import React, { useState } from 'react';

/**
 * EthicsDashboard.jsx — AI Ethics & Safety Governance (Task 102)
 *
 * Transparent auditing of AI decisions, safety board reviews,
 * and high-level governance for automated support interventions.
 */

const EthicsDashboard = () => {
    const [auditLogs] = useState([
        { id: 1, action: 'Suicide Risk Flag', confidence: '0.98', outcome: 'Escalated to Human', timestamp: '2026-03-05 14:20' },
        { id: 2, action: 'Hate Speech Filter', confidence: '0.94', outcome: 'Auto-Hidden', timestamp: '2026-03-05 14:25' },
        { id: 3, action: 'Depression Indicator', confidence: '0.82', outcome: 'Suggested Journey', timestamp: '2026-03-05 14:30' }
    ]);

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={{ margin: 0 }}>AI Ethics & Governance</h1>
                <p style={styles.subtitle}>Transparency reports and algorithmic accountability for the SoulThread Safety AI.</p>
            </div>

            <div style={styles.grid}>
                <div style={styles.card}>
                    <h3>Audit Trail</h3>
                    <div style={styles.table}>
                        {auditLogs.map(log => (
                            <div key={log.id} style={styles.row}>
                                <div style={{ flex: 2 }}><b>{log.action}</b></div>
                                <div style={{ flex: 1 }}>Score: {log.confidence}</div>
                                <div style={{ flex: 1.5, color: 'var(--color-primary)' }}>{log.outcome}</div>
                                <div style={{ flex: 1.5, fontSize: '12px', color: 'gray' }}>{log.timestamp}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={styles.card}>
                    <h3>Governance Metrics</h3>
                    <div style={styles.metricItem}>
                        <span>Human-in-the-loop Rate</span>
                        <span style={styles.value}>100% (High Risk)</span>
                    </div>
                    <div style={styles.metricItem}>
                        <span>False Positive Rate</span>
                        <span style={styles.value}>1.2%</span>
                    </div>
                    <div style={styles.metricItem}>
                        <span>Bias Variance Index</span>
                        <span style={styles.value}>0.04 (Passed)</span>
                    </div>
                    <button style={styles.btn}>Download Transparency Report</button>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: { padding: '32px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'system-ui', color: 'var(--color-text-primary)' },
    header: { marginBottom: '32px', borderBottom: '1px solid var(--color-border)', paddingBottom: '24px' },
    subtitle: { color: 'var(--color-text-secondary)', fontSize: '15px' },
    grid: { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' },
    card: { background: 'var(--color-surface)', borderRadius: '16px', border: '1px solid var(--color-border)', padding: '24px', boxShadow: 'var(--shadow-sm)' },
    table: { display: 'flex', flexDirection: 'column' },
    row: { display: 'flex', padding: '12px 0', borderBottom: '1px solid var(--color-border)', alignItems: 'center', fontSize: '14px' },
    metricItem: { display: 'flex', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid var(--color-border)' },
    value: { fontWeight: 'bold', color: 'var(--color-primary)' },
    btn: { width: '100%', padding: '12px', marginTop: '24px', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }
};

export default EthicsDashboard;
