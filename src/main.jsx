import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/global.css'
import App from './App.jsx'
import { AuthProvider } from './contexts/AuthContext'
import GlobalErrorBoundary from './components/common/GlobalErrorBoundary'
import { registerSW } from 'virtual:pwa-register'

// Register PWA service worker with auto-update
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('A new version of SoulThread is available. Refresh now?')) {
      updateSW(true)
    }
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GlobalErrorBoundary>
      <AuthProvider>
        <App />
      </AuthProvider>
    </GlobalErrorBoundary>
  </StrictMode>,
)
