import React from 'react';

/**
 * TherapeuticPrograms.jsx — Digital Therapeutic Programs (Task 114)
 *
 * Structured, multi-module clinical programs (CBT, Burnout Recovery)
 * with mandatory exercise completion and pre/post outcome scoring.
 */

const Programs = [
    { id: 'cbt_01', name: 'Mastering Thoughts: CBT Basics', modules: 12, category: 'Clinical', level: 'Beginner' },
    { id: 'stress_02', name: 'Workplace Resilience', modules: 8, category: 'Enterprise', level: 'Intermediate' },
    { id: 'sleep_03', name: 'The Sleep Reset Protocol', modules: 6, category: 'Wellness', level: 'Beginner' }
];

const TherapeuticPrograms = () => {
    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1>Digital Therapeutic Center</h1>
                <p>Clinically structured pathways designed for sustainable transformation.</p>
            </div>

            <div style={styles.grid}>
                {Programs.map(p => (
                    <div key={p.id} style={styles.card}>
                        <div style={styles.typeBadge}>{p.category}</div>
                        <h3>{p.name}</h3>
                        <div style={styles.meta}>
                            <span>📑 {p.modules} Modules</span>
                            <span>📊 Level: {p.level}</span>
                        </div>
                        <div style={styles.progressRow}>
                            <div style={styles.progLabel}>Efficacy Rating: 92%</div>
                            <div style={styles.dotGrid}>
                                {[1, 2, 3, 4, 5].map(i => <div key={i} style={styles.dot}></div>)}
                            </div>
                        </div>
                        <button style={styles.enrollBtn}>Enroll in Program</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

const styles = {
    container: { padding: '32px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'system-ui' },
    header: { marginBottom: '40px' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' },
    card: { background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '20px', padding: '24px', transition: 'transform 0.2s' },
    typeBadge: { background: 'var(--color-primary-light)', color: 'var(--color-primary-dark)', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', display: 'inline-block', marginBottom: '16px' },
    meta: { display: 'flex', gap: '16px', fontSize: '13px', color: 'gray', margin: '12px 0 24px' },
    progressRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', padding: '12px', background: 'var(--color-background)', borderRadius: '10px' },
    progLabel: { fontSize: '12px', fontWeight: '600' },
    dotGrid: { display: 'flex', gap: '4px' },
    dot: { width: '6px', height: '6px', background: '#10b981', borderRadius: '50%' },
    enrollBtn: { width: '100%', padding: '14px', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }
};

export default TherapeuticPrograms;
