import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

import './Auth.css';

const Login = () => {
    const { loginWithGoogle, login, resetPassword, currentUser } = useAuth();
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

    const [googleLoading, setGoogleLoading] = useState(false);

    const handleGoogleLogin = async () => {
        try {
            setError('');
            setGoogleLoading(true);
            const result = await loginWithGoogle();
            if (result?.user) navigate('/');
        } catch (err) {
            console.error('Google login error:', err.code, err.message);
            if (err.code === 'auth/popup-closed-by-user') {
                // user closed — no message needed
            } else if (err.code === 'auth/popup-blocked') {
                setError('Popup was blocked by your browser. Please allow popups for this site and try again.');
            } else if (err.code === 'auth/unauthorized-domain') {
                setError('This domain is not authorized for Google login. Please contact support.');
            } else if (err.code === 'auth/operation-not-allowed') {
                setError('Google sign-in is not enabled. Please contact support.');
            } else if (err.code === 'auth/network-request-failed') {
                setError('Network error. Check your connection and try again.');
            } else {
                setError(`Google sign-in failed (${err.code || 'unknown'}). Please try again.`);
            }
        } finally {
            setGoogleLoading(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                staggerChildren: 0.1,
                when: "beforeChildren"
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -10 },
        visible: { opacity: 1, x: 0 }
    };

    return (
        <div className="auth-page">
            <div className="auth-logo-section">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 100, damping: 15 }}
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
                <motion.h1 
                    className="auth-logo-title"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    SOUL<span style={{ color: 'rgba(255,255,255,0.7)' }}>THREAD</span>
                </motion.h1>
                <motion.p 
                    className="auth-logo-subtitle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    A safe space for your mind
                </motion.p>
            </div>

            <motion.main 
                className="auth-container"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <div className="auth-handle-bar" />

                <motion.h2 variants={itemVariants} className="auth-title">
                    {showReset ? 'Reset Password' : 'Welcome back 👋'}
                </motion.h2>
                <motion.p variants={itemVariants} className="auth-subtitle">
                    {showReset ? 'We\'ll send a recovery link to your email.' : 'Login to continue your journey.'}
                </motion.p>

                {error && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="auth-alert auth-alert-error">
                        <span>⚠️</span> {error}
                    </motion.div>
                )}
                {message && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="auth-alert auth-alert-success">
                        <span>✅</span> {message}
                    </motion.div>
                )}

                {!showReset ? (
                    <form onSubmit={handleEmailLogin} className="auth-form">
                        <motion.div variants={itemVariants} className="auth-input-group">
                            <label className="auth-label">Email Address</label>
                            <input
                                type="email"
                                placeholder="you@email.com"
                                className="auth-input"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </motion.div>

                        <motion.div variants={itemVariants} className="auth-input-group">
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
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="auth-input-icon"
                                    tabIndex="-1"
                                >
                                    {showPassword ? '🙈' : '👁️'}
                                </button>
                            </div>
                        </motion.div>

                        <motion.button 
                            variants={itemVariants}
                            type="button" 
                            onClick={() => setShowReset(true)}
                            className="auth-forgot-link"
                            disabled={loading}
                        >
                            Forgot Password?
                        </motion.button>

                        <motion.button
                            variants={itemVariants}
                            type="submit"
                            disabled={loading}
                            className="auth-submit-btn"
                            whileTap={{ scale: 0.98 }}
                        >
                            {loading ? (
                                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                    <span className="spinner-small" /> Logging in...
                                </span>
                            ) : 'Log In'}
                        </motion.button>
                    </form>
                ) : (
                    <form onSubmit={handleResetPassword} className="auth-form">
                        <motion.div variants={itemVariants} className="auth-input-group">
                            <label className="auth-label">Email Address</label>
                            <input
                                type="email"
                                placeholder="Enter your registered email"
                                className="auth-input"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </motion.div>
                        <motion.button 
                            variants={itemVariants}
                            type="submit" 
                            disabled={loading} 
                            className="auth-submit-btn"
                            whileTap={{ scale: 0.98 }}
                        >
                            {loading ? 'Sending...' : '📧 Send Reset Link'}
                        </motion.button>
                        <motion.button 
                            variants={itemVariants}
                            type="button" 
                            onClick={() => { setShowReset(false); setError(''); setMessage(''); }}
                            className="auth-forgot-link"
                            style={{ alignSelf: 'center', marginTop: '12px' }}
                            disabled={loading}
                        >
                            ← Back to Login
                        </motion.button>
                    </form>
                )}

                {!showReset && (
                    <motion.div variants={itemVariants}>
                        <div className="auth-social-divider">
                            <div className="auth-divider-line" />
                            <span className="auth-divider-text">or continue with</span>
                            <div className="auth-divider-line" />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <button
                                onClick={() => navigate('/login/phone')}
                                className="auth-phone-btn"
                                disabled={loading}
                            >
                                <span>📱</span> Mobile Number
                            </button>

                            <button
                                onClick={handleGoogleLogin}
                                disabled={googleLoading || loading}
                                className="auth-google-btn"
                            >
                                {googleLoading ? (
                                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                        <span className="spinner-small" /> Signing in...
                                    </span>
                                ) : (
                                    <>
                                        <svg width="20" height="20" viewBox="0 0 48 48">
                                            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                                            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                                            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                                            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                                        </svg>
                                        Continue with Google
                                    </>
                                )}
                            </button>
                        </div>

                        <div style={{ textAlign: 'center', margin: '24px 0' }}>
                            <Link to="/care" className="auth-help-pill">
                                🆘 Need help? Find Support
                            </Link>
                        </div>

                        <div className="auth-footer">
                            New to SoulThread?{' '}
                            <Link to="/signup" className="auth-footer-link">
                                Create Account
                            </Link>
                        </div>
                    </motion.div>
                )}
            </motion.main>
        </div>
    );
};

export default Login;
