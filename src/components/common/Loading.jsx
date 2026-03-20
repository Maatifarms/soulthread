import React from 'react';

const Loading = () => {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '60vh',
            flexDirection: 'column',
            gap: '15px'
        }}>
            <div style={{
                width: '60px',
                height: '60px',
                background: 'var(--color-primary-soft)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: 'pulseSanctuary 2s ease-in-out infinite'
            }}>
                <div style={{
                    width: '30px',
                    height: '30px',
                    background: 'var(--color-primary)',
                    borderRadius: '50%',
                    opacity: 0.8
                }} />
            </div>
            <p style={{
                color: 'var(--color-primary-dark)',
                fontWeight: '700',
                fontSize: '14px',
                letterSpacing: '0.05em',
                textTransform: 'uppercase'
            }}>Entering Sanctuary...</p>
            <style>
                {`
                    @keyframes pulseSanctuary {
                        0% { transform: scale(0.9); opacity: 0.5; }
                        50% { transform: scale(1.1); opacity: 1; }
                        100% { transform: scale(0.9); opacity: 0.5; }
                    }
                `}
            </style>
        </div>
    );
};

export default Loading;
