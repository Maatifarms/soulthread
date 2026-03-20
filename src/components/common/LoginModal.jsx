import React from 'react';
import { useNavigate } from 'react-router-dom';

const LoginModal = ({ onClose }) => {
    const navigate = useNavigate();

    React.useEffect(() => {
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = originalOverflow || 'auto';
        };
    }, []);

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
        }} onClick={onClose}>
            <div style={{
                backgroundColor: 'var(--color-surface)',
                padding: '30px',
                borderRadius: 'var(--radius-md)',
                maxWidth: '400px',
                width: '90%',
                textAlign: 'center',
                boxShadow: 'var(--shadow-md)',
                position: 'relative'
            }} onClick={e => e.stopPropagation()}>

                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        fontSize: '20px',
                        color: 'var(--color-text-secondary)'
                    }}
                >
                    &times;
                </button>

                <h2 style={{ marginBottom: '10px', color: 'var(--color-text-primary)' }}>Join SoulThread</h2>
                <p style={{ marginBottom: '20px', color: 'var(--color-text-secondary)' }}>
                    Login to post, comment, and connect with counselors.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <button
                        onClick={() => navigate('/login')}
                        className="btn-primary"
                        style={{ width: '100%' }}
                    >
                        Login / Signup
                    </button>

                    <button
                        onClick={onClose}
                        style={{
                            color: 'var(--color-text-secondary)',
                            fontSize: '14px',
                            marginTop: '10px'
                        }}
                    >
                        Continue Browsing
                    </button>
                </div>

            </div>
        </div>
    );
};

export default LoginModal;
