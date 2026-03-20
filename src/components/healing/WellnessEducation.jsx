import React from 'react';

/**
 * WellnessEducation.jsx — Global Wellness Education Platform (Task 104)
 *
 * A learning-focused hub offering micro-modules, interactive courses,
 * and badge-based certification for mental wellness knowledge.
 */

const Modules = [
    { id: 1, title: "Foundations of CBT", duration: "15 mins", type: "Interactive", badge: "🧠" },
    { id: 2, title: "Digital boundaries & Mental Health", duration: "10 mins", type: "Video", badge: "📱" },
    { id: 3, title: "Somatic Grounding Techniques", duration: "25 mins", type: "Workshop", badge: "🌿" }
];

const WellnessEducation = () => {
    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1>SoulThread Academy</h1>
                <p>Enhance your emotional intelligence through clinically-backed learning modules.</p>
            </div>

            <div style={styles.featured}>
                <div style={styles.featuredContent}>
                    <span style={styles.tag}>NEW COURSE</span>
                    <h2>Navigating Grief & Loss</h2>
                    <p>A compassionate 4-part series on processing change and finding resilience.</p>
                    <button style={styles.startBtn}>Start Learning</button>
                </div>
            </div>

            <div style={styles.grid}>
                {Modules.map(mod => (
                    <div key={mod.id} style={styles.card}>
                        <div style={styles.badge}>{mod.badge}</div>
                        <div style={styles.modInfo}>
                            <h3>{mod.title}</h3>
                            <div style={styles.meta}>
                                <span>{mod.duration}</span> • <span>{mod.type}</span>
                            </div>
                        </div>
                        <button style={styles.actionIcon}>▶</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

const styles = {
    container: { padding: '32px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'system-ui' },
    header: { marginBottom: '32px' },
    featured: { background: 'linear-gradient(135deg, #10b981, #059669)', padding: '40px', borderRadius: '24px', color: 'white', marginBottom: '40px', position: 'relative', overflow: 'hidden' },
    tag: { background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold' },
    featuredContent: { maxWidth: '500px' },
    startBtn: { marginTop: '20px', padding: '12px 28px', borderRadius: '12px', background: 'white', color: '#059669', border: 'none', fontWeight: 'bold', cursor: 'pointer' },
    grid: { display: 'flex', flexDirection: 'column', gap: '16px' },
    card: { display: 'flex', alignItems: 'center', background: 'var(--color-surface)', padding: '20px', borderRadius: '16px', border: '1px solid var(--color-border)', gap: '20px' },
    badge: { width: '48px', height: '48px', background: 'var(--color-background)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', borderRadius: '12px' },
    modInfo: { flex: 1 },
    meta: { fontSize: '13px', color: 'gray', marginTop: '4px' },
    actionIcon: { background: 'var(--color-primary-light)', color: 'var(--color-primary-dark)', border: 'none', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', fontWeight: 'bold' }
};

export default WellnessEducation;
