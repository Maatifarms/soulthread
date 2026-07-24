// GuideLogin.jsx — Login screen for SoulThread Pro
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function GuideLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleEmail = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle();
      navigate('/dashboard');
    } catch (err) {
      setError('Google sign-in failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '32px 20px', background: 'var(--color-background)'
    }}>
      <div style={{ width: '100%', maxWidth: '360px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '14px',
            background: 'var(--color-primary)', color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '22px', fontWeight: '800', margin: '0 auto 12px'
          }}>ST</div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', margin: 0 }}>SoulThread Pro</h1>
          <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            Psychologist workspace
          </p>
        </div>

        {/* Google Sign In */}
        <button onClick={handleGoogle} disabled={loading} style={{
          width: '100%', padding: '13px', borderRadius: '12px',
          border: '1.5px solid var(--color-border)', background: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '10px', fontSize: '15px', fontWeight: '600', cursor: 'pointer',
          marginBottom: '16px', color: '#333'
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '4px 0 16px' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
          <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>or</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
        </div>

        {/* Email form */}
        <form onSubmit={handleEmail}>
          <input type="email" placeholder="Email" value={email}
            onChange={e => setEmail(e.target.value)} required
            style={{
              width: '100%', padding: '13px 14px', borderRadius: '10px', marginBottom: '10px',
              border: '1.5px solid var(--color-border)', fontSize: '15px',
              background: 'var(--color-surface)', color: 'var(--color-text-primary)',
              boxSizing: 'border-box'
            }} />
          <input type="password" placeholder="Password" value={password}
            onChange={e => setPassword(e.target.value)} required
            style={{
              width: '100%', padding: '13px 14px', borderRadius: '10px', marginBottom: '16px',
              border: '1.5px solid var(--color-border)', fontSize: '15px',
              background: 'var(--color-surface)', color: 'var(--color-text-primary)',
              boxSizing: 'border-box'
            }} />
          {error && (
            <p style={{ color: 'var(--color-error)', fontSize: '13px', marginBottom: '12px' }}>{error}</p>
          )}
          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
            background: 'var(--color-primary)', color: 'white',
            fontSize: '15px', fontWeight: '700', cursor: 'pointer',
            opacity: loading ? 0.6 : 1
          }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '24px' }}>
          Need access? Contact{' '}
          <a href="mailto:support@soulthread.in" style={{ color: 'var(--color-primary)' }}>
            support@soulthread.in
          </a>
        </p>
      </div>
    </div>
  );
}
