import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

import './Auth.css';

const PhoneLogin = () => {
    const { sendOTP, verifyOTP } = useAuth();
    const navigate = useNavigate();

    const [step, setStep] = useState('phone'); // 'phone' | 'otp'
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [countdown, setCountdown] = useState(0);
    const otpRefs = useRef([]);

    const startCountdown = () => {
        setCountdown(60);
        const interval = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) { clearInterval(interval); return 0; }
                return prev - 1;
            });
        }, 1000);
    };

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setError('');
        const cleanPhone = phone.replace(/\D/g, '');
        const last10 = cleanPhone.slice(-10);
        const fullPhone = '+91' + last10;
        if (fullPhone.length !== 13) {
            setError('Please enter a valid 10-digit mobile number.');
            return;
        }
        setLoading(true);
        try {
            await sendOTP(fullPhone, 'recaptcha-container');
            setStep('otp');
            startCountdown();
        } catch (err) {
            if (err.code === 'auth/too-many-requests') {
                setError('Too many attempts. Please wait a few minutes.');
            } else {
                setError('Failed to send OTP. Try again.');
            }
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (index, value) => {
        if (!/^\d?$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        if (value && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        const code = otp.join('');
        if (code.length !== 6) {
            setError('Please enter the complete 6-digit OTP.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const { isNewUser } = await verifyOTP(code);
            if (isNewUser) {
                navigate('/onboarding');
            } else {
                navigate('/');
            }
        } catch (err) {
            if (err.code === 'auth/invalid-verification-code') {
                setError('Invalid OTP. Please check and try again.');
            } else {
                setError('Verification failed. Try again.');
            }
            console.error(err);
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
                staggerChildren: 0.1,
                when: "beforeChildren"
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -10 },
        visible: { opacity: 1, x: 0 }
    };

    useEffect(() => {
        if (step === 'otp') {
            otpRefs.current[0]?.focus();
        }
    }, [step]);

    return (
        <div className="auth-page">
            <div id="recaptcha-container"></div>
            
            <div className="auth-logo-section">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0, rotate: -15 }}
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
                    style={{ fontSize: '30px' }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    Phone Entry
                </motion.h1>
                <motion.p 
                    className="auth-logo-subtitle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    Secure access to your sanctuary
                </motion.p>
            </div>

            <motion.main 
                className="auth-container" 
                style={{ maxWidth: '440px' }}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <div className="auth-handle-bar" />

                <motion.h2 variants={itemVariants} className="auth-title">
                    {step === 'phone' ? 'Login with Number' : 'Verify Identity'}
                </motion.h2>
                <motion.p variants={itemVariants} className="auth-subtitle">
                    {step === 'phone' 
                        ? 'We\'ll send a one-time passcode to your mobile.' 
                        : `Enter the code sent to ${phone.slice(0, 5)} ${phone.slice(5)}`}
                </motion.p>

                {error && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="auth-alert auth-alert-error">
                        <span>⚠️</span> {error}
                    </motion.div>
                )}

                {step === 'phone' ? (
                    <form onSubmit={handleSendOTP} className="auth-form">
                        <motion.div variants={itemVariants} className="auth-input-group">
                            <label className="auth-label">Mobile Number</label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <div style={{ 
                                    padding: '16px 14px', 
                                    background: 'var(--color-primary-soft)', 
                                    borderRadius: 'var(--radius-md)',
                                    border: '1.5px solid var(--color-primary-light)',
                                    fontWeight: '800',
                                    color: 'var(--color-primary-dark)',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}>
                                    🇮🇳 +91
                                </div>
                                <input
                                    type="tel"
                                    placeholder="00000 00000"
                                    className="auth-input"
                                    value={phone}
                                    onChange={e => {
                                        const val = e.target.value.replace(/\D/g, '');
                                        setPhone(val.length > 10 ? val.slice(-10) : val);
                                    }}
                                    maxLength={10}
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </motion.div>
                        <motion.button 
                            variants={itemVariants}
                            type="submit" 
                            disabled={loading || phone.length !== 10} 
                            className="auth-submit-btn"
                            whileTap={{ scale: 0.98 }}
                        >
                            {loading ? (
                                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                    <span className="spinner-small" /> Sending...
                                </span>
                            ) : 'Request Code →'}
                        </motion.button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOTP} className="auth-form">
                        <motion.div variants={itemVariants} className="auth-input-group" style={{ marginBottom: '12px' }}>
                            <label className="auth-label" style={{ textAlign: 'center', display: 'block' }}>Enter 6-Digit Code</label>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '8px' }}>
                                {otp.map((digit, idx) => (
                                    <input
                                        key={idx}
                                        ref={el => otpRefs.current[idx] = el}
                                        type="tel"
                                        maxLength={1}
                                        value={digit}
                                        onChange={e => handleOtpChange(idx, e.target.value)}
                                        onKeyDown={e => handleOtpKeyDown(idx, e)}
                                        className="auth-input"
                                        disabled={loading}
                                        style={{ 
                                            width: '46px', 
                                            height: '56px', 
                                            textAlign: 'center', 
                                            fontSize: '22px', 
                                            fontWeight: '800',
                                            padding: '0',
                                            borderRadius: 'var(--radius-sm)',
                                            borderColor: digit ? 'var(--color-primary)' : 'var(--color-border)'
                                        }}
                                    />
                                ))}
                            </div>
                        </motion.div>
                        
                        <motion.button 
                            variants={itemVariants}
                            type="submit" 
                            disabled={loading || otp.join('').length !== 6} 
                            className="auth-submit-btn"
                            whileTap={{ scale: 0.98 }}
                        >
                            {loading ? (
                                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                    <span className="spinner-small" /> Verifying...
                                </span>
                            ) : 'Complete Access ✓'}
                        </motion.button>

                        <motion.button
                            variants={itemVariants}
                            type="button"
                            disabled={countdown > 0 || loading}
                            onClick={() => { setOtp(['', '', '', '', '', '']); setStep('phone'); setError(''); }}
                            className="auth-forgot-link"
                            style={{ alignSelf: 'center', marginTop: '16px', opacity: countdown > 0 ? 0.7 : 1 }}
                        >
                            {countdown > 0 ? `Resend available in ${countdown}s` : 'Try again / Resend Code'}
                        </motion.button>
                    </form>
                )}

                <motion.div variants={itemVariants} className="auth-footer" style={{ marginTop: '32px' }}>
                    <Link to="/login" className="auth-footer-link" style={{ fontSize: '14px' }}>
                        ← Back to other options
                    </Link>
                </motion.div>
            </motion.main>
        </div>
    );
};

export default PhoneLogin;
