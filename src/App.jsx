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
const PhoneLogin = lazy(() => import('./pages/PhoneLogin'));
const Explore = lazy(() => import('./pages/Explore'));
const Profile = lazy(() => import('./pages/Profile'));
const PostDetail = lazy(() => import('./pages/PostDetail'));
const SeriesGallery = lazy(() => import('./pages/SeriesGallery'));
const HyperfocusSeries = lazy(() => import('./pages/HyperfocusSeries'));
const MeditationSeries = lazy(() => import('./pages/MeditationSeries'));
const EgoIdSeries = lazy(() => import('./pages/EgoIdSeries'));
const MemorySeries = lazy(() => import('./pages/MemorySeries'));
const BiologicalSoulSeries = lazy(() => import('./pages/BiologicalSoulSeries'));
const NeverFinishedSeries = lazy(() => import('./pages/NeverFinishedSeries'));
const RelationshipSeries = lazy(() => import('./pages/RelationshipSeries'));
const LustDecodedSeries = lazy(() => import('./pages/LustDecodedSeries'));
const PromptEngineeringSeries = lazy(() => import('./pages/PromptEngineeringSeries'));
const Chat = lazy(() => import('./pages/Chat'));
const Circles = lazy(() => import('./pages/Circles'));
const Experts = lazy(() => import('./pages/Experts'));
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
const NotFound = lazy(() => import('./pages/NotFound'));

const ProfileRedirect = () => {
  const { currentUser, loading } = useAuth();
  if (loading) return <Loading />;
  if (!currentUser) return <Navigate to="/login" replace />;
  return <Navigate to={`/profile/${currentUser.uid}`} replace />;
};

// Immersive series pages have their own sticky header — hide global Navbar + Footer
const IMMERSIVE_SERIES_ROUTES = [
  '/series/hyperfocus',
  '/series/never-finished',
  '/series/prompt-engineering',
  '/series/ego-id',
  '/series/biological-soul',
  '/series/relationship',
  '/series/lust-decoded',
  '/series/memory',
];
const isImmersiveSeries = (pathname) => IMMERSIVE_SERIES_ROUTES.includes(pathname);

// Inner component so we can use useLocation (must be inside <Router>)
function AppShell({ children, activeJobs, isNativeApp }) {
  const location = useLocation();
  const immersive = isImmersiveSeries(location.pathname);

  return (
    <div className={`app-container ${isNativeApp ? 'native-app' : 'web-app'}`}>
      {!immersive && <Navbar />}
      <main style={{ flex: 1 }}>
        {children}
      </main>
      {!immersive && <Footer />}
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
      import('./pages/Explore');
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
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/phone-login" element={<PhoneLogin />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/profile" element={<ProfileRedirect />} />
            <Route path="/profile/:userId" element={<Profile />} />
            <Route path="/post/:postId" element={<PostDetail />} />
            <Route path="/series" element={<SeriesGallery />} />
            <Route path="/series/hyperfocus" element={<HyperfocusSeries />} />
            <Route path="/series/meditation" element={<MeditationSeries />} />
            <Route path="/series/ego-id" element={<EgoIdSeries />} />
            <Route path="/series/memory" element={<MemorySeries />} />
            <Route path="/series/biological-soul" element={<BiologicalSoulSeries />} />
            <Route path="/series/never-finished" element={<NeverFinishedSeries />} />
            <Route path="/series/relationship" element={<RelationshipSeries />} />
            <Route path="/series/lust-decoded" element={<LustDecodedSeries />} />
            <Route path="/series/prompt-engineering" element={<PromptEngineeringSeries />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/circles" element={<Circles />} />
            <Route path="/experts" element={<Experts />} />
            <Route path="/experts/join" element={<JoinAsExpert />} />
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
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </AppShell>
    </Router>
  );
}

export default App;

