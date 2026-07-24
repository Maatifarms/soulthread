// app-guide/App.jsx — Routes for SoulThread Pro (psychologist app)
import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Loading from '../components/common/Loading';
import ScrollToTop from '../components/common/ScrollToTop';
import { useAuth } from '../contexts/AuthContext';
import { Capacitor } from '@capacitor/core';
import { markAppLaunch } from '../services/performanceMonitor';

const GuideLogin     = lazy(() => import('./pages/GuideLogin'));
const GuideDashboard = lazy(() => import('../pages/GuideDashboard'));
const GuideProfile   = lazy(() => import('../pages/Profile'));
const Notifications  = lazy(() => import('../pages/Notifications'));
const Crisis         = lazy(() => import('../pages/Crisis'));
const Privacy        = lazy(() => import('../pages/Privacy'));
const Terms          = lazy(() => import('../pages/Terms'));
const NotFound       = lazy(() => import('../pages/NotFound'));
const Chat           = lazy(() => import('../pages/Chat'));

// Simple bottom nav for the guide app — 4 tabs only
function GuideNav() {
  const { pathname } = useLocation();
  const { currentUser } = useAuth();
  if (!currentUser) return null;

  const tabs = [
    { to: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { to: '/bookings',  label: 'Bookings',  icon: '📅' },
    { to: '/messages',  label: 'Messages',  icon: '💬' },
    { to: '/activity',  label: 'Get Support',  icon: '🔔' },
    { to: `/profile/${currentUser.uid}`, label: 'Me', icon: '👤' },
  ];

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, height: '64px',
      background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)',
      display: 'flex', alignItems: 'center', zIndex: 100
    }}>
      {tabs.map(tab => {
        const active = pathname === tab.to || pathname.startsWith(tab.to + '/');
        return (
          <a key={tab.to} href={tab.to} style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: '2px', textDecoration: 'none', padding: '8px 0',
            color: active ? 'var(--color-primary)' : 'var(--color-text-muted)',
            fontSize: '10px', fontWeight: active ? '700' : '500'
          }}>
            <span style={{ fontSize: '20px' }}>{tab.icon}</span>
            {tab.label}
          </a>
        );
      })}
    </nav>
  );
}

function RequireAuth({ children }) {
  const { currentUser, loading } = useAuth();
  if (loading) return <Loading />;
  if (!currentUser) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  useEffect(() => {
    markAppLaunch();
    document.body.classList.add(
      Capacitor.isNativePlatform() ? 'native-app' : 'web-app'
    );
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <Suspense fallback={<Loading />}>
        <GuideNav />
        <div style={{ paddingBottom: '72px' }}>
          <Routes>
            <Route path="/login"     element={<GuideLogin />} />
            <Route path="/dashboard" element={<RequireAuth><GuideDashboard /></RequireAuth>} />
            <Route path="/bookings"  element={<RequireAuth><GuideDashboard tab="bookings" /></RequireAuth>} />
            <Route path="/activity"  element={<RequireAuth><Notifications /></RequireAuth>} />
            <Route path="/messages"  element={<RequireAuth><Chat /></RequireAuth>} />
            <Route path="/messages/:chatId" element={<RequireAuth><Chat /></RequireAuth>} />
            <Route path="/profile/:userId" element={<RequireAuth><GuideProfile /></RequireAuth>} />
            <Route path="/crisis"    element={<Crisis />} />
            <Route path="/privacy"   element={<Privacy />} />
            <Route path="/terms"     element={<Terms />} />
            <Route path="/"          element={<Navigate to="/dashboard" replace />} />
            <Route path="*"          element={<NotFound />} />
          </Routes>
        </div>
      </Suspense>
    </Router>
  );
}
