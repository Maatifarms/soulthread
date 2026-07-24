import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/global.css'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './contexts/AuthContext'
import GlobalErrorBoundary from './components/common/GlobalErrorBoundary'
import { registerSW } from 'virtual:pwa-register'

// Register PWA service worker — apply updates immediately, no dialog to miss/dismiss
const updateSW = registerSW({
  onNeedRefresh() {
    updateSW(true)
  },
  immediate: true,
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
