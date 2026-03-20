import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

const CounselorLogin = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setError('');
            setLoading(true);
            const result = await login(email, password);

            // Check Role
            const userDoc = await getDoc(doc(db, 'users', result.user.uid));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                if (userData.role === 'psychologist' || userData.role === 'admin') {
                    navigate('/dashboard'); // Go to Counselor Dashboard
                } else {
                    setError("Access Denied. You do not have counselor privileges.");
                    // Optional: Logout immediately if strict
                }
            } else {
                setError("Account not found.");
            }
        } catch (err) {
            setError("Failed to log in: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', padding: '20px' }}>
            <div style={{ backgroundColor: 'var(--color-surface)', padding: '40px', borderRadius: '16px', boxShadow: 'var(--shadow-md)', width: '100%', maxWidth: '400px', textAlign: 'center', border: '2px solid var(--color-primary)' }}>
                <h2 style={{ marginBottom: '10px', color: 'var(--color-primary)' }}>Counselor Portal 🩺</h2>
                <p style={{ color: 'var(--color-text-secondary)', marginBottom: '30px' }}>Secure access for approved professionals.</p>

                {error && <div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '10px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <input type="email" placeholder="Professional Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-background)', color: 'var(--color-text-primary)', fontSize: '16px', outline: 'none' }} />
                    <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-background)', color: 'var(--color-text-primary)', fontSize: '16px', outline: 'none' }} />
                    <button type="submit" disabled={loading} style={{ marginTop: '10px', padding: '12px', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '25px', fontSize: '16px', fontWeight: '600', cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.7 : 1 }}>
                        {loading ? 'Verifying Access...' : 'Enter Portal'}
                    </button>
                </form>

                <div style={{ marginTop: '20px', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                    Not a counselor yet? <Link to="/profile/me" style={{ color: 'var(--color-primary)', fontWeight: '600', textDecoration: 'none' }}>Apply in Profile</Link>
                </div>
            </div>
        </div>
    );
};

export default CounselorLogin;
