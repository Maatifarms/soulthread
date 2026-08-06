import { StrictMode } from 'react'
if (window.logToScreen) window.logToScreen('[1] main.jsx execution started');
import { createRoot } from 'react-dom/client'
import '../styles/global.css'
import '../index.css'
import '../styles/tailwind-utilities.css'
import App from './App.jsx'
import { AuthProvider } from '../contexts/AuthContext'
import GlobalErrorBoundary from '../components/common/GlobalErrorBoundary'

// Forcefully unregister service workers (fixes Capacitor cache getting stuck)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (let registration of registrations) {
      registration.unregister();
    }
  }).catch(err => console.error('SW unregister failed:', err));
}

if (window.logToScreen) window.logToScreen('[2] Unregistering SW');

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GlobalErrorBoundary>
      <AuthProvider>
        <App />
      </AuthProvider>
    </GlobalErrorBoundary>
  </StrictMode>
)
if (window.logToScreen) window.logToScreen('[3] createRoot called');
