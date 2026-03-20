import React, { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Loading from './components/common/Loading';
import { useAuth } from './contexts/AuthContext';
import { markAppLaunch, captureWebVitals } from './services/performanceMonitor';
import UploadProgressBar from './components/upload/UploadProgressBar';
import { getActiveJobs } from './services/uploadPipeline';
import DesktopSidebar from './components/layout/DesktopSidebar';
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
const Pricing = lazy(() => import('./pages/Pricing'));
const About = lazy(() => import('./pages/About'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
const NotFound = lazy(() => import('./pages/NotFound'));

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

// Pages that use the two-column layout
const FEED_PAGES = ['/', '/feed', '/post', '/explore'];
const isFeedPage = (pathname) => FEED_PAGES.some(p => pathname === p) || pathname.startsWith('/post/');

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

    // Remove splash screen once app is ready
    const splash = document.getElementById('splash-screen');
    if (splash) {
      splash.style.transition = 'opacity 0.8s ease, transform 1s ease';
      splash.style.opacity = '0';
      splash.style.transform = 'scale(1.05)';
      setTimeout(() => splash.remove(), 1000);
    }

    return () => clearInterval(pollInterval);
  }, []);

  const isNativeApp = Capacitor.isNativePlatform();

  return (
    <Router>
      <ScrollToTop />
      <div className={`app-container ${isNativeApp ? 'native-app' : 'web-app'}`}>
        <Navbar />
        <main style={{ flex: 1 }}>
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
              <Route path="/crisis" element={<PsychologistList />} />
              <Route path="/care" element={<PsychologistList />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/post/:postId" element={<PostDetail />} />
              <Route path="/hyperfocus-series" element={<HyperfocusSeries />} />
              <Route path="/series" element={<SeriesGallery />} />
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
              <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              <Route path="/counselor-dashboard" element={<CounselorDashboard />} />
              <Route path="/status" element={<NotFound />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
        <UploadProgressBar jobs={activeJobs} />
      </div>
    </Router>
  );
}

export default App;
