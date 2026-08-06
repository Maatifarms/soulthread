import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import SEO from '../components/common/SEO';
import { Shield, Sparkles } from 'lucide-react';

export default function Login() {
    const { loginWithGoogle, login, currentUser } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

    useEffect(() => {
        if (currentUser) navigate('/');
    }, [currentUser, navigate]);

    const handleEmailLogin = async (e) => {
        e.preventDefault();
        try {
            setError(''); 
            setLoading(true);
            await login(email.trim(), password);
            navigate('/');
        } catch (err) {
            setError('Incorrect email or password. Please try again.');
        } finally { 
            setLoading(false); 
        }
    };

    const handleGoogleLogin = async () => {
        try {
            setError('');
            setGoogleLoading(true);
            const result = await loginWithGoogle();
            if (result?.user) navigate('/');
        } catch (err) {
            if (err.code === 'auth/popup-closed-by-user') return;
            setError(`Google sign-in failed. Please try again.`);
        } finally {
            setGoogleLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex bg-white font-sans text-[#111827]">
            <SEO title="Log In | SoulThread" description="Log in to your private mental health sanctuary." />

            {/* Left Pane: Editorial Brand (Hidden on Mobile) */}
            <div className="hidden lg:flex w-1/2 bg-[#0A2A1B] text-white flex-col justify-between p-16 relative overflow-hidden">
                {/* Subtle Background Elements */}
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-900/40 rounded-full filter blur-[120px] mix-blend-screen opacity-50 transform translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>

                <div className="relative z-10">
                    <Link to="/" className="text-2xl font-bold tracking-tight text-white hover:opacity-80 transition-opacity">
                        SoulThread
                    </Link>
                </div>

                <div className="relative z-10 max-w-lg">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full backdrop-blur-md border border-white/10 mb-8">
                        <Shield className="w-4 h-4 text-emerald-300" />
                        <span className="text-sm font-medium text-emerald-50 tracking-wide uppercase">100% Private & Secure</span>
                    </div>
                    <h1 className="text-5xl font-normal leading-[1.2] mb-6" style={{ fontFamily: 'Georgia, serif' }}>
                        "Healing is not a linear journey, but you don't have to walk it alone."
                    </h1>
                    <div className="flex items-center gap-4 mt-12">
                        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-emerald-100" />
                        </div>
                        <div>
                            <p className="font-medium text-white text-lg">Welcome back to your sanctuary.</p>
                            <p className="text-emerald-200/80 text-sm">Your safe space awaits.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Pane: Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 bg-white relative">
                
                {/* Mobile Header (Only visible on small screens) */}
                <div className="absolute top-8 left-8 lg:hidden">
                    <Link to="/" className="text-xl font-bold tracking-tight text-[#111827]">
                        SoulThread
                    </Link>
                </div>

                <div className="w-full max-w-md">
                    <div className="mb-10 text-center lg:text-left">
                        <h2 className="text-4xl font-bold tracking-tight mb-3">Welcome back.</h2>
                        <p className="text-gray-500 text-lg">Enter your details to continue your journey.</p>
                    </div>

                    <form onSubmit={handleEmailLogin} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-medium border border-red-100 flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {error}
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

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-semibold text-gray-700 block">Password</label>
                                <Link to="/forgot-password" className="text-sm font-semibold text-[#0A2A1B] hover:underline">
                                    Forgot Password?
                                </Link>
                            </div>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={loading}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0A2A1B] focus:ring-1 focus:ring-[#0A2A1B] transition-all bg-gray-50/50"
                            />
                        </div>

                        <Button 
                            type="submit" 
                            variant="primary" 
                            isLoading={loading} 
                            className="w-full py-4 bg-[#111827] text-white hover:bg-black rounded-xl font-semibold text-lg transition-all shadow-md hover:shadow-lg"
                        >
                            Log In
                        </Button>

                        <div className="relative my-8 flex items-center py-2">
                            <div className="flex-grow border-t border-gray-200"></div>
                            <span className="flex-shrink-0 mx-4 text-gray-400 text-sm font-medium uppercase tracking-wider">Or continue with</span>
                            <div className="flex-grow border-t border-gray-200"></div>
                        </div>

                        <button
                            type="button"
                            onClick={handleGoogleLogin}
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
                                    Sign in with Google
                                </>
                            )}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-gray-500 text-sm">
                        Don't have an account?{' '}
                        <Link to="/signup" className="text-[#0A2A1B] font-semibold hover:underline">
                            Create one here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
