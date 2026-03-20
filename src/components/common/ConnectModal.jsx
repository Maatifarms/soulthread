import React, { useState, useEffect } from 'react';

const ConnectModal = ({ targetName, onConfirm, onClose }) => {
    const [note, setNote] = useState('');
    const [isVisible, setIsVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    const MAX_NOTE_LENGTH = 200;
    const noteLength = note.length;
    const isNearLimit = noteLength > 180;
    const isOverLimit = noteLength > MAX_NOTE_LENGTH;

    const quickActions = [
        "I relate to your post",
        "Let's support each other",
        "Similar journey"
    ];

    useEffect(() => {
        setIsVisible(true);
    }, []);

    const handleQuickAction = (text) => {
        if (noteLength + text.length <= MAX_NOTE_LENGTH) {
            setNote(prev => prev ? `${prev} ${text}` : text);
        }
    };

    const handleConfirm = async () => {
        if (!note.trim()) return;
        setLoading(true);
        await onConfirm(note);
        setLoading(false);
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            opacity: isVisible ? 1 : 0,
            transition: 'opacity 0.2s ease-in-out'
        }} onClick={onClose}>
            <div style={{
                background: 'var(--color-surface)',
                padding: '24px',
                borderRadius: '16px',
                width: '90%',
                maxWidth: '450px',
                border: '1px solid var(--color-border)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                transform: isVisible ? 'scale(1)' : 'scale(0.9)',
                transition: 'transform 0.2s ease-in-out'
            }} onClick={e => e.stopPropagation()}>
                <h3 style={{ marginTop: 0, marginBottom: '8px', color: 'var(--color-text-primary)', fontSize: '20px' }}>Connect with {targetName}</h3>
                <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '16px', lineHeight: '1.5' }}>
                    Share why you'd like to connect. A personal note helps build meaningful connections.
                </p>

                {/* Quick Action Chips */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                    {quickActions.map((action, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleQuickAction(action)}
                            type="button"
                            style={{
                                padding: '6px 12px',
                                borderRadius: '16px',
                                border: '1px solid var(--color-border)',
                                background: 'var(--color-background)',
                                color: 'var(--color-text-secondary)',
                                fontSize: '12px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                fontWeight: '500'
                            }}
                            onMouseEnter={e => {
                                e.target.style.background = 'var(--color-primary-light)';
                                e.target.style.borderColor = 'var(--color-primary)';
                                e.target.style.color = 'var(--color-primary-dark)';
                            }}
                            onMouseLeave={e => {
                                e.target.style.background = 'var(--color-background)';
                                e.target.style.borderColor = 'var(--color-border)';
                                e.target.style.color = 'var(--color-text-secondary)';
                            }}
                        >
                            {action}
                        </button>
                    ))}
                </div>

                <textarea
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    placeholder="Hi! I saw your post and felt connected. I'd love to support each other on our journeys..."
                    maxLength={MAX_NOTE_LENGTH}
                    style={{
                        width: '100%',
                        height: '100px',
                        padding: '12px',
                        borderRadius: '12px',
                        border: `1px solid ${isOverLimit ? '#ff4444' : 'var(--color-border)'}`,
                        marginBottom: '8px',
                        fontFamily: 'inherit',
                        fontSize: '14px',
                        resize: 'none',
                        background: 'var(--color-background)',
                        color: 'var(--color-text-primary)',
                        lineHeight: '1.5',
                        outline: 'none',
                        transition: 'border-color 0.2s'
                    }}
                    onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
                    onBlur={e => e.target.style.borderColor = isOverLimit ? '#ff4444' : 'var(--color-border)'}
                />

                {/* Character Counter */}
                <div style={{
                    fontSize: '12px',
                    color: isNearLimit ? (isOverLimit ? '#ff4444' : '#ff9800') : 'var(--color-text-secondary)',
                    marginBottom: '16px',
                    textAlign: 'right',
                    fontWeight: isNearLimit ? '600' : 'normal'
                }}>
                    {noteLength}/{MAX_NOTE_LENGTH}
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        style={{
                            padding: '10px 20px',
                            borderRadius: '24px',
                            border: '1px solid var(--color-border)',
                            background: 'transparent',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            color: 'var(--color-text-primary)',
                            fontWeight: '600',
                            fontSize: '14px',
                            opacity: loading ? 0.5 : 1
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={!note.trim() || loading || isOverLimit}
                        style={{
                            padding: '10px 24px',
                            borderRadius: '24px',
                            border: 'none',
                            background: (!note.trim() || loading || isOverLimit) ? '#ccc' : 'var(--color-primary)',
                            color: 'white',
                            fontWeight: '700',
                            fontSize: '14px',
                            cursor: (!note.trim() || loading || isOverLimit) ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s',
                            opacity: loading ? 0.7 : 1
                        }}
                    >
                        {loading ? 'Sending...' : 'Send Request'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConnectModal;
