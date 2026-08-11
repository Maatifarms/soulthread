import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Mail } from 'lucide-react';

import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Card } from '../components/common/Card';


const ForgotPassword = () => {
    const { resetPassword } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleResetPassword = async (e) => {
        e.preventDefault();
        try {
            setError(''); setMessage(''); setLoading(true);
            await resetPassword(email);
            setMessage('Recovery link sent! Check your inbox.');
        } catch (err) {
            if (err.code === 'auth/user-not-found') setError('No account found with this email.');
            else setError('Failed to send reset email: ' + err.message);
        } finally { setLoading(false); }
    };

    return (
        <div className="auth-page">
            <div className="auth-logo-section">
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.3 }}>
                    <svg width="80" height="70" viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: '16px' }}>
                        <path d="M60 80 C60 80 20 55 20 32 C20 20 29 12 40 12 C48 12 55 17 60 23 C65 17 72 12 80 12 C91 12 100 20 100 32 C100 55 60 80 60 80Z" fill="white" />
                    </svg>
                </motion.div>
                <h1 className="auth-logo-title" style={{ color: 'white', margin: 0 }}>SOULTHREAD</h1>
            </div>

            <main className="auth-container" style={{ padding: '24px', maxWidth: '400px', margin: '0 auto' }}>
                <Card premium style={{ padding: '32px' }}>
                    <h2 style={{ marginBottom: '8px' }}>Reset Password</h2>
                    <p style={{ color: 'var(--color-text-secondary)', marginBottom: '24px' }}>We'll send a recovery link to your email.</p>

                    {message && (
                        <div style={{ padding: '12px', background: 'var(--st-success-soft, #f0fdf4)', color: 'var(--st-success, #15803d)', borderRadius: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <CheckCircle2 size={18} style={{ flexShrink: 0 }} /> {message}
                        </div>
                    )}
                    {error && (
                        <div style={{ padding: '12px', background: 'var(--st-error-soft, #fef2f2)', color: 'var(--st-error, #b91c1c)', borderRadius: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <AlertTriangle size={18} style={{ flexShrink: 0 }} /> {error}
                        </div>
                    )}

                    <form onSubmit={handleResetPassword} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <Input
                            label="Email Address"
                            type="email"
                            placeholder="Enter your registered email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={loading}
                        />

                        <Button type="submit" variant="primary" isLoading={loading} style={{ width: '100%', marginTop: '8px' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}><Mail size={16} /> Send Reset Link</span>
                        </Button>
                        
                        <Button 
                            variant="ghost" 
                            onClick={() => navigate('/login')} 
                            disabled={loading}
                            style={{ width: '100%' }}
                        >
                            ← Back to Login
                        </Button>
                    </form>
                </Card>
            </main>
        </div>
    );
};

export default ForgotPassword;
