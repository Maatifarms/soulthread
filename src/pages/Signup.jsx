import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { analytics } from '../services/analytics';

import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Card } from '../components/common/Card';
import { Checkbox } from '../components/common/Checkbox'; // We scaffolded this!


const Signup = () => {
    const { signup, loginWithGoogle, currentUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const suggestedId = location.state?.suggestedSoulId || '';

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
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [agreeTerms, setAgreeTerms] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: null }); // Clear error as user types
        }
    };

    const handleGoogleSignup = async () => {
        try {
            setErrors({});
            setGoogleLoading(true);
            const result = await loginWithGoogle();
            if (result?.user) navigate('/');
        } catch (err) {
            if (err.code !== 'auth/popup-closed-by-user') {
                setErrors({ global: 'Google sign-in failed. Please try again.' });
            }
        } finally {
            setGoogleLoading(false);
        }
    };

    const validateForm = () => {
        const newErrors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        
        if (!emailRegex.test(formData.email.trim())) newErrors.email = 'Please enter a valid email address.';
        if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters.';
        if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match.';
        if (!agreeTerms) newErrors.terms = 'You must agree to the Terms of Service.';
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        analytics.logEvent('signup_attempt');
        try {
            setLoading(true);
            const userCredential = await signup(formData.email.trim(), formData.password, formData.name);
            analytics.logEvent('signup_success');
            navigate(`/profile/${userCredential.user.uid}`, { state: { justSignedUp: true } });
        } catch (err) {
            analytics.logEvent('signup_error', { reason: err.code || err.message });
            const friendlyErrors = {
                'auth/email-already-in-use': 'This email is already registered.',
                'auth/invalid-email': 'The email address is not valid.',
                'auth/network-request-failed': 'No internet connection.',
            };
            setErrors({ email: friendlyErrors[err.code] || err.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-logo-section">
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.3 }}>
                    <svg width="80" height="70" viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: '16px' }}>
                        <path d="M60 80 C60 80 20 55 20 32 C20 20 29 12 40 12 C48 12 55 17 60 23 C65 17 72 12 80 12 C91 12 100 20 100 32 C100 55 60 80 60 80Z" fill="white" />
                    </svg>
                </motion.div>
                <h1 className="auth-logo-title" style={{ color: 'white', margin: 0 }}>Join Sanctuary</h1>
                <p className="auth-logo-subtitle" style={{ color: 'rgba(255,255,255,0.8)', marginTop: '8px' }}>Begin your journey to a peaceful mind</p>
            </div>

            <main className="auth-container" style={{ padding: '24px', maxWidth: '450px', margin: '0 auto' }}>
                <Card premium style={{ padding: '32px' }}>
                    <h2 style={{ marginBottom: '8px' }}>Create Account</h2>
                    <p style={{ color: 'var(--color-text-secondary)', marginBottom: '24px' }}>Join our supportive community and find your soul space.</p>

                    {errors.global && (
                        <div style={{ padding: '12px', background: 'var(--st-error, #fef2f2)', color: '#991b1b', borderRadius: '8px', marginBottom: '16px' }}>
                            {errors.global}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <Input
                            label="Soul Name"
                            name="name"
                            placeholder="Your Name (or Pseudonym)"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        />

                        <Input
                            label="Email Address"
                            type="email"
                            name="email"
                            placeholder="you@email.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            disabled={loading}
                            error={errors.email}
                        />

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <Input
                                label="Password"
                                type="password"
                                name="password"
                                placeholder="Min 6 chars"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                disabled={loading}
                                error={errors.password}
                            />
                            <Input
                                label="Confirm"
                                type="password"
                                name="confirmPassword"
                                placeholder="Match password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                disabled={loading}
                                error={errors.confirmPassword}
                            />
                        </div>

                        {/* Since Checkbox is scaffolded as a div in our earlier script, let's just make it a real HTML input wrapper for now inside the design system */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', margin: '8px 0' }}>
                            <input
                                type="checkbox"
                                id="terms"
                                checked={agreeTerms}
                                onChange={(e) => {
                                    setAgreeTerms(e.target.checked);
                                    if (errors.terms) setErrors({ ...errors, terms: null });
                                }}
                                style={{ marginTop: '4px' }}
                            />
                            <label htmlFor="terms" style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                                I agree to the <Link to="/terms" style={{ color: 'var(--color-primary)' }}>Terms of Service</Link> and <Link to="/privacy" style={{ color: 'var(--color-primary)' }}>Privacy Policy</Link>.
                            </label>
                        </div>
                        {errors.terms && <span style={{ color: 'var(--st-error, #ef4444)', fontSize: '12px', marginTop: '-8px' }}>{errors.terms}</span>}

                        <Button type="submit" variant="primary" isLoading={loading} style={{ width: '100%', marginTop: '8px' }}>
                            Sign Up
                        </Button>
                    </form>

                    <div style={{ margin: '24px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }} />
                        <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>or sign up with</span>
                        <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }} />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <Button variant="secondary" onClick={() => navigate('/login/phone')} disabled={loading}>
                            📱 Mobile Number
                        </Button>
                        <Button variant="ghost" onClick={handleGoogleSignup} isLoading={googleLoading} disabled={loading}>
                            Continue with Google
                        </Button>
                    </div>

                    <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px' }}>
                        Already have an account?{' '}
                        <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: '700' }}>
                            Log In
                        </Link>
                    </div>
                </Card>
            </main>
        </div>
    );
};

export default Signup;
