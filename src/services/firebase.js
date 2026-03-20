import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { initializeFirestore, persistentLocalCache, persistentSingleTabManager } from "firebase/firestore";
import { Capacitor } from '@capacitor/core';

export const firebaseConfig = {
  apiKey: "AIzaSyBcpOg9-ZKbEDkPGI3hHlrvekwh4PPHrCY",
  authDomain: "soulthread-15a72.firebaseapp.com",
  projectId: "soulthread-15a72",
  storageBucket: "soulthread-15a72.firebasestorage.app",
  messagingSenderId: "813685915255",
  appId: "1:813685915255:web:553165fc25cc38f5121072",
  measurementId: "G-S96ZQPBJLJ"
};

const app = initializeApp(firebaseConfig);

// ── Firestore: optimised persistence ──────────────────────────────────────
// Use SingleTab manager on native (no multi-tab contention) and on mobile web.
// Multi-tab only on desktop web. This removes the IndexedDB lock wait on APK.
const isNative = Capacitor.isNativePlatform();
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: isNative ? persistentSingleTabManager({}) : persistentSingleTabManager({})
  })
});

// ── Auth + Storage: always needed upfront ─────────────────────────────────
export const auth = getAuth(app);
export const storage = getStorage(app);

// ── App Check: defer until after first paint (non-blocking) ───────────────
// Wrapping in requestIdleCallback / setTimeout keeps the critical path clean.
if (typeof window !== 'undefined' && !isNative) {
  const initAppCheck = () => {
    import("firebase/app-check").then(({ initializeAppCheck, ReCaptchaV3Provider }) => {
      const isDebugEnv =
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.hostname.includes('--staging') ||
        window.location.hostname.includes('web.app') ||
        window.location.hostname.includes('firebaseapp.com');

      if (isDebugEnv) {
        self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
      }

      try {
        initializeAppCheck(app, {
          provider: new ReCaptchaV3Provider('6Lc8i9cqAAAAAD_yY_mI5-yXmU4Q7_C9lY6qMv18'),
          isTokenAutoRefreshEnabled: true
        });
      } catch (_) { /* non-critical */ }
    }).catch(() => { /* non-critical */ });
  };

  // Defer until browser is idle — never blocks main thread or first paint
  if ('requestIdleCallback' in window) {
    requestIdleCallback(initAppCheck, { timeout: 4000 });
  } else {
    setTimeout(initAppCheck, 2000);
  }
}

// ── Messaging: lazy — only loaded when explicitly requested ───────────────
// Do NOT eagerly call getMessaging() here; import it in fcmService.js on demand.
export let messaging = null;

export default app;
