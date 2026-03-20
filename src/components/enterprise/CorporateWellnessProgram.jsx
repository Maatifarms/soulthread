import React from 'react';

/**
 * CorporateWellnessProgram.jsx — Corporate Wellness Program (Task 93)
 *
 * Implements employee check-in portals interfacing safely into HR analytics
 * avoiding any exposure of individual distress signals.
 */

const CorporateWellnessProgram = () => {
    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={{ margin: 0 }}>Corporate Wellness Tracker</h1>
                <p style={styles.subtext}>Your emotional check-ins power anonymous team resilience analytics without ever tracking you personally.</p>
            </div>

            <div style={styles.checkInBox}>
                <h3>How is the workday impacting you today?</h3>
                <div style={styles.sliderContainer}>
                    <span>Exhausted</span>
                    <input type="range" min="1" max="10" defaultValue="5" style={styles.slider} />
                    <span>Energized</span>
                </div>

                <div style={styles.tagsBox}>
                    <button style={styles.tag}>Meeting Overload</button>
                    <button style={styles.tag}>Deep Flow</button>
                    <button style={styles.tag}>Imposter Syndrome</button>
                    <button style={{ ...styles.tag, background: 'var(--color-primary)', color: 'white' }}>Connect with Team Support</button>
                </div>
            </div>

            <div style={styles.spaces}>
                <h3>Anonymous Corporate Spaces</h3>
                <div style={styles.spaceCard}>
                    <h4>Engineering Resilience</h4>
                    <p style={styles.subtext}>A safe, untracked space to discuss burnout, sprints, and cognitive load.</p>
                    <button style={styles.outlineBtn}>Enter Space Anonymously</button>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: { padding: '24px', maxWidth: '800px', margin: '0 auto', color: 'var(--color-text-primary)', fontFamily: 'system-ui' },
    header: { marginBottom: '32px' },
    subtext: { color: 'var(--color-text-secondary)', fontSize: '14px', marginTop: '8px', lineHeight: '1.5' },
    checkInBox: { background: 'var(--color-surface)', padding: '32px', borderRadius: '16px', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-md)', marginBottom: '32px' },
    sliderContainer: { display: 'flex', alignItems: 'center', gap: '16px', margin: '32px 0', fontSize: '12px', fontWeight: 'bold', color: 'var(--color-text-secondary)' },
    slider: { flex: 1, accentColor: 'var(--color-primary)' },
    tagsBox: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
    tag: { padding: '8px 16px', borderRadius: '20px', border: '1px solid var(--color-border)', background: 'var(--color-background)', cursor: 'pointer', fontSize: '13px', color: 'var(--color-text-primary)' },
    spaces: { marginTop: '32px' },
    spaceCard: { background: 'var(--color-surface)', borderLeft: '4px solid var(--color-primary)', padding: '24px', borderRadius: '8px', borderRight: '1px solid var(--color-border)', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' },
    outlineBtn: { background: 'transparent', border: '1px solid var(--color-primary)', color: 'var(--color-primary)', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '16px' }
};

export default CorporateWellnessProgram;
