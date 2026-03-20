import React, { useState } from 'react';

/**
 * MoodStatusPicker — Mood status selector for profile pages
 *
 * Displays emoji mood options. Selected mood is shown on the user's profile card.
 * Designed to be embedded in EditProfileModal or as a standalone chip on Profile.
 *
 * Props:
 *   value     {string}   — current mood emoji key
 *   onChange  {function} — called with new mood key
 *   compact   {boolean}  — compact display (no labels, just emojis)
 */

const MOODS = [
    { key: 'thriving', emoji: '🌟', label: 'Thriving', color: '#f59e0b' },
    { key: 'calm', emoji: '😌', label: 'Calm', color: '#3d8b7f' },
    { key: 'grateful', emoji: '🙏', label: 'Grateful', color: '#8b5cf6' },
    { key: 'reflective', emoji: '🌊', label: 'Reflective', color: '#3b82f6' },
    { key: 'struggling', emoji: '💙', label: 'Struggling', color: '#6366f1' },
    { key: 'hopeful', emoji: '🌱', label: 'Hopeful', color: '#10b981' },
    { key: 'anxious', emoji: '😰', label: 'Anxious', color: '#f97316' },
    { key: 'healing', emoji: '🦋', label: 'Healing', color: '#ec4899' },
    { key: 'none', emoji: '—', label: 'Not set', color: '#9ca3af' },
];

export function getMoodByKey(key) {
    return MOODS.find(m => m.key === key) || MOODS[MOODS.length - 1];
}

export function MoodBadge({ moodKey, style = {} }) {
    const mood = getMoodByKey(moodKey);
    if (!moodKey || moodKey === 'none') return null;
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            padding: '3px 10px', borderRadius: '999px',
            fontSize: '12px', fontWeight: '600',
            background: `${mood.color}22`,
            color: mood.color,
            border: `1px solid ${mood.color}44`,
            ...style,
        }}>
            {mood.emoji} {mood.label}
        </span>
    );
}

export default function MoodStatusPicker({ value, onChange, compact = false }) {
    const [open, setOpen] = useState(false);
    const current = getMoodByKey(value);

    const select = (key) => {
        onChange(key);
        setOpen(false);
    };

    if (compact) {
        return (
            <div style={{ position: 'relative', display: 'inline-block' }}>
                <button
                    onClick={() => setOpen(o => !o)}
                    style={{
                        padding: '4px 12px', borderRadius: '999px',
                        border: `1px solid ${current.color}55`,
                        background: `${current.color}15`,
                        color: current.color,
                        fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                    }}
                >
                    <span>{current.emoji}</span>
                    <span>{value && value !== 'none' ? current.label : 'Set mood'}</span>
                    <span style={{ fontSize: '10px' }}>▾</span>
                </button>

                {open && (
                    <div style={{
                        position: 'absolute', top: '110%', left: 0, zIndex: 100,
                        background: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '16px',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                        padding: '8px',
                        display: 'flex', flexDirection: 'column', gap: '2px',
                        minWidth: '160px',
                        animation: 'fadeIn 0.15s ease',
                    }}>
                        {MOODS.map(m => (
                            <button
                                key={m.key}
                                onClick={() => select(m.key)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '10px',
                                    padding: '8px 12px', borderRadius: '10px',
                                    background: value === m.key ? `${m.color}18` : 'transparent',
                                    border: 'none', cursor: 'pointer', textAlign: 'left',
                                    color: 'var(--color-text-primary)',
                                    transition: 'background 0.1s',
                                }}
                            >
                                <span style={{ fontSize: '18px' }}>{m.emoji}</span>
                                <span style={{ fontSize: '13px', fontWeight: value === m.key ? '700' : '400' }}>{m.label}</span>
                                {value === m.key && <span style={{ marginLeft: 'auto', color: m.color }}>✓</span>}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // Full grid layout
    return (
        <div>
            <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '10px' }}>
                Mood Status
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {MOODS.filter(m => m.key !== 'none').map(m => (
                    <button
                        key={m.key}
                        onClick={() => select(m.key)}
                        style={{
                            padding: '10px 8px',
                            borderRadius: '12px',
                            border: `2px solid ${value === m.key ? m.color : 'var(--color-border)'}`,
                            background: value === m.key ? `${m.color}18` : 'var(--color-background)',
                            cursor: 'pointer',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                            transition: 'all 0.15s',
                        }}
                    >
                        <span style={{ fontSize: '22px' }}>{m.emoji}</span>
                        <span style={{ fontSize: '11px', fontWeight: '600', color: value === m.key ? m.color : 'var(--color-text-secondary)' }}>
                            {m.label}
                        </span>
                    </button>
                ))}
            </div>
            {value && value !== 'none' && (
                <button
                    onClick={() => select('none')}
                    style={{
                        marginTop: '8px', padding: '6px 14px',
                        borderRadius: '20px', border: '1px solid var(--color-border)',
                        background: 'none', color: 'var(--color-text-secondary)',
                        fontSize: '12px', cursor: 'pointer',
                    }}
                >Clear mood</button>
            )}
        </div>
    );
}
