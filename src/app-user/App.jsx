import { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Loading from '../components/common/Loading';
import { useAuth } from '../contexts/AuthContext';
import { RequireAuth } from '../components/auth/RequireAuth';
import { markAppLaunch, captureWebVitals } from '../services/performanceMonitor';
import UploadProgressBar from '../components/upload/UploadProgressBar';
import { getActiveJobs } from '../services/uploadPipeline';
import { Capacitor } from '@capacitor/core';
import ScrollToTop from '../components/common/ScrollToTop';
import Footer from '../components/layout/Footer';
import UpdateChecker from '../components/common/UpdateChecker';

// Code Splitting: Lazy load ALL pages
const Home = lazy(() => import('../pages/Home'));
const Auth = lazy(() => import('../pages/Auth'));
const Profile = lazy(() => import('../pages/Profile'));
const Chat = lazy(() => import('../pages/Chat'));
const Community = lazy(() => import('../pages/Community'));
const Circles = lazy(() => import('../pages/Circles'));
const Crisis = lazy(() => import('../pages/Crisis'));
const PostDetail = lazy(() => import('../pages/PostDetail'));
const Onboarding = lazy(() => import('../pages/Onboarding'));
const JournalManager = lazy(() => import('../pages/JournalManager'));
const MyJourney = lazy(() => import('../pages/MyJourney'));
const SessionsManager = lazy(() => import('../pages/SessionsManager'));
const SessionDetail = lazy(() => import('../pages/SessionDetail'));
const SessionRoom = lazy(() => import('../pages/SessionRoom'));
const Experts = lazy(() => import('../pages/Experts'));
const GuideProfile = lazy(() => import('../pages/GuideProfile'));
const JoinAsExpert = lazy(() => import('../pages/JoinAsExpert'));
const BookingFlow = lazy(() => import('../pages/BookingFlow'));
const BookingSuccess = lazy(() => import('../pages/BookingSuccess'));
const AdminDashboard = lazy(() => import('../pages/AdminDashboard'));
const GuideDashboard = lazy(() => import('../pages/GuideDashboard'));

const Pricing = lazy(() => import('../pages/Pricing'));
const About = lazy(() => import('../pages/About'));
const Privacy = lazy(() => import('../pages/Privacy'));
const Terms = lazy(() => import('../pages/Terms'));
const NotFound = lazy(() => import('../pages/NotFound'));
const Notifications = lazy(() => import('../pages/Notifications'));

const PaymentStatus = lazy(() => import('../pages/PaymentStatus'));
const Subscribe = lazy(() => import('../pages/Subscribe'));

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

// Inner component so we can use useLocation (must be inside <Router>)
function AppShell({ children, activeJobs, isNativeApp }) {
  const location = useLocation();
  const { currentUser } = useAuth();
  
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup' || location.pathname === '/forgot-password';
  const isGuestLanding = location.pathname === '/' && !currentUser;
  
  const hideNavAndFooter = location.pathname === '/onboarding' || isAuthPage || isGuestLanding;


  return (
    <div className={`app-container ${isNativeApp ? 'native-app' : 'web-app'}`}>
      {!hideNavAndFooter && <Navbar />}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {children}
      </main>
      {!hideNavAndFooter && <Footer />}
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
      import('../pages/Home');
      import('../pages/Community');
      import('../pages/Login');
      import('../pages/Chat');
    };

    if ('requestIdleCallback' in window) {
      requestIdleCallback(prefetchRoutes, { timeout: 2000 });
    } else {
      setTimeout(prefetchRoutes, 1500);
    }

    return () => {
      clearInterval(pollInterval);
    };
  }, []);

  const isNativeApp = Capacitor.isNativePlatform();

  return (
    <Router>
      <ScrollToTop />
      <UpdateChecker>
        <AppShell activeJobs={activeJobs} isNativeApp={isNativeApp}>
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/community" element={<Community />} />
              <Route path="/circles" element={<RequireAuth><Circles /></RequireAuth>} />
              <Route path="/circles/:circleId" element={<RequireAuth><Circles /></RequireAuth>} />
              <Route path="/experts" element={<Experts />} />
              <Route path="/experts/:guideId" element={<GuideProfile />} />
              <Route path="/join-as-expert" element={<JoinAsExpert />} />
              <Route path="/book/:psychologistId" element={<RequireAuth><BookingFlow /></RequireAuth>} />
              <Route path="/booking-success/:psychologistId" element={<RequireAuth><BookingSuccess /></RequireAuth>} />
              <Route path="/login" element={<Auth />} />
              <Route path="/signup" element={<Auth />} />
              <Route path="/register" element={<Auth />} />
              <Route path="/profile" element={<ProfileRedirect />} />
              <Route path="/profile/:userId" element={<Profile />} />
              <Route path="/messages" element={<Chat />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/journal" element={<RequireAuth><JournalManager /></RequireAuth>} />
              <Route path="/journey" element={<RequireAuth><MyJourney /></RequireAuth>} />
              <Route path="/sessions" element={<RequireAuth><SessionsManager /></RequireAuth>} />
              <Route path="/session/:sessionId" element={<RequireAuth><SessionDetail /></RequireAuth>} />
              <Route path="/session-room/:sessionId" element={<RequireAuth><SessionRoom /></RequireAuth>} />

              <Route path="/post/:postId" element={<PostDetail />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/payment-status" element={<PaymentStatus />} />
              <Route path="/subscribe" element={<Subscribe />} />
              <Route path="/about" element={<About />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              <Route path="/guide-dashboard" element={<GuideDashboard />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </AppShell>
      </UpdateChecker>
    </Router>
  );
}

export default App;
