import React from 'react';

/**
 * MultiPlatformExpansion.jsx — Multi-Platform Architecture Blueprint (Task 117)
 *
 * Overview of the expansion into Desktop (Electron), Web PWA, 
 * and Smartwatch (WatchOS/WearOS) companion ecosytems.
 */

const MultiPlatformExpansion = () => {
    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1>Ecosystem Expansion</h1>
                <p>SoulThread is moving beyond the app—appearing wherever you need wellness support.</p>
            </div>

            <div style={styles.platformRow}>
                <div style={styles.platformCard}>
                    <div style={styles.icon}>🖥️</div>
                    <h3>Desktop (macOS/Win)</h3>
                    <p style={styles.desc}>Focus-mode integration, deep-breathing reminders in system tray, and E2EE desktop sync.</p>
                    <span style={styles.status}>In Development</span>
                </div>

                <div style={styles.platformCard}>
                    <div style={styles.icon}>⌚</div>
                    <h3>Smartwatch Companion</h3>
                    <p style={styles.desc}>Haptic heart-rate alerts, 1-tap mood check-ins, and emergency crisis SOS.</p>
                    <span style={styles.status}>Beta Testing</span>
                </div>

                <div style={styles.platformCard}>
                    <div style={styles.icon}>🌐</div>
                    <h3>Universal Web PWA</h3>
                    <p style={styles.desc}>High-performance web experience for therapy sessions and resource marketplace.</p>
                    <span style={styles.statusActive}>Production Active</span>
                </div>
            </div>

            <div style={styles.technicalNote}>
                <strong>Unified Sync:</strong> All platforms utilize the <b>Sovereign Data Vault</b> (Task 118) ensuring your wellness history is synchronized via local-first p2p protocols where possible.
            </div>
        </div>
    );
};

const styles = {
    container: { padding: '40px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'system-ui' },
    header: { marginBottom: '40px' },
    platformRow: { display: 'flex', gap: '20px', flexWrap: 'wrap' },
    platformCard: { flex: 1, minWidth: '280px', background: 'var(--color-surface)', padding: '32px', borderRadius: '24px', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' },
    icon: { fontSize: '40px', marginBottom: '20px' },
    desc: { fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: '1.6', marginBottom: '24px' },
    status: { fontSize: '12px', fontWeight: 'bold', color: 'gray', background: 'rgba(0,0,0,0.05)', padding: '4px 12px', borderRadius: '4px' },
    statusActive: { fontSize: '12px', fontWeight: 'bold', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '4px 12px', borderRadius: '4px' },
    technicalNote: { marginTop: '40px', padding: '24px', background: 'var(--color-primary-light)', borderRadius: '16px', fontSize: '14px', lineHeight: '1.5' }
};

export default MultiPlatformExpansion;
