import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import './Auth.css';

const Auth = () => {
    const { loginWithGoogle, login, signup, resetPassword, currentUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Tabs: 'signin' | 'signup'
    const [activeTab, setActiveTab] = useState('signin');
    
    // Form fields
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [random4, setRandom4] = useState(() => Math.random().toString(36).substring(2, 6).toUpperCase());
    
    // States
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [ageConfirmed, setAgeConfirmed] = useState(false);

    useEffect(() => {
        if (currentUser) {
            navigate('/');
        }
    }, [currentUser, navigate]);

    useEffect(() => {
        if (location.pathname === '/signup') {
            setActiveTab('signup');
        } else {
            setActiveTab('signin');
        }
    }, [location.pathname]);

    const regenerateHandle = () => {
        setRandom4(Math.random().toString(36).substring(2, 6).toUpperCase());
    };

    const handleEmailAuth = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (activeTab === 'signup') {
            if (!ageConfirmed) {
                setError('Please confirm you are 13 or older to create an account.');
                return;
            }
            if (password !== confirmPassword) {
                setError("Passwords do not match");
                return;
            }
            if (password.length < 6) {
                setError("Password needs at least 6 characters");
                return;
            }

            try {
                setLoading(true);
                const handle = `Soul${random4}`;
                await signup(email, password, handle, { anonymousHandle: handle });
                localStorage.setItem('st_age_ok', '1');
                navigate('/');
            } catch (err) {
                console.error("Signup error:", err);
                if (err.code === 'auth/email-already-in-use') {
                    setError('email-already-in-use');
                } else if (err.code === 'auth/weak-password') {
                    setError('Password needs at least 6 characters');
                } else if (err.code === 'auth/invalid-email') {
                    setError('Invalid email address');
                } else {
                    setError(err.message || 'Failed to create account');
                }
            } finally {
                setLoading(false);
            }
        } else {
            try {
                setLoading(true);
                await login(email, password);
                navigate('/');
            } catch (err) {
                console.error("Login error:", err);
                if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
                    setError('Incorrect email or password');
                } else {
                    setError(err.message || 'Failed to sign in');
                }
            } finally {
                setLoading(false);
            }
        }
    };

    const handleGoogleAuth = async () => {
        setError('');
        setMessage('');
        try {
            setGoogleLoading(true);
            const result = await loginWithGoogle();
            if (result?.user) {
                navigate('/');
            }
        } catch (err) {
            console.error('Google auth error:', err);
            if (err.code === 'auth/popup-closed-by-user') {
                return; // Fail silently
            } else if (err.code === 'auth/popup-blocked') {
                setError('Popup was blocked by your browser. Please allow popups.');
            } else {
                setError('Google authentication failed. Please try again.');
            }
        } finally {
            setGoogleLoading(false);
        }
    };

    const handleForgotPasswordSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        try {
            setLoading(true);
            await resetPassword(email);
            setMessage('Recovery link sent! Check your inbox.');
        } catch (err) {
            if (err.code === 'auth/user-not-found') {
                setError('No account found with this email.');
            } else {
                setError('Failed to send reset email: ' + err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-logo-section">
                <h1 className="auth-logo-title">
                    SOUL<span style={{ color: 'rgba(255,255,255,0.7)' }}>THREAD</span>
                </h1>
                <p className="auth-logo-subtitle">
                    A safe space for your mind
                </p>
            </div>

            <div className="auth-container">
                <div className="auth-handle-bar" />

                <div className="auth-tabs">
                    <button 
                        type="button"
                        className={`auth-tab-btn ${activeTab === 'signin' ? 'active' : ''}`}
                        onClick={() => {
                            setActiveTab('signin');
                            setError('');
                            setMessage('');
                            setShowForgotPassword(false);
                        }}
                        disabled={loading || googleLoading}
                    >
                        Sign In
                    </button>
                    <button 
                        type="button"
                        className={`auth-tab-btn ${activeTab === 'signup' ? 'active' : ''}`}
                        onClick={() => {
                            setActiveTab('signup');
                            setError('');
                            setMessage('');
                            setShowForgotPassword(false);
                        }}
                        disabled={loading || googleLoading}
                    >
                        Create Account
                    </button>
                </div>

                {showForgotPassword ? (
                    <form onSubmit={handleForgotPasswordSubmit} className="auth-form">
                        <h2 className="auth-title">Reset Password</h2>
                        <p className="auth-subtitle">Enter your email and we'll send a password recovery link.</p>
                        
                        {error && <div className="auth-inline-error">⚠️ {error}</div>}
                        {message && <div className="auth-inline-success">✅ {message}</div>}

                        <div className="auth-input-group">
                            <label className="auth-label">Email Address</label>
                            <input 
                                type="email" 
                                className="auth-input" 
                                placeholder="you@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>

                        <button type="submit" className="auth-submit-btn" disabled={loading}>
                            {loading ? <span className="spinner-small"></span> : 'Send Recovery Link'}
                        </button>

                        <button 
                            type="button" 
                            className="auth-toggle-link"
                            onClick={() => setShowForgotPassword(false)}
                            disabled={loading}
                        >
                            Back to Sign In
                        </button>
                    </form>
                ) : (
                    <div className="auth-form-wrapper">
                        {/* Google Auth Button (Full width) */}
                        <button 
                            type="button"
                            onClick={handleGoogleAuth} 
                            className="google-auth-btn"
                            disabled={loading || googleLoading}
                        >
                            {googleLoading ? (
                                <span className="spinner-small dark"></span>
                            ) : (
                                <>
                                    <svg className="google-icon" viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                                    </svg>
                                    Continue with Google
                                </>
                            )}
                        </button>

                        <div className="auth-social-divider">
                            <div className="auth-divider-line"></div>
                            <span className="auth-divider-text">or</span>
                            <div className="auth-divider-line"></div>
                        </div>

                        <form onSubmit={handleEmailAuth} className="auth-form" noValidate>
                            {error === 'email-already-in-use' ? (
                                <div className="auth-inline-error">
                                    ⚠️ This email already has an account —{' '}
                                    <button 
                                        type="button" 
                                        className="inline-switch-btn"
                                        onClick={() => {
                                            setActiveTab('signin');
                                            setError('');
                                        }}
                                    >
                                        try signing in
                                    </button>
                                </div>
                            ) : (
                                error && <div className="auth-inline-error">⚠️ {error}</div>
                            )}

                            {message && <div className="auth-inline-success">✅ {message}</div>}

                            <div className="auth-input-group">
                                <label className="auth-label">Email Address</label>
                                <input 
                                    type="email" 
                                    className="auth-input" 
                                    placeholder="you@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={loading || googleLoading}
                                />
                            </div>

                            <div className="auth-input-group">
                                <label className="auth-label">Password</label>
                                <div className="auth-input-wrapper">
                                    <input 
                                        type={showPassword ? 'text' : 'password'} 
                                        className="auth-input" 
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        disabled={loading || googleLoading}
                                    />
                                    <button 
                                        type="button"
                                        className="auth-input-icon"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? '🙈' : '👁️'}
                                    </button>
                                </div>
                            </div>

                            {activeTab === 'signup' && (
                                <>
                                    <div className="auth-input-group">
                                        <label className="auth-label">Confirm Password</label>
                                        <input 
                                            type={showPassword ? 'text' : 'password'} 
                                            className="auth-input" 
                                            placeholder="••••••••"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                            disabled={loading || googleLoading}
                                        />
                                    </div>

                                    <div className="handle-preview-box">
                                        <span className="handle-preview-text">
                                            You'll appear as: <strong>Soul{random4}</strong>
                                        </span>
                                        <button 
                                            type="button" 
                                            className="handle-refresh-btn"
                                            onClick={regenerateHandle}
                                            title="Regenerate handle"
                                            disabled={loading || googleLoading}
                                        >
                                            <RefreshCw size={14} />
                                        </button>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', margin: '12px 0' }}>
                                        <input
                                            type="checkbox"
                                            id="age-confirm"
                                            checked={ageConfirmed}
                                            onChange={e => setAgeConfirmed(e.target.checked)}
                                            style={{ marginTop: '3px', accentColor: 'var(--color-primary)', width: '16px', height: '16px', cursor: 'pointer' }}
                                        />
                                        <label htmlFor="age-confirm" style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.5', cursor: 'pointer' }}>
                                            I confirm I am 13 years of age or older
                                        </label>
                                    </div>
                                </>
                            )}

                            <button 
                                type="submit" 
                                className="auth-submit-btn" 
                                disabled={loading || googleLoading}
                            >
                                {loading ? (
                                    <span className="spinner-small"></span>
                                ) : activeTab === 'signin' ? (
                                    'Sign In'
                                ) : (
                                    'Create Free Account'
                                )}
                            </button>

                            {activeTab === 'signin' && (
                                <button 
                                    type="button" 
                                    className="auth-forgot-link"
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'right', display: 'block', margin: '4px 0 12px auto' }}
                                    onClick={() => setShowForgotPassword(true)}
                                    disabled={loading || googleLoading}
                                >
                                    Forgot password?
                                </button>
                            )}

                            {activeTab === 'signin' ? (
                                <p className="auth-footer" style={{ borderTop: 'none', paddingTop: 0 }}>
                                    New here?{' '}
                                    <button 
                                        type="button" 
                                        className="inline-switch-btn"
                                        onClick={() => {
                                            setActiveTab('signup');
                                            setError('');
                                        }}
                                    >
                                        Create a free account
                                    </button>
                                </p>
                            ) : (
                                <p className="auth-footer" style={{ borderTop: 'none', paddingTop: 0 }}>
                                    Already have an account?{' '}
                                    <button 
                                        type="button" 
                                        className="inline-switch-btn"
                                        onClick={() => {
                                            setActiveTab('signin');
                                            setError('');
                                        }}
                                    >
                                        Sign In
                                    </button>
                                </p>
                            )}
                        </form>
                    </div>
                )}

                {/* Privacy trust message */}
                <div className="auth-trust-message">
                    <span className="lock-icon">🔒</span>
                    <p className="trust-text">
                        Your information stays with you. We never share, sell, or use your personal data. You appear anonymously to everyone on SoulThread.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Auth;
