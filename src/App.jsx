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

// Code Splitting: Lazy load ALL pages
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const Profile = lazy(() => import('./pages/Profile'));
const Chat = lazy(() => import('./pages/Chat'));
const SupportGroups = lazy(() => import('./pages/SupportGroups'));
const PsychologistList = lazy(() => import('./pages/PsychologistList'));
const Crisis = lazy(() => import('./pages/Crisis'));
const PostDetail = lazy(() => import('./pages/PostDetail'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const Explore = lazy(() => import('./pages/Explore'));
const PhoneLogin = lazy(() => import('./pages/PhoneLogin'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const CounselorDashboard = lazy(() => import('./pages/CounselorDashboard'));
const HyperfocusSeries = lazy(() => import('./pages/HyperfocusSeries'));
const SeriesGallery = lazy(() => import('./pages/SeriesGallery'));
const NeverFinishedSeries = lazy(() => import('./pages/NeverFinishedSeries'));
const PromptEngineeringSeries = lazy(() => import('./pages/PromptEngineeringSeries'));
const EgoIdSeries = lazy(() => import('./pages/EgoIdSeries'));
const MeditationSeries = lazy(() => import('./pages/MeditationSeries'));
const BiologicalSoulSeries = lazy(() => import('./pages/BiologicalSoulSeries'));
const RelationshipSeries = lazy(() => import('./pages/RelationshipSeries'));
const LustDecodedSeries = lazy(() => import('./pages/LustDecodedSeries'));
const MemorySeries = lazy(() => import('./pages/MemorySeries'));
const Pricing = lazy(() => import('./pages/Pricing'));
const About = lazy(() => import('./pages/About'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Notifications = lazy(() => import('./pages/Notifications'));

const ProfileRedirect = () => {
  const { currentUser, loading } = useAuth();
  if (loading) return <Loading />;
  if (!currentUser) return <Navigate to="/login" replace />;
  return <Navigate to={`/profile/${currentUser.uid}`} replace />;
};

const AdminRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  if (loading) return <Loading />;
  if (!currentUser || (currentUser.role !== 'admin' && !currentUser.isAdmin)) {
    return <Navigate to="/" replace />;
  }
  return children;
};

// Immersive series pages have their own sticky header — hide global Navbar + Footer
const IMMERSIVE_SERIES_ROUTES = [
  '/hyperfocus-series',
  '/never-finished-series',
  '/prompt-engineering-series',
  '/ego-id-series',
  '/biological-soul-series',
  '/relationship-series',
  '/lust-decoded',
  '/memory-series',
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

  useEffect(() => {
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
      splash.style.transition = 'opacity 0.4s ease-out, transform 0.6s ease-out';
      splash.style.opacity = '0';
      splash.style.transform = 'scale(1.03)';
      setTimeout(() => splash.remove(), 600);
    }

    // Pre-fetch critical chunks after the initial UI is painted
    const prefetchRoutes = () => {
      // Home, Explore, and Login are the most likely next steps
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
      <AppShell activeJobs={activeJobs} isNativeApp={isNativeApp}>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/feed" element={<Home />} />
            <Route path="/post" element={<Home />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login/phone" element={<PhoneLogin />} />
            <Route path="/profile" element={<ProfileRedirect />} />
            <Route path="/profile/:userId" element={<Profile />} />
            <Route path="/messages" element={<Chat />} />
            <Route path="/groups" element={<SupportGroups />} />
            <Route path="/crisis" element={<Crisis />} />
            <Route path="/care" element={<Crisis />} />
            <Route path="/counselors" element={<PsychologistList />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/post/:postId" element={<PostDetail />} />
            <Route path="/hyperfocus-series" element={<HyperfocusSeries />} />
            <Route path="/series" element={<SeriesGallery />} />
            <Route path="/series/:id" element={<Navigate to="/series" replace />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/about" element={<About />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/never-finished-series" element={<NeverFinishedSeries />} />
            <Route path="/prompt-engineering-series" element={<PromptEngineeringSeries />} />
            <Route path="/ego-id-series" element={<EgoIdSeries />} />
            <Route path="/meditation-series" element={<MeditationSeries />} />
            <Route path="/biological-soul-series" element={<BiologicalSoulSeries />} />
            <Route path="/relationship-series" element={<RelationshipSeries />} />
            <Route path="/lust-decoded" element={<LustDecodedSeries />} />
            <Route path="/memory-series" element={<MemorySeries />} />
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/counselor-dashboard" element={<CounselorDashboard />} />
            <Route path="/status" element={<NotFound />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </AppShell>
    </Router>
  );
}

export default App;
