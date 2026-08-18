import { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Loading from './components/common/Loading';
import { useAuth } from './contexts/AuthContext';
import { markAppLaunch, captureWebVitals } from './services/performanceMonitor';
import UploadProgressBar from './components/upload/UploadProgressBar';
import { getActiveJobs } from './services/uploadPipeline';
import { Capacitor } from '@capacitor/core';
import ScrollToTop from './components/common/ScrollToTop';
import Footer from './components/layout/Footer';
import UpdateChecker from './components/common/UpdateChecker';
import { SplashScreen } from '@capacitor/splash-screen';

// Code Splitting: Lazy load ALL pages
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const PhoneLogin = lazy(() => import('./pages/Login'));
const Profile = lazy(() => import('./pages/Profile'));
const PostDetail = lazy(() => import('./pages/PostDetail'));
const CommunityHome = lazy(() => import('./pages/Community'));
const CommunityPage = lazy(() => import('./pages/Community'));
const SessionsManager = lazy(() => import('./pages/SessionsManager'));
const JournalManager = lazy(() => import('./pages/JournalManager'));
const Settings = lazy(() => import('./pages/Settings'));
const SessionRoom = lazy(() => import('./pages/SessionRoom'));
const SessionDetail = lazy(() => import('./pages/SessionDetail'));
const MyJourney = lazy(() => import('./pages/MyJourney'));
const Chat = lazy(() => import('./pages/Chat'));
const Circles = lazy(() => import('./pages/Circles'));
const Experts = lazy(() => import('./pages/Experts'));
const GuideProfile = lazy(() => import('./pages/GuideProfile'));
const JoinAsExpert = lazy(() => import('./pages/JoinAsExpert'));
const GuideDashboard = lazy(() => import('./pages/GuideDashboard'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Pricing = lazy(() => import('./pages/Pricing'));
const Subscribe = lazy(() => import('./pages/Subscribe'));
const PaymentStatus = lazy(() => import('./pages/PaymentStatus'));
const Crisis = lazy(() => import('./pages/Crisis'));
const About = lazy(() => import('./pages/About'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const BookingFlow = lazy(() => import('./pages/BookingFlow'));
const BookingSuccess = lazy(() => import('./pages/BookingSuccess'));
const NotFound = lazy(() => import('./pages/NotFound'));
const DesignSystemShowcase = lazy(() => import('./pages/DesignSystemShowcase'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));

const ProfileRedirect = () => {
  const { currentUser, loading } = useAuth();
  if (loading) return <Loading />;
  if (!currentUser) return <Navigate to="/login" replace />;
  return <Navigate to={`/profile/${currentUser.uid}`} replace />;
};

// Inner component so we can use useLocation (must be inside <Router>)
function AppShell({ children, activeJobs, isNativeApp }) {
  const location = useLocation();

  return (
    <div className={`app-container ${isNativeApp ? 'native-app' : 'web-app'}`}>
      <Navbar />
      <main style={{ flex: 1 }}>
        {children}
      </main>
      <Footer />
      <UploadProgressBar jobs={activeJobs} />
    </div>
  );
}

function App() {
  const [activeJobs, setActiveJobs] = useState([]);
  if (window.logToScreen) window.logToScreen('[8] App Component Rendered');

  useEffect(() => {
    if (window.logToScreen) window.logToScreen('[9] App useEffect start');
    try {
      SplashScreen.hide();
    } catch(e) { console.warn('Splash hide failed:', e); }
    markAppLaunch();
    captureWebVitals();

    // Apply platform class to body for better CSS targeting
    if (Capacitor.isNativePlatform()) {
      document.body.classList.add('native-app');
      document.body.classList.remove('web-app');
    } else {
      document.body.classList.add('web-app');
      document.body.classList.remove('native-app');
    }

    const pollInterval = setInterval(() => {
      const jobs = getActiveJobs();
      setActiveJobs([...jobs]);
    }, 1000);

    // Remove splash screen once app is ready — instant fade for faster perceived load
    const splash = document.getElementById('splash-screen');
    if (splash) {
      if (window.logToScreen) window.logToScreen('[10] Removing splash screen');
      splash.style.transition = 'opacity 0.4s ease-out, transform 0.6s ease-out';
      splash.style.opacity = '0';
      splash.style.transform = 'scale(1.03)';
      setTimeout(() => splash.remove(), 600);
    } else {
      if (window.logToScreen) window.logToScreen('[10] Splash screen not found');
    }

    // Pre-fetch critical chunks after the initial UI is painted
    const prefetchRoutes = () => {
      import('./pages/Home');
      import('./pages/Login');
      import('./pages/Chat');
    };

    if ('requestIdleCallback' in window) {
      requestIdleCallback(prefetchRoutes, { timeout: 2000 });
    } else {
      setTimeout(prefetchRoutes, 1500);
    }

    return () => clearInterval(pollInterval);
  }, []);

  const isNativeApp = Capacitor.isNativePlatform();

  return (
    <Router>
      <ScrollToTop />
      <UpdateChecker />
      <AppShell activeJobs={activeJobs} isNativeApp={isNativeApp}>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login/phone" element={<PhoneLogin />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/register" element={<Signup />} />
            <Route path="/phone-login" element={<PhoneLogin />} />
            <Route path="/profile" element={<ProfileRedirect />} />
            <Route path="/profile/:userId" element={<Profile />} />
            <Route path="/post/:postId" element={<PostDetail />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/sessions" element={<SessionsManager />} />
            <Route path="/session/:sessionId" element={<SessionDetail />} />
            <Route path="/session-room/:sessionId" element={<SessionRoom />} />
            <Route path="/journey" element={<MyJourney />} />
            <Route path="/journal" element={<JournalManager />} />
            <Route path="/community" element={<CommunityHome />} />
            <Route path="/community/:communityId" element={<CommunityPage />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/circles" element={<Circles />} />
            <Route path="/experts" element={<Experts />} />
            <Route path="/experts/join" element={<JoinAsExpert />} />
            <Route path="/experts/:guideId" element={<GuideProfile />} />
            <Route path="/book/:psychologistId" element={<BookingFlow />} />
            <Route path="/booking-success/:psychologistId" element={<BookingSuccess />} />
            <Route path="/guide-dashboard" element={<GuideDashboard />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/subscribe" element={<Subscribe />} />
            <Route path="/payment-status" element={<PaymentStatus />} />
            <Route path="/crisis" element={<Crisis />} />
            <Route path="/about" element={<About />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/design-system" element={<DesignSystemShowcase />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </AppShell>
    </Router>
  );
}

export default App;

