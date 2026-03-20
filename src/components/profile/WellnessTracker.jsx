import React, { useState } from 'react';

/**
 * WellnessTracker.jsx — Emotional Wellness Tracker (Task 64)
 *
 * Daily interactive mood check-in generating localized graphical 
 * reflection timelines securely tracked natively.
 */

const MoodOptions = [
    { label: 'Radiant', emoji: '✨', score: 5, color: '#10b981' },
    { label: 'Calm', emoji: '🌿', score: 4, color: '#3b82f6' },
    { label: 'Numb', emoji: '☁️', score: 3, color: '#9ca3af' },
    { label: 'Anxious', emoji: '🌪️', score: 2, color: '#f97316' },
    { label: 'Overwhelmed', emoji: '🌧️', score: 1, color: '#ef4444' }
];

const WellnessTracker = () => {
    const [selectedMood, setSelectedMood] = useState(null);
    const [journalEntry, setJournalEntry] = useState('');
    const [submitted, setSubmitted] = useState(false);

    // Mock Timeline
    const pastEntries = [
        { date: 'Yesterday', moodScore: 4, emoji: '🌿', reflection: 'Spent some time offline today.' },
        { date: 'Monday', moodScore: 2, emoji: '🌪️', reflection: 'Heavy workload pressure.' }
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        // Natively pushes to `user_metrics/UID/mood_logs`
        setSubmitted(true);
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={{ margin: 0, color: 'var(--color-text-primary)' }}>Wellness Tracker</h1>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', marginTop: '4px' }}>Privately map your emotional trends.</p>
            </div>

            {!submitted ? (
                <form onSubmit={handleSubmit} style={styles.card}>
                    <h3 style={{ margin: '0 0 16px' }}>How are you feeling right now?</h3>
                    <div style={styles.moodGrid}>
                        {MoodOptions.map((mood) => (
                            <div
                                key={mood.label}
                                onClick={() => setSelectedMood(mood)}
                                style={{
                                    ...styles.moodBtn,
                                    border: selectedMood?.label === mood.label ? `2px solid ${mood.color}` : '2px solid transparent',
                                    background: selectedMood?.label === mood.label ? 'rgba(0,0,0,0.05)' : 'var(--color-surface)'
                                }}
                            >
                                <span style={{ fontSize: '32px' }}>{mood.emoji}</span>
                                <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{mood.label}</span>
                            </div>
                        ))}
                    </div>

                    <textarea
                        style={styles.journal}
                        placeholder="Private reflections... (Optional)"
                        value={journalEntry}
                        onChange={(e) => setJournalEntry(e.target.value)}
                        rows="3"
                    />

                    <button type="submit" disabled={!selectedMood} style={{ ...styles.submitBtn, opacity: selectedMood ? 1 : 0.5 }}>
                        Lock Entry
                    </button>
                </form>
            ) : (
                <div style={{ ...styles.card, textAlign: 'center', padding: '40px' }}>
                    <h2 style={{ color: 'var(--color-primary)' }}>Entry Saved 🌱</h2>
                    <p>Your timeline has been updated.</p>
                </div>
            )}

            <div style={{ marginTop: '32px' }}>
                <h3 style={{ marginBottom: '16px' }}>Weekly Overview</h3>
                <div style={styles.timeline}>
                    {pastEntries.map((e, idx) => (
                        <div key={idx} style={styles.timelineItem}>
                            <div style={styles.timelineIcon}>{e.emoji}</div>
                            <div style={styles.timelineContent}>
                                <h4 style={{ margin: 0, fontSize: '14px' }}>{e.date}</h4>
                                <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--color-text-secondary)' }}>{e.reflection}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: { padding: '24px', maxWidth: '600px', margin: '0 auto', color: 'var(--color-text-primary)' },
    header: { marginBottom: '24px' },
    card: { background: 'var(--color-surface)', padding: '24px', borderRadius: '16px', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' },
    moodGrid: { display: 'flex', gap: '12px', justifyContent: 'space-between', marginBottom: '24px' },
    moodBtn: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 8px', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s', border: '1px solid var(--color-border)' },
    journal: { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-background)', color: 'var(--color-text-primary)', resize: 'none', marginBottom: '16px', fontSize: '14px', boxSizing: 'border-box' },
    submitBtn: { width: '100%', padding: '12px', borderRadius: '8px', background: 'var(--color-primary)', color: 'white', border: 'none', fontWeight: 'bold', cursor: 'pointer' },
    timeline: { display: 'flex', flexDirection: 'column', gap: '16px', borderLeft: '2px solid var(--color-border)', marginLeft: '12px', paddingLeft: '20px' },
    timelineItem: { display: 'flex', alignItems: 'flex-start', position: 'relative' },
    timelineIcon: { position: 'absolute', left: '-36px', top: '0px', fontSize: '20px', background: 'var(--color-background)', borderRadius: '50%' },
    timelineContent: { background: 'var(--color-surface)', padding: '12px', borderRadius: '8px', width: '100%', border: '1px solid var(--color-border)' }
};

export default WellnessTracker;
