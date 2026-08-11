import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { RefreshCw, Eye, EyeOff, Shield, Sparkles } from 'lucide-react';
import SEO from '../components/common/SEO';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';

export default function Auth() {
    const { loginWithGoogle, login, signup, resetPassword, currentUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Mode: 'signin' | 'signup' | 'forgot'
    const [mode, setMode] = useState('signup');

    // Form state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [random4, setRandom4] = useState(() => Math.random().toString(36).substring(2, 6).toUpperCase());
    const [showPassword, setShowPassword] = useState(false);
    const [ageConfirmed, setAgeConfirmed] = useState(false);

    // Status state
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const redirectTarget = location.state?.from
        ? `${location.state.from.pathname}${location.state.from.search || ''}`
        : '/';

    useEffect(() => {
        if (currentUser) {
            navigate(redirectTarget, { replace: true });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUser, navigate]);

    useEffect(() => {
        if (location.pathname === '/signin') {
            navigate('/login', { replace: true });
            return;
        }
        if (location.pathname === '/login') {
            setMode('signin');
        } else if (location.pathname === '/forgot-password') {
            setMode('forgot');
        } else {
            setMode('signup');
        }
    }, [location.pathname, navigate]);

    const regenerateHandle = () => {
        setRandom4(Math.random().toString(36).substring(2, 6).toUpperCase());
    };

    const handleAuth = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (mode === 'forgot') {
            try {
                setLoading(true);
                await resetPassword(email);
                setMessage('Recovery link sent! Check your inbox.');
            } catch (err) {
                setError(err.code === 'auth/user-not-found' ? 'No account found with this email.' : err.message);
            } finally {
                setLoading(false);
            }
            return;
        }

        if (mode === 'signin') {
            try {
                setLoading(true);
                await login(email, password);
                // Redirect is handled by the currentUser effect above (honors ?from).
            } catch (err) {
                if (['auth/invalid-credential', 'auth/wrong-password', 'auth/user-not-found'].includes(err.code)) {
                    setError('Incorrect email or password.');
                } else {
                    setError(err.message || 'Failed to log in');
                }
            } finally {
                setLoading(false);
            }
            return;
        }

        if (mode === 'signup') {
            if (!ageConfirmed) {
                setError('Please confirm you are 13 or older to create an account.');
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
                navigate('/onboarding');
            } catch (err) {
                if (err.code === 'auth/email-already-in-use') setError('Email is already in use. Please log in.');
                else setError(err.message || 'Failed to create account');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleGoogleAuth = async () => {
        try {
            setError('');
            setGoogleLoading(true);
            const result = await loginWithGoogle();
            if (result?.user) navigate('/onboarding');
        } catch (err) {
            if (err.code === 'auth/popup-closed-by-user') return;
            setError(`Google authentication failed. Please try again.`);
        } finally {
            setGoogleLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex bg-white font-sans text-[#111827]">
            <SEO title={mode === 'signup' ? "Join SoulThread | Anonymous Mental Health" : "Reset Password"} description="Create your private, anonymous sanctuary." />

            {/* Left Pane: Editorial Brand (Hidden on Mobile) */}
            <div className="hidden lg:flex w-1/2 bg-[#0A2A1B] text-white flex-col justify-between p-16 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-emerald-900/40 rounded-full filter blur-[120px] mix-blend-screen opacity-50 transform -translate-x-1/4 -translate-y-1/4 pointer-events-none"></div>

                <div className="relative z-10">
                    <Link to="/" className="text-2xl font-bold tracking-tight text-white hover:opacity-80 transition-opacity">
                        SoulThread
                    </Link>
                </div>

                <div className="relative z-10 max-w-lg">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full backdrop-blur-md border border-white/10 mb-8">
                        <Shield className="w-4 h-4 text-emerald-300" />
                        <span className="text-sm font-medium text-emerald-50 tracking-wide uppercase">Your Identity is Protected</span>
                    </div>
                    <h1 className="text-5xl font-normal leading-[1.2] mb-6" style={{ fontFamily: 'Georgia, serif' }}>
                        "A space where you don't have to pretend everything is okay."
                    </h1>
                    <div className="flex items-center gap-4 mt-12">
                        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-emerald-100" />
                        </div>
                        <div>
                            <p className="font-medium text-white text-lg">Join a community of healing.</p>
                            <p className="text-emerald-200/80 text-sm">No real names. No judgment.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Pane: Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 bg-white relative">
                
                {/* Mobile Header */}
                <div className="absolute top-8 left-8 lg:hidden">
                    <Link to="/" className="text-xl font-bold tracking-tight text-[#111827]">
                        SoulThread
                    </Link>
                </div>

                <div className="w-full max-w-md">
                    <div className="mb-10 text-center lg:text-left mt-12 lg:mt-0">
                        <h2 className="text-4xl font-bold tracking-tight mb-3">
                            {mode === 'signup' ? 'Create your sanctuary.' : mode === 'signin' ? 'Welcome back.' : 'Reset Password'}
                        </h2>
                        <p className="text-gray-500 text-lg">
                            {mode === 'signup'
                                ? 'Start your path to better mental health.'
                                : mode === 'signin'
                                    ? 'Log in to continue your journey.'
                                    : 'We will send you instructions to reset your password.'}
                        </p>
                    </div>

                    <form onSubmit={handleAuth} className="space-y-6">
                        {location.state?.authPrompt && (
                            <div className="bg-blue-50 text-blue-700 px-4 py-3 rounded-xl text-sm font-medium border border-blue-100">
                                {location.state.authPrompt}
                            </div>
                        )}
                        {error && (
                            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-medium border border-red-100 flex items-start gap-2">
                                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{error}</span>
                            </div>
                        )}
                        {message && (
                            <div className="bg-green-50 text-green-600 px-4 py-3 rounded-xl text-sm font-medium border border-green-100">
                                {message}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 block">Email Address</label>
                            <Input
                                type="email"
                                placeholder="you@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0A2A1B] focus:ring-1 focus:ring-[#0A2A1B] transition-all bg-gray-50/50"
                            />
                        </div>

                        {(mode === 'signup' || mode === 'signin') && (
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 block">Password</label>
                                <div className="relative">
                                    <Input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder={mode === 'signup' ? 'Min. 6 characters' : 'Your password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        disabled={loading}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0A2A1B] focus:ring-1 focus:ring-[#0A2A1B] transition-all bg-gray-50/50"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none p-1"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {mode === 'signin' && (
                                    <p className="text-right">
                                        <Link to="/forgot-password" className="text-sm text-[#0A2A1B] font-medium hover:underline">
                                            Forgot password?
                                        </Link>
                                    </p>
                                )}
                            </div>
                        )}

                        {mode === 'signup' && (
                            <>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 block">Your Anonymous Handle</label>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 px-4 py-3 bg-gray-100 text-gray-500 rounded-xl font-medium border border-gray-200">
                                            @Soul{random4}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={regenerateHandle}
                                            className="p-3 text-gray-500 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors"
                                            title="Regenerate handle"
                                        >
                                            <RefreshCw className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500">Your real name is never shown to the community.</p>
                                </div>

                                <div className="flex items-start gap-3 mt-4">
                                    <div className="flex items-center h-5">
                                        <input
                                            id="age-confirm"
                                            type="checkbox"
                                            checked={ageConfirmed}
                                            onChange={(e) => setAgeConfirmed(e.target.checked)}
                                            className="w-4 h-4 text-[#0A2A1B] bg-gray-100 border-gray-300 rounded focus:ring-[#0A2A1B] focus:ring-2"
                                        />
                                    </div>
                                    <label htmlFor="age-confirm" className="text-sm text-gray-600">
                                        I confirm I am 13 years of age or older, and agree to the <Link to="/terms" className="text-[#0A2A1B] underline">Terms</Link> and <Link to="/privacy" className="text-[#0A2A1B] underline">Privacy Policy</Link>.
                                    </label>
                                </div>
                            </>
                        )}

                        <Button 
                            type="submit" 
                            variant="primary" 
                            isLoading={loading} 
                            className="w-full py-4 bg-[#111827] text-white hover:bg-black rounded-xl font-semibold text-lg transition-all shadow-md hover:shadow-lg mt-4"
                        >
                            {mode === 'signup' ? 'Create Account' : mode === 'signin' ? 'Log In' : 'Send Recovery Link'}
                        </Button>

                        {(mode === 'signup' || mode === 'signin') && (
                            <>
                                <div className="relative my-8 flex items-center py-2">
                                    <div className="flex-grow border-t border-gray-200"></div>
                                    <span className="flex-shrink-0 mx-4 text-gray-400 text-sm font-medium uppercase tracking-wider">Or continue with</span>
                                    <div className="flex-grow border-t border-gray-200"></div>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleGoogleAuth}
                                    disabled={googleLoading || loading}
                                    className="w-full flex items-center justify-center gap-3 px-4 py-4 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 text-gray-700 font-semibold transition-all shadow-sm"
                                >
                                    {googleLoading ? (
                                        <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></span>
                                    ) : (
                                        <>
                                            <svg viewBox="0 0 24 24" className="w-5 h-5">
                                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                            </svg>
                                            {mode === 'signup' ? 'Sign up with Google' : 'Continue with Google'}
                                        </>
                                    )}
                                </button>
                            </>
                        )}
                    </form>

                    <p className="mt-8 text-center text-gray-500 text-sm">
                        {mode === 'signup' ? (
                            <>
                                Already have an account?{' '}
                                <Link to="/login" className="text-[#0A2A1B] font-semibold hover:underline">
                                    Log in here
                                </Link>
                            </>
                        ) : mode === 'signin' ? (
                            <>
                                Don't have an account?{' '}
                                <Link to="/signup" className="text-[#0A2A1B] font-semibold hover:underline">
                                    Sign up here
                                </Link>
                            </>
                        ) : (
                            <>
                                Remember your password?{' '}
                                <Link to="/login" className="text-[#0A2A1B] font-semibold hover:underline">
                                    Log in here
                                </Link>
                            </>
                        )}
                    </p>
                </div>
            </div>
        </div>
    );
}
