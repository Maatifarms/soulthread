import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { analytics } from '../services/analytics';
import AuthStepIndicator from '../components/auth/AuthStepIndicator';

import './Auth.css';

const Signup = () => {
    const { signup, loginWithGoogle, currentUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const suggestedId = location.state?.suggestedSoulId || '';

    // Redirect already-logged-in users
    useEffect(() => {
        if (currentUser) navigate('/');
    }, [currentUser, navigate]);

    useEffect(() => {
        analytics.logEvent('signup_view');
    }, []);

    const [googleLoading, setGoogleLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: suggestedId || '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [agreeTerms, setAgreeTerms] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleGoogleSignup = async () => {
        try {
            setError('');
            setGoogleLoading(true);
            const result = await loginWithGoogle();
            if (result?.user) navigate('/');
        } catch (err) {
            if (err.code !== 'auth/popup-closed-by-user') {
                setError('Google sign-in failed. Please try again.');
            }
        } finally {
            setGoogleLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!agreeTerms) {
            return setError('You must agree to the Terms of Service and Privacy Policy to register.');
        }

        // Email format validation — Firebase accepts syntactically valid emails even if they don't exist
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        if (!emailRegex.test(formData.email.trim())) {
            return setError('Please enter a valid email address (e.g. name@example.com).');
        }

        if (formData.password !== formData.confirmPassword) {
            return setError('Passwords do not match');
        }
        if (formData.password.length < 6) {
            return setError('Password should be at least 6 characters');
        }

        analytics.logEvent('signup_attempt');

        try {
            setError('');
            setLoading(true);
            const userCredential = await signup(formData.email, formData.password, formData.name);
            analytics.logEvent('signup_success');
            navigate(`/profile/${userCredential.user.uid}`, { state: { justSignedUp: true } });
        } catch (err) {
            console.error(err);
            analytics.logEvent('signup_error', { reason: err.code || err.message });
            // Translate Firebase error codes into human-readable messages
            const friendlyErrors = {
                'auth/email-already-in-use': 'An account with this email already exists. Try signing in instead.',
                'auth/invalid-email': 'The email address is not valid.',
                'auth/weak-password': 'Password is too weak. Use at least 6 characters.',
                'auth/network-request-failed': 'No internet connection. Please check your network and try again.',
            };
            setError(friendlyErrors[err.code] || 'Failed to create an account. ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                staggerChildren: 0.08,
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
                    initial={{ scale: 0.8, opacity: 0, rotate: 10 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 100, damping: 15 }}
                >
                    <svg width="80" height="70" viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: '12px' }}>
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
                    style={{ fontSize: '32px' }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    Join Sanctuary
                </motion.h1>
                <motion.p 
                    className="auth-logo-subtitle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    Begin your journey to a peaceful mind
                </motion.p>
            </div>

            <motion.main 
                className="auth-container"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <div className="auth-handle-bar" />

                <motion.h2 variants={itemVariants} className="auth-title">Create Account</motion.h2>
                <motion.p variants={itemVariants} className="auth-subtitle">Join our supportive community and find your soul space.</motion.p>

                {error && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="auth-alert auth-alert-error">
                        <span>⚠️</span> {error}
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className="auth-form" noValidate>
                    <motion.div variants={itemVariants} className="auth-input-group">
                        <label className="auth-label">Soul Name</label>
                        <input
                            type="text"
                            name="name"
                            placeholder="Your Name (or Pseudonym)"
                            className="auth-input"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        />
                    </motion.div>

                    <motion.div variants={itemVariants} className="auth-input-group">
                        <label className="auth-label">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="you@email.com"
                            className="auth-input"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        />
                    </motion.div>

                    <motion.div variants={itemVariants} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div className="auth-input-group">
                            <label className="auth-label">Password</label>
                            <input
                                type="password"
                                name="password"
                                placeholder="Min 6 chars"
                                className="auth-input"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                disabled={loading}
                            />
                        </div>
                        <div className="auth-input-group">
                            <label className="auth-label">Confirm</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                placeholder="Match password"
                                className="auth-input"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                disabled={loading}
                            />
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="auth-checkbox-group" style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', margin: '18px 0', paddingLeft: '4px' }}>
                        <input
                            type="checkbox"
                            id="termsAccept"
                            checked={agreeTerms}
                            onChange={(e) => setAgreeTerms(e.target.checked)}
                            required
                            style={{ 
                                marginTop: '3px',
                                width: '16px',
                                height: '16px',
                                accentColor: '#3d7a72',
                                cursor: 'pointer'
                            }}
                        />
                        <label htmlFor="termsAccept" style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.4', cursor: 'pointer', textAlign: 'left' }}>
                            I agree to the <Link to="/terms" style={{ color: 'var(--color-primary)', fontWeight: '700', textDecoration: 'underline' }}>Terms of Service</Link> and <Link to="/privacy" style={{ color: 'var(--color-primary)', fontWeight: '700', textDecoration: 'underline' }}>Privacy Policy</Link>.
                        </label>
                    </motion.div>

                    <motion.button
                        variants={itemVariants}
                        type="submit"
                        disabled={loading}
                        className="auth-submit-btn"
                        whileTap={{ scale: 0.98 }}
                    >
                        {loading ? (
                            <AuthStepIndicator steps={["Creating secure profile...", "Generating anonymous ID...", "Opening sanctuary..."]} />
                        ) : 'Sign Up'}
                    </motion.button>
                </form>

                <div className="auth-social-divider" style={{ margin: '0 0 16px' }}>
                    <div className="auth-divider-line" />
                    <span className="auth-divider-text">or sign up with</span>
                    <div className="auth-divider-line" />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                    <button
                        onClick={() => navigate('/login/phone')}
                        className="auth-phone-btn"
                        disabled={loading}
                    >
                        <span>📱</span> Mobile Number
                    </button>

                    <button
                        onClick={handleGoogleSignup}
                        disabled={googleLoading || loading}
                        className="auth-google-btn"
                    >
                        {googleLoading ? (
                            <AuthStepIndicator steps={["Connecting to Google...", "Verifying identity...", "Creating Soul..."]} />
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

                <div className="auth-footer">
                    Already have an account?{' '}
                    <Link to="/login" className="auth-footer-link">
                        Log In
                    </Link>
                </div>
            </motion.main>
        </div>
    );
};

export default Signup;
