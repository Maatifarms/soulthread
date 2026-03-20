import React from 'react';

/**
 * ModerationWarning — in-app UI component for AI moderation responses
 *
 * Handles 3 scenarios:
 *   1. WARN (medium risk) → yellow advisory banner with "Post anyway" option
 *   2. BLOCK (high risk)  → red panel, cannot post, edit required
 *   3. CRISIS             → teal empathetic panel with helpline resources
 *
 * Props:
 *   result   {object}     — output from aiModeration.moderateText()
 *   onContinue {function} — user confirms "post anyway" (warn only)
 *   onEdit   {function}   — user chooses to edit
 *   onClose  {function}   — dismiss (crisis only)
 */
export default function ModerationWarning({ result, onContinue, onEdit, onClose }) {
    if (!result || result.moderationAction === 'allow') return null;

    // ── CRISIS ──────────────────────────────────────────────────────────────
    if (result.isCrisis && result.crisisResources) {
        const { headline, message, resources } = result.crisisResources;
        return (
            <div style={{
                position: 'fixed', inset: 0, zIndex: 9500,
                background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '24px',
                animation: 'fadeIn 0.25s ease',
            }}>
                <div style={{
                    background: 'var(--color-surface)',
                    borderRadius: '24px',
                    maxWidth: '420px', width: '100%',
                    padding: '28px 24px',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
                    textAlign: 'center',
                }}>
                    <div style={{ fontSize: '40px', marginBottom: '12px' }}>💙</div>
                    <h3 style={{ margin: '0 0 12px', fontSize: '20px', fontWeight: '700', color: 'var(--color-text-primary)' }}>
                        {headline}
                    </h3>
                    <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: '1.65', margin: '0 0 20px' }}>
                        {message}
                    </p>

                    {/* Resources */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px', textAlign: 'left' }}>
                        {resources.map((r, i) => (
                            <div key={i} style={{
                                padding: '12px 14px', borderRadius: '12px',
                                background: 'rgba(61,139,127,0.08)',
                                border: '1px solid rgba(61,139,127,0.2)',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            }}>
                                <div>
                                    <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-text-primary)' }}>{r.name}</div>
                                    {r.number && <div style={{ fontSize: '12px', color: 'var(--color-primary)', fontWeight: '600' }}>{r.number}</div>}
                                </div>
                                {r.url && (
                                    <a href={r.url} target="_blank" rel="noreferrer" style={{
                                        fontSize: '12px', color: 'var(--color-primary)',
                                        textDecoration: 'none', fontWeight: '600',
                                        padding: '5px 12px', borderRadius: '20px',
                                        border: '1px solid var(--color-primary)',
                                    }}>Visit</a>
                                )}
                            </div>
                        ))}
                    </div>

                    <button onClick={onEdit || onClose} style={{
                        width: '100%', padding: '14px', borderRadius: '14px',
                        background: 'var(--color-primary)', color: 'white',
                        border: 'none', fontSize: '15px', fontWeight: '700', cursor: 'pointer',
                        marginBottom: '10px',
                    }}>
                        Edit my post
                    </button>
                    {onClose && (
                        <button onClick={onClose} style={{
                            width: '100%', padding: '10px',
                            background: 'none', border: 'none',
                            color: 'var(--color-text-secondary)', fontSize: '13px', cursor: 'pointer',
                        }}>I'm okay, dismiss this</button>
                    )}
                </div>
            </div>
        );
    }

    // ── BLOCK ────────────────────────────────────────────────────────────────
    if (result.moderationAction === 'block') {
        return (
            <div style={{
                background: '#fff1f1', border: '1px solid #fca5a5',
                borderRadius: '12px', padding: '14px 16px',
                display: 'flex', gap: '12px', alignItems: 'flex-start',
                animation: 'fadeIn 0.2s',
            }}>
                <span style={{ fontSize: '20px', flexShrink: 0 }}>🚫</span>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#dc2626', marginBottom: '4px' }}>
                        Content blocked
                    </div>
                    <div style={{ fontSize: '13px', color: '#b91c1c', lineHeight: '1.5' }}>
                        {result.reason}
                    </div>
                    <button onClick={onEdit} style={{
                        marginTop: '10px', padding: '7px 18px',
                        background: '#dc2626', color: 'white',
                        border: 'none', borderRadius: '8px',
                        fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                    }}>
                        Edit post
                    </button>
                </div>
            </div>
        );
    }

    // ── WARN ─────────────────────────────────────────────────────────────────
    if (result.moderationAction === 'warn') {
        return (
            <div style={{
                background: '#fffbeb', border: '1px solid #fcd34d',
                borderRadius: '12px', padding: '14px 16px',
                display: 'flex', gap: '12px', alignItems: 'flex-start',
                animation: 'fadeIn 0.2s',
            }}>
                <span style={{ fontSize: '20px', flexShrink: 0 }}>⚠️</span>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#92400e', marginBottom: '6px' }}>
                        Community guideline reminder
                    </div>
                    <div style={{ fontSize: '13px', color: '#78350f', lineHeight: '1.5', marginBottom: '10px' }}>
                        {result.reason}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button onClick={onEdit} style={{
                            padding: '7px 16px', background: '#f59e0b', color: 'white',
                            border: 'none', borderRadius: '8px',
                            fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                        }}>
                            Edit post
                        </button>
                        <button onClick={onContinue} style={{
                            padding: '7px 16px',
                            background: 'transparent',
                            border: '1px solid #fcd34d',
                            color: '#92400e',
                            borderRadius: '8px',
                            fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                        }}>
                            Post anyway
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return null;
}
