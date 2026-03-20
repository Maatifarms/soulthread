import React from 'react';

/**
 * PublicHealthInterface.jsx — Public Health Monitoring Interface (Task 105)
 *
 * Dedicated dashboard for global health organizations to monitor
 * anonymized emotional density, regional crises, and publish health campaigns.
 */

const PublicHealthInterface = () => {
    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div style={styles.titleRow}>
                    <h1 style={{ margin: 0 }}>Public Health Sentinel</h1>
                    <span style={styles.liveBadge}>LIVE TELEMETRY</span>
                </div>
                <p style={{ color: 'var(--color-text-secondary)', marginTop: '8px' }}>
                    Aggregated population wellness data for health policy and crisis response.
                </p>
            </div>

            <div style={styles.grid}>
                {/* Regional Hotspots */}
                <div style={styles.card}>
                    <h3>Anxiety Hotspots (Global)</h3>
                    <div style={styles.chartArea}>
                        <div style={styles.list}>
                            <div style={styles.listItem}><span>Southeast Asia</span> <span style={styles.trendUp}>+12.4%</span></div>
                            <div style={styles.listItem}><span>Western Europe</span> <span style={styles.trendDown}>-2.1%</span></div>
                            <div style={styles.listItem}><span>North America</span> <span style={styles.trendNeutral}>0.0%</span></div>
                        </div>
                    </div>
                </div>

                {/* Crisis Signals */}
                <div style={styles.card}>
                    <h3>Crisis Intervention Velocity</h3>
                    <div style={styles.bigValue}>4.2 <span style={{ fontSize: '14px', fontWeight: 'normal' }}>mins / avg resolution</span></div>
                    <p style={{ fontSize: '12px', color: 'gray' }}>Real-time coordination with local emergency services.</p>
                </div>

                {/* Campaign Publishing */}
                <div style={{ ...styles.card, gridColumn: 'span 2' }}>
                    <h3>Publish Regional Wellness Campaign</h3>
                    <div style={styles.form}>
                        <input style={styles.input} placeholder="Campaign Title (e.g. World Mental Health Day)" />
                        <select style={styles.input}>
                            <option>Target Region: Global</option>
                            <option>Target Region: India</option>
                            <option>Target Region: EU</option>
                        </select>
                        <button style={styles.publishBtn}>Deploy to Region</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: { padding: '40px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'system-ui' },
    header: { marginBottom: '40px' },
    titleRow: { display: 'flex', alignItems: 'center', gap: '16px' },
    liveBadge: { background: '#ef4444', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', letterSpacing: '1px' },
    grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' },
    card: { background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '20px', padding: '24px', boxShadow: 'var(--shadow-sm)' },
    list: { marginTop: '16px' },
    listItem: { display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--color-border)' },
    trendUp: { color: '#ef4444', fontWeight: 'bold' },
    trendDown: { color: '#10b981', fontWeight: 'bold' },
    trendNeutral: { color: 'gray' },
    bigValue: { fontSize: '42px', fontWeight: 'bold', color: 'var(--color-primary)', margin: '16px 0' },
    form: { display: 'flex', gap: '12px', marginTop: '16px' },
    input: { flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-background)' },
    publishBtn: { background: 'var(--color-primary)', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }
};

export default PublicHealthInterface;
