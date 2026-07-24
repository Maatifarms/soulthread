import React, { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';

const ComplianceModal = ({ user, termsVersion, onAccept }) => {
    const [accepting, setAccepting] = useState(false);
    const [agreedToAI, setAgreedToAI] = useState(false);

    const handleAccept = async () => {
        setAccepting(true);
        // Always let the user in immediately — don't block on Firestore
        onAccept();
        try {
            const userRef = doc(db, 'users', user.uid);
            // setDoc with merge is safe even if doc doesn't exist yet
            await setDoc(userRef, {
                acceptedVersion: termsVersion,
                acceptedAt: new Date().toISOString()
            }, { merge: true });
        } catch (error) {
            console.error("Terms acceptance save failed (non-blocking):", error);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.95)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10000,
            padding: '20px'
        }}>
            <div style={{
                background: 'var(--color-surface)',
                padding: '40px',
                borderRadius: '24px',
                maxWidth: '600px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                textAlign: 'center'
            }}>
                <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚖️</div>
                <h1 style={{ color: 'var(--color-primary)', marginBottom: '16px' }}>Updated Terms of Service</h1>
                <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.6', marginBottom: '24px' }}>
                    Welcome to SoulThread Round 66. To ensure a safe and secure environment for all our users,
                    we've updated our platform rules and privacy guidelines. We prioritize your confidentiality
                    and platform stability.
                </p>

                <div style={{
                    textAlign: 'left',
                    background: 'var(--color-background)',
                    padding: '20px',
                    borderRadius: '16px',
                    marginBottom: '32px',
                    fontSize: '14px',
                    border: '1px solid var(--color-border)'
                }}>
                    <h3 style={{ marginTop: 0 }}>Key Updates (Version {termsVersion}):</h3>
                    <ul style={{ paddingLeft: '20px', margin: '10px 0' }}>
                        <li><strong>Safe Conversations</strong>: Guidelines on respectful interaction in healing circles.</li>
                        <li><strong>Scalable Security</strong>: Protection against abuse through intelligent rate limiting.</li>
                        <li><strong>Privacy First</strong>: Enhanced encryption and secure data handling for all posts.</li>
                        <li><strong>Admin Transparency</strong>: Controlled data access for audits and improvements.</li>
                        <li><strong>AI Safety Review</strong>: Posts may be reviewed by automated moderation tools to protect the community. No content is used to train AI models.</li>
                    </ul>
                    <p style={{ margin: '10px 0 0 0', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                        By clicking "I Accept", you agree to abide by the updated Community Guidelines and Privacy Policy.
                    </p>
                </div>

                <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'flex-start', textAlign: 'left', gap: '12px' }}>
                    <input 
                        type="checkbox" 
                        id="ai-consent"
                        checked={agreedToAI}
                        onChange={(e) => setAgreedToAI(e.target.checked)}
                        style={{ width: '20px', height: '20px', marginTop: '2px', cursor: 'pointer' }}
                    />
                    <label htmlFor="ai-consent" style={{ fontSize: '14px', color: 'var(--color-text-primary)', cursor: 'pointer', lineHeight: '1.4' }}>
                        I understand that my posts may be reviewed by automated safety tools and AI models to protect the community.
                    </label>
                </div>

                <button
                    onClick={handleAccept}
                    disabled={accepting || !agreedToAI}
                    style={{
                        width: '100%',
                        padding: '16px',
                        background: 'var(--color-primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        fontSize: '18px',
                        fontWeight: '700',
                        cursor: (accepting || !agreedToAI) ? 'not-allowed' : 'pointer',
                        opacity: (accepting || !agreedToAI) ? 0.6 : 1,
                        transition: 'all 0.2s'
                    }}
                >
                    {accepting ? 'Continuing...' : 'I Accept & Continue'}
                </button>
            </div>
        </div>
    );
};

export default ComplianceModal;
