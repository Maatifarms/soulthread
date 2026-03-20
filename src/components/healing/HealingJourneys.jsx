import React from 'react';

/**
 * HealingJourneys.jsx — Personalized Healing Journeys (Task 85)
 *
 * Exposes multi-day structured interactive courses parsing lessons 
 * and guided reflective tracking.
 */

const MockJourneys = [
    {
        id: 'j1',
        title: '7 Days to Calm',
        subtitle: 'Anxiety Support Framework',
        progress: 2,
        totalSteps: 7,
        color: '#10b981',
        modules: [
            { day: 1, title: 'Understanding Your Triggers', type: 'reading', completed: true },
            { day: 2, title: 'The 4-7-8 Breath', type: 'audio', completed: true },
            { day: 3, title: 'Re-framing the Catastrophe', type: 'journal', completed: false }
        ]
    },
    {
        id: 'j2',
        title: 'Healing Burnout',
        subtitle: 'Reclaiming Your Energy',
        progress: 0,
        totalSteps: 14,
        color: '#f97316',
        modules: [
            { day: 1, title: 'Permission to Rest', type: 'video', completed: false }
        ]
    }
];

const HealingJourneys = () => {
    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={{ margin: 0, color: 'var(--color-primary)' }}>Structured Journeys</h1>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', marginTop: '8px' }}>
                    Step-by-step pathways designed by clinicians to gently guide you towards balance.
                </p>
            </div>

            <div style={styles.list}>
                {MockJourneys.map(journey => (
                    <div key={journey.id} style={{ ...styles.card, borderTop: `6px solid ${journey.color}` }}>

                        <div style={styles.cardHeader}>
                            <div>
                                <h2 style={{ margin: '0 0 4px', fontSize: '20px' }}>{journey.title}</h2>
                                <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '13px' }}>{journey.subtitle}</p>
                            </div>
                            <div style={styles.progressCircle}>
                                <span style={{ fontWeight: 'bold' }}>{journey.progress}/{journey.totalSteps}</span>
                            </div>
                        </div>

                        <div style={styles.modules}>
                            {journey.modules.map((m, idx) => (
                                <div key={m.day} style={styles.moduleRow}>
                                    <div style={{
                                        ...styles.checkCircle,
                                        background: m.completed ? journey.color : 'transparent',
                                        borderColor: m.completed ? journey.color : 'var(--color-border)'
                                    }}>
                                        {m.completed && <span style={{ color: 'white', fontSize: '12px' }}>✓</span>}
                                    </div>
                                    <div style={styles.moduleDetails}>
                                        <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: 'bold' }}>DAY {m.day}</span>
                                        <h4 style={{ margin: '2px 0 0', fontSize: '15px', color: m.completed ? 'var(--color-text-muted)' : 'var(--color-text-primary)' }}>{m.title}</h4>
                                    </div>
                                    <span style={{ fontSize: '16px', opacity: m.completed ? 0.4 : 1 }}>
                                        {m.type === 'video' ? '▶️' : m.type === 'audio' ? '🎧' : m.type === 'journal' ? '📝' : '📖'}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {journey.progress < journey.totalSteps && (
                            <button style={{ ...styles.continueBtn, background: journey.color }}>
                                {journey.progress === 0 ? 'Start Journey' : 'Continue to Next Step'}
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

const styles = {
    container: { padding: '24px', maxWidth: '800px', margin: '0 auto', color: 'var(--color-text-primary)' },
    header: { marginBottom: '32px' },
    list: { display: 'flex', flexDirection: 'column', gap: '24px' },
    card: { background: 'var(--color-surface)', borderRadius: '16px', border: '1px solid var(--color-border)', padding: '24px', boxShadow: 'var(--shadow-sm)' },
    cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' },
    progressCircle: { width: '48px', height: '48px', borderRadius: '50%', background: 'var(--color-background)', border: '2px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px' },
    modules: { display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' },
    moduleRow: { display: 'flex', alignItems: 'center', gap: '16px', padding: '12px', borderRadius: '12px', background: 'var(--color-background)', border: '1px solid var(--color-border)' },
    checkCircle: { width: '24px', height: '24px', borderRadius: '50%', border: '2px solid', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    moduleDetails: { flex: 1 },
    continueBtn: { width: '100%', padding: '14px', borderRadius: '12px', color: 'white', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '15px' }
};

export default HealingJourneys;
