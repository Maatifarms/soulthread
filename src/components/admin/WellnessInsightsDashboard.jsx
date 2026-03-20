import React, { useState } from 'react';

/**
 * WellnessInsightsDashboard.jsx — Global Wellness Insights Dashboard (Task 87)
 *
 * Administrator tool. Computes ONLY anonymized aggregates stripped of PII.
 * Identifies macro-trends (e.g. general anxiety spiking in a region).
 */

const WellnessInsightsDashboard = () => {
    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={{ margin: 0, color: '#f8fafc' }}>Macro Wellness Radar</h1>
                <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '4px' }}>
                    Aggregated, strictly anonymized telemetry indicating global emotional trends.
                </p>
            </div>

            <div style={styles.grid}>
                {/* 1. Global Sentiment Slope */}
                <div style={styles.card}>
                    <h3 style={styles.cardTitle}>Global Mood Trajectory (7D)</h3>
                    <div style={styles.bigNumber}>-4.2%</div>
                    <p style={{ color: '#ef4444', fontSize: '12px' }}>Trending slightly towards baseline anxiety today.</p>

                    <div style={styles.chartMockup}>
                        {/* CSS Bar Chart Simulation */}
                        <div style={{ ...styles.bar, height: '40%' }}></div>
                        <div style={{ ...styles.bar, height: '35%' }}></div>
                        <div style={{ ...styles.bar, height: '50%' }}></div>
                        <div style={{ ...styles.bar, height: '20%' }}></div>
                        <div style={{ ...styles.bar, height: '45%' }}></div>
                        <div style={{ ...styles.bar, height: '60%' }}></div>
                        <div style={{ ...styles.bar, height: '25%' }}></div>
                    </div>
                </div>

                {/* 2. Most Queried Topics */}
                <div style={styles.card}>
                    <h3 style={styles.cardTitle}>Trending Support Subjects</h3>
                    <ul style={styles.list}>
                        <li style={styles.listItem}>
                            <span>Workplace Burnout</span>
                            <span style={styles.upTrend}>↑ 24%</span>
                        </li>
                        <li style={styles.listItem}>
                            <span>Separation Anxiety</span>
                            <span style={styles.upTrend}>↑ 12%</span>
                        </li>
                        <li style={styles.listItem}>
                            <span>Imposter Syndrome</span>
                            <span style={{ color: '#94a3b8' }}>- 2%</span>
                        </li>
                    </ul>
                </div>

                {/* 3. Safety Net Engagements */}
                <div style={styles.card}>
                    <h3 style={styles.cardTitle}>Crisis Inteventions Deployed</h3>
                    <div style={styles.bigNumber}>142</div>
                    <p style={{ color: '#10b981', fontSize: '12px' }}>AI Safety Net triggers manually resolving user intents.</p>
                </div>

                {/* 4. Support Group Metrics */}
                <div style={styles.card}>
                    <h3 style={styles.cardTitle}>Community Group Density</h3>
                    <p style={{ color: '#e2e8f0', fontSize: '14px', fontWeight: 'bold' }}>Most Active Hours (UTC)</p>
                    <div style={styles.heatmapMock}>
                        <div style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '10px', fontSize: '11px' }}>00:00</div>
                        <div style={{ background: 'rgba(59, 130, 246, 0.8)', padding: '10px', fontSize: '11px' }}>18:00</div>
                        <div style={{ background: 'rgba(59, 130, 246, 0.5)', padding: '10px', fontSize: '11px' }}>12:00</div>
                        <div style={{ background: 'rgba(59, 130, 246, 0.9)', padding: '10px', fontSize: '11px' }}>21:00</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: { padding: '24px', background: '#0f172a', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' },
    header: { marginBottom: '32px', borderBottom: '1px solid #334155', paddingBottom: '24px' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' },
    card: { background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.5)' },
    cardTitle: { margin: '0 0 16px', fontSize: '14px', color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '1px' },
    bigNumber: { fontSize: '48px', fontWeight: 'bold', color: '#f8fafc', margin: '0 0 8px' },
    chartMockup: { display: 'flex', alignItems: 'flex-end', gap: '8px', height: '100px', marginTop: '24px', borderBottom: '1px solid #334155', paddingBottom: '8px' },
    bar: { flex: 1, background: '#3b82f6', borderRadius: '4px 4px 0 0' },
    list: { listStyle: 'none', padding: 0, margin: 0 },
    listItem: { display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #334155', color: '#f8fafc', fontSize: '15px' },
    upTrend: { color: '#fbbf24', fontWeight: 'bold' },
    heatmapMock: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', marginTop: '16px', color: 'white', textAlign: 'center' }
};

export default WellnessInsightsDashboard;
