import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { initializeFirestore, memoryLocalCache } from "firebase/firestore";
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
const isNative = Capacitor.isNativePlatform();

// ── Firestore: memory cache everywhere ─────────────────────────────────────
// persistentLocalCache (IndexedDB-backed) hits an intermittent Firestore SDK bug —
// a fatal internal assertion (Unexpected state ID: ca9 / b815) — under a burst of
// listener churn, e.g. right after signup (user-doc listener + compliance-modal
// write + notification listeners all racing IndexedDB persistence init). This was
// already worked around for native with memoryLocalCache(); confirmed via a real
// production build (5 signup attempts, no dev-only StrictMode involved) that web
// hits the exact same crash, so it gets the same fix. Trade-off: no offline
// Firestore cache across page reloads — acceptable here since booking already
// requires a live network round-trip to Cloud Functions regardless.
export const db = initializeFirestore(app, {
  localCache: memoryLocalCache()
});

import { getFunctions } from "firebase/functions";

// ── Auth + Storage + Functions: always needed upfront ─────────────────────────────────
export const auth = getAuth(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

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
