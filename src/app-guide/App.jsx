// app-guide/App.jsx — Routes for SoulThread Pro (psychologist app)
import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Loading from '../components/common/Loading';
import ScrollToTop from '../components/common/ScrollToTop';
import { useAuth } from '../contexts/AuthContext';
import { Capacitor } from '@capacitor/core';
import { markAppLaunch } from '../services/performanceMonitor';
import { Home, Calendar, Users, BookOpen, Settings } from 'lucide-react';

const GuideLogin     = lazy(() => import('./pages/GuideLogin'));
const GuideDashboard = lazy(() => import('../pages/GuideDashboard'));
const GuideCalendar  = lazy(() => import('../pages/GuideCalendar'));
const GuidePatients  = lazy(() => import('../pages/GuidePatients'));
const PatientTimeline = lazy(() => import('../pages/PatientTimeline'));
const GuideMore      = lazy(() => import('../pages/GuideMore'));
const GuideLedger    = lazy(() => import('../pages/GuideLedger'));
const GuideSessionWorkspace = lazy(() => import('../pages/GuideSessionWorkspace'));
const GuideResourceLibrary = lazy(() => import('../pages/GuideResourceLibrary'));
const GuideProfile   = lazy(() => import('../pages/Profile'));
const Crisis         = lazy(() => import('../pages/Crisis'));
const Privacy        = lazy(() => import('../pages/Privacy'));
const Terms          = lazy(() => import('../pages/Terms'));
const NotFound       = lazy(() => import('../pages/NotFound'));
const Chat           = lazy(() => import('../pages/Chat'));
const ExecutiveDashboard = lazy(() => import('../pages/admin/ExecutiveDashboard'));

// Simple bottom nav for the guide app — 5 tabs (OS Workflow)
function GuideNav() {
  const { pathname } = useLocation();
  const { currentUser } = useAuth();
  if (!currentUser) return null;

  // Do not show GuideNav on admin routes
  if (pathname.startsWith('/admin')) return null;

  const tabs = [
    { to: '/dashboard', label: 'Home',     Icon: Home },
    { to: '/calendar',  label: 'Calendar', Icon: Calendar },
    { to: '/patients',  label: 'Patients', Icon: Users },
    { to: '/library',   label: 'Library',  Icon: BookOpen },
    { to: '/more',      label: 'More',     Icon: Settings },
  ];

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, height: '64px',
      background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)',
      display: 'flex', alignItems: 'center', zIndex: 100, paddingBottom: 'env(safe-area-inset-bottom)'
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
            <tab.Icon size={20} strokeWidth={active ? 2.5 : 2} />
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

// Security fix: /admin/dashboard was previously gated by plain RequireAuth —
// any authenticated guide could reach it, not just admins. Same check
// app-user/App.jsx's AdminRoute already uses (role/isAdmin, mirrored onto the
// user's Firestore doc by functions/system/adminBootstrap.js from the real
// server-side custom claim — never client-settable).
function AdminRoute({ children }) {
  const { currentUser, loading } = useAuth();
  if (loading) return <Loading />;
  if (!currentUser || (currentUser.role !== 'admin' && !currentUser.isAdmin)) {
    return <Navigate to="/dashboard" replace />;
  }
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
            <Route path="/calendar"  element={<RequireAuth><GuideCalendar /></RequireAuth>} />
            <Route path="/patients"  element={<RequireAuth><GuidePatients /></RequireAuth>} />
            <Route path="/patients/:patientId" element={<RequireAuth><PatientTimeline /></RequireAuth>} />
            <Route path="/session/:bookingId" element={<RequireAuth><GuideSessionWorkspace /></RequireAuth>} />
            <Route path="/library"   element={<RequireAuth><GuideResourceLibrary /></RequireAuth>} />
            <Route path="/messages"  element={<RequireAuth><Chat /></RequireAuth>} />
            <Route path="/messages/:chatId" element={<RequireAuth><Chat /></RequireAuth>} />
            <Route path="/more"      element={<RequireAuth><GuideMore /></RequireAuth>} />
            <Route path="/ledger"    element={<RequireAuth><GuideLedger /></RequireAuth>} />
            <Route path="/profile/:userId" element={<RequireAuth><GuideProfile /></RequireAuth>} />
            
            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<AdminRoute><ExecutiveDashboard /></AdminRoute>} />

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
