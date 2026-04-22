import React, { useState } from 'react';
import { 
    Sparkles, 
    Smile, 
    Heart, 
    Cloud, 
    Waves, 
    Leaf, 
    Zap, 
    Ghost,
    Minus
} from 'lucide-react';

/**
 * MoodStatusPicker — Mood status selector for profile pages
 *
 * Displays premium icons for mood options. Selected mood is shown on the user's profile card.
 * Designed to be embedded in EditProfileModal or as a standalone chip on Profile.
 */

const MOODS = [
    { key: 'thriving', icon: <Sparkles size={18} />, label: 'Thriving', color: '#f59e0b' },
    { key: 'calm', icon: <Smile size={18} />, label: 'Calm', color: '#10b981' },
    { key: 'grateful', icon: <Heart size={18} />, label: 'Grateful', color: '#f472b6' },
    { key: 'reflective', icon: <Waves size={18} />, label: 'Reflective', color: '#3b82f6' },
    { key: 'struggling', icon: <Cloud size={18} />, label: 'Struggling', color: '#6366f1' },
    { key: 'hopeful', icon: <Leaf size={18} />, label: 'Hopeful', color: '#22c55e' },
    { key: 'anxious', icon: <Zap size={18} />, label: 'Anxious', color: '#f97316' },
    { key: 'healing', icon: <Ghost size={18} />, label: 'Healing', color: '#ec4899' },
    { key: 'none', icon: <Minus size={18} />, label: 'Not set', color: '#94a3b8' },
];

export function getMoodByKey(key) {
    return MOODS.find(m => m.key === key) || MOODS[MOODS.length - 1];
}

export function MoodBadge({ moodKey, style = {} }) {
    const mood = getMoodByKey(moodKey);
    if (!moodKey || moodKey === 'none') return null;
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '4px 12px', borderRadius: '999px',
            fontSize: '11px', fontWeight: '800',
            background: `${mood.color}15`,
            color: mood.color,
            border: `1px solid ${mood.color}33`,
            textTransform: 'uppercase',
            letterSpacing: '0.03em',
            ...style,
        }}>
            {mood.icon} {mood.label}
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
                        padding: '6px 14px', borderRadius: '999px',
                        border: `1.5px solid ${current.color}55`,
                        background: `${current.color}08`,
                        color: current.color,
                        fontSize: '12px', fontWeight: '800', cursor: 'pointer',
                        display: 'inline-flex', alignItems: 'center', gap: '8px',
                        transition: 'all 0.2s ease',
                    }}
                >
                    <span style={{ display: 'flex', alignItems: 'center' }}>{current.icon}</span>
                    <span>{value && value !== 'none' ? current.label : 'Set Energy'}</span>
                    <span style={{ fontSize: '10px', opacity: 0.6 }}>▼</span>
                </button>

                {open && (
                    <div style={{
                        position: 'absolute', top: '120%', left: 0, zIndex: 100,
                        background: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '20px',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                        padding: '10px',
                        display: 'flex', flexDirection: 'column', gap: '4px',
                        minWidth: '180px',
                        animation: 'fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}>
                        {MOODS.map(m => (
                            <button
                                key={m.key}
                                onClick={() => select(m.key)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '12px',
                                    padding: '10px 14px', borderRadius: '14px',
                                    background: value === m.key ? `${m.color}12` : 'transparent',
                                    border: 'none', cursor: 'pointer', textAlign: 'left',
                                    color: value === m.key ? m.color : 'var(--color-text-primary)',
                                    transition: 'all 0.2s',
                                    fontWeight: value === m.key ? '800' : '500',
                                    fontSize: '13px'
                                }}
                            >
                                <span style={{ display: 'flex', alignItems: 'center', color: m.color }}>{m.icon}</span>
                                <span>{m.label}</span>
                                {value === m.key && <span style={{ marginLeft: 'auto', fontSize: '10px' }}>●</span>}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // Full grid layout
    return (
        <div className="mood-picker-elite">
            <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--color-text-muted)', display: 'block', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Energy State
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                {MOODS.filter(m => m.key !== 'none').map(m => (
                    <button
                        key={m.key}
                        onClick={() => select(m.key)}
                        style={{
                            padding: '16px 8px',
                            borderRadius: '16px',
                            border: `1.5px solid ${value === m.key ? m.color : 'var(--color-border)'}`,
                            background: value === m.key ? `${m.color}08` : 'var(--color-surface)',
                            cursor: 'pointer',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                        }}
                    >
                        <span style={{ color: m.color, display: 'flex', alignItems: 'center' }}>
                            {React.cloneElement(m.icon, { size: 24, strokeWidth: 1.5 })}
                        </span>
                        <span style={{ fontSize: '11px', fontWeight: '800', color: value === m.key ? m.color : 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                            {m.label}
                        </span>
                    </button>
                ))}
            </div>
            {value && value !== 'none' && (
                <button
                    onClick={() => select('none')}
                    style={{
                        marginTop: '12px', padding: '8px 16px',
                        borderRadius: '30px', border: '1px solid var(--color-border)',
                        background: 'none', color: 'var(--color-text-muted)',
                        fontSize: '11px', fontWeight: '700', cursor: 'pointer',
                        textTransform: 'uppercase', letterSpacing: '0.05em'
                    }}
                >Reset State</button>
            )}
        </div>
    );
}

