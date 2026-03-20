import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useNavigate } from 'react-router-dom';

const AdminSetup = () => {
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('');
    const navigate = useNavigate();

    // ALLOWED ADMIN EMAILS
    const ALLOWED_ADMINS = [
        'rupesh2510@gmail.com',
        'anchalmaurya406@gmail.com',
        'bhavyajha.bhu@gmail.com'
    ];

    const handleClaimAdmin = async () => {
        if (!currentUser) {
            setStatus('Please login first.');
            return;
        }

        if (!ALLOWED_ADMINS.some(email => email.toLowerCase() === currentUser.email.toLowerCase())) {
            setStatus('❌ Access Denied. Your email is not authorized for Admin access.');
            return;
        }

        setLoading(true);
        try {
            const userRef = doc(db, 'users', currentUser.uid);

            // Double check existence
            const docSnap = await getDoc(userRef);
            if (!docSnap.exists()) {
                setStatus('Error: User profile not found.');
                setLoading(false);
                return;
            }

            await updateDoc(userRef, {
                role: 'admin',
                isAdmin: true // Redundant but helpful for some legacy checks if any
            });

            setStatus('✅ Success! You are now the Super Admin.');
            setTimeout(() => {
                navigate('/admin');
            }, 1500);

        } catch (error) {
            console.error(error);
            setStatus('Error: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ marginTop: '50px', textAlign: 'center' }}>
            <div style={{ maxWidth: '400px', margin: '0 auto', padding: '30px', background: 'var(--color-surface)', borderRadius: '16px', border: '2px solid var(--color-primary)' }}>
                <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>👑 Admin Setup</h1>

                <p style={{ marginBottom: '20px', color: 'var(--color-text-secondary)' }}>
                    System Bootstrapping Utility
                </p>

                {currentUser ? (
                    <div>
                        <p style={{ fontSize: '14px', marginBottom: '10px' }}>Logged in as: <strong>{currentUser.email}</strong></p>

                        {ALLOWED_ADMINS.some(email => email.toLowerCase() === currentUser.email.toLowerCase()) ? (
                            <button
                                onClick={handleClaimAdmin}
                                disabled={loading}
                                className="btn-primary"
                                style={{ width: '100%', padding: '12px', fontSize: '16px' }}
                            >
                                {loading ? 'Processing...' : 'Claim Admin Access'}
                            </button>
                        ) : (
                            <div style={{ color: 'red', padding: '10px', background: '#ffebee', borderRadius: '8px' }}>
                                ⛔ You are not the authorized system administrator.
                            </div>
                        )}
                    </div>
                ) : (
                    <p>Please log in to continue.</p>
                )}

                {status && <p style={{ marginTop: '20px', fontWeight: 'bold' }}>{status}</p>}
            </div>
        </div>
    );
};

export default AdminSetup;
