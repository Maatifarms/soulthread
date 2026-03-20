import React, { useEffect, useState } from 'react';
import { auth } from '../services/firebase';
import { getRedirectResult } from 'firebase/auth';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { motion } from 'framer-motion';

import './Auth.css';

const Login = () => {
    const { loginWithGoogle, loginAnonymously, login, resetPassword, currentUser } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [showReset, setShowReset] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (currentUser) navigate('/');
    }, [currentUser, navigate]);

    useEffect(() => {
        if (currentUser) navigate('/');
    }, [currentUser, navigate]);


    const handleEmailLogin = async (e) => {
        e.preventDefault();
        try {
            setError(''); setMessage(''); setLoading(true);
            await login(email.trim(), password);
            navigate('/');
        } catch (err) {
            setError('Incorrect email or password. Please try again.');
        } finally { setLoading(false); }
    };

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

    const handleGoogleLogin = async () => {
        try {
            setError('');
            await loginWithGoogle();
            navigate('/');
        } catch (error) {
            if (error.code !== 'auth/popup-closed-by-user') {
                setError('Google login failed. Please try again.');
            }
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-logo-section">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <svg width="120" height="100" viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: '16px' }}>
                        <path d="M60 80 C60 80 20 55 20 32 C20 20 29 12 40 12 C48 12 55 17 60 23 C65 17 72 12 80 12 C91 12 100 20 100 32 C100 55 60 80 60 80Z" fill="white" />
                        <motion.path 
                            d="M38 28 C38 28 42 20 50 24 C58 28 52 36 58 38 C64 40 68 34 72 32" 
                            stroke="#3d7a72" 
                            strokeWidth="3.5" 
                            strokeLinecap="round" 
                            fill="none"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1.5, delay: 0.5 }}
                        />
                    </svg>
                </motion.div>
                <h1 className="auth-logo-title">
                    SOUL<span style={{ color: 'rgba(255,255,255,0.7)' }}>THREAD</span>
                </h1>
                <p className="auth-logo-subtitle">A safe space for your mind</p>
            </div>

            <main className="auth-container">
                <div className="auth-handle-bar" />

                <h2 className="auth-title">
                    {showReset ? 'Reset Password' : 'Welcome back 👋'}
                </h2>
                <p className="auth-subtitle">
                    {showReset ? 'We\'ll send a recovery link to your email.' : 'Login to continue your journey.'}
                </p>

                {error && (
                    <div className="auth-alert auth-alert-error">
                        <span>⚠️</span> {error}
                    </div>
                )}
                {message && (
                    <div className="auth-alert auth-alert-success">
                        <span>✅</span> {message}
                    </div>
                )}

                {!showReset ? (
                    <form onSubmit={handleEmailLogin} className="auth-form">
                        <div className="auth-input-group">
                            <label className="auth-label">Email Address</label>
                            <input
                                type="email"
                                placeholder="you@email.com"
                                className="auth-input"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="auth-input-group">
                            <label className="auth-label">Password</label>
                            <div className="auth-input-wrapper">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    className="auth-input"
                                    style={{ paddingRight: '50px' }}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="auth-input-icon"
                                >
                                    {showPassword ? '🙈' : '👁️'}
                                </button>
                            </div>
                        </div>

                        <button 
                            type="button" 
                            onClick={() => setShowReset(true)}
                            className="auth-forgot-link"
                        >
                            Forgot Password?
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="auth-submit-btn"
                        >
                            {loading ? '🔐 Logging In...' : 'Log In'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleResetPassword} className="auth-form">
                        <div className="auth-input-group">
                            <label className="auth-label">Email Address</label>
                            <input
                                type="email"
                                placeholder="Enter your registered email"
                                className="auth-input"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" disabled={loading} className="auth-submit-btn">
                            {loading ? 'Sending...' : '📧 Send Reset Link'}
                        </button>
                        <button 
                            type="button" 
                            onClick={() => { setShowReset(false); setError(''); setMessage(''); }}
                            className="auth-forgot-link"
                            style={{ alignSelf: 'center', marginTop: '12px' }}
                        >
                            ← Back to Login
                        </button>
                    </form>
                )}

                {!showReset && (
                    <>
                        <div className="auth-social-divider">
                            <div className="auth-divider-line" />
                            <span className="auth-divider-text">or continue with</span>
                            <div className="auth-divider-line" />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <button
                                onClick={() => navigate('/login/phone')}
                                className="auth-phone-btn"
                            >
                                <span>📱</span> Mobile Number
                            </button>

                            <button
                                onClick={handleGoogleLogin}
                                className="auth-google-btn"
                            >
                                <svg width="20" height="20" viewBox="0 0 48 48">
                                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                                </svg>
                                Google
                            </button>
                        </div>

                        <div style={{ textAlign: 'center', margin: '24px 0' }}>
                            <a href="/care" className="auth-help-pill">
                                🆘 Need help? Find Support
                            </a>
                        </div>

                        <div className="auth-footer">
                            New to SoulThread?{' '}
                            <Link to="/signup" className="auth-footer-link">
                                Create Account
                            </Link>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

export default Login;
