/**
 * fcmService.js — Client-side Firebase Cloud Messaging service
 *
 * Features:
 * - Request notification permission
 * - Obtain FCM token and save it to Firestore user doc
 * - Handle foreground messages (show in-app toast/notification)
 * - Handle notification tap → navigate to correct conversation
 * - Auto-refresh token when rotated by Firebase
 * - Works in Capacitor (Android/iOS) and browser PWA contexts
 */

import { getToken, onMessage } from 'firebase/messaging';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

// Lazily get the messaging instance (only loaded when actually needed)
let _messaging = null;
async function getMsg() {
    if (_messaging) return _messaging;
    const { getMessaging } = await import('firebase/messaging');
    const { default: app } = await import('./firebase');
    _messaging = getMessaging(app);
    return _messaging;
}
// Expose a pseudo-messaging reference for legacy callers
const messaging = { _lazy: true };

// VAPID key for Web Push (get from Firebase Console → Cloud Messaging → Web configuration)
const VAPID_KEY = import.meta.env.VITE_FCM_VAPID_KEY || null;

// ─── Token Management ─────────────────────────────────────────────────────────

/**
 * Request permission, get FCM token, and save it to the user's Firestore doc.
 * Call this after the user logs in.
 *
 * @param {string} userId - The authenticated user's UID
 * @param {Function} [onToken] - Optional callback called with the token string
 * @returns {Promise<string|null>} The FCM token, or null if permission denied
 */
export const initFCM = async (userId, onToken) => {
    if (typeof window === 'undefined') return null;

    try {
        if (typeof Notification === 'undefined' || !Notification.requestPermission) {
            console.warn('[FCM] Notification API not supported');
            return null;
        }
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') return null;

        const msgInstance = await getMsg();
        const tokenOptions = VAPID_KEY ? { vapidKey: VAPID_KEY } : {};
        const token = await getToken(msgInstance, tokenOptions);

        if (!token) return null;

        await updateDoc(doc(db, 'users', userId), { fcmToken: token });
        onToken?.(token);
        return token;
    } catch (err) {
        return null;
    }
};

/**
 * Remove the FCM token from Firestore (call on logout).
 * @param {string} userId
 */
export const clearFCMToken = async (userId) => {
    if (!userId) return;
    try {
        const { deleteField } = await import('firebase/firestore');
        await updateDoc(doc(db, 'users', userId), { fcmToken: deleteField() });
        console.log('[FCM] Token cleared on logout');
    } catch (e) {
        console.warn('[FCM] Could not clear token:', e.message);
    }
};

// ─── Foreground Message Handler ───────────────────────────────────────────────

/**
 * Listen for messages while the app is in the foreground.
 * Shows an in-app notification using the browser Notification API or a toast.
 *
 * @param {Function} onForegroundMessage - Callback (payload) => void
 * @returns {Function} Unsubscribe function
 */
export const listenForMessages = (onForegroundMessage) => {
    let unsub = () => {};
    getMsg().then(msgInstance => {
        unsub = onMessage(msgInstance, (payload) => {
            onForegroundMessage?.(payload);
        });
    }).catch(() => {});
    return () => unsub();
};

// ─── Notification Tap Handler ─────────────────────────────────────────────────

/**
 * Parse the notification data and return navigation info.
 * Call this on app launch to handle notification taps.
 *
 * Usage (in App.jsx useEffect):
 *   const { conversationId } = parseNotificationTap();
 *   if (conversationId) navigate(`/messages?chat=${conversationId}`);
 *
 * @returns {{ type: string|null, conversationId: string|null, senderId: string|null }}
 */
export const parseNotificationTap = () => {
    const empty = { type: null, conversationId: null, senderId: null };

    try {
        // Check URL parameters set by service worker on notification click
        const params = new URLSearchParams(window.location.search);
        const chatId = params.get('chat');
        const senderId = params.get('sender');
        const type = params.get('type');

        if (chatId) {
            // Clean up the URL so refreshes don't re-trigger
            const clean = new URL(window.location.href);
            clean.searchParams.delete('chat');
            clean.searchParams.delete('sender');
            clean.searchParams.delete('type');
            window.history.replaceState({}, '', clean.toString());

            return { type: type || 'NEW_MESSAGE', conversationId: chatId, senderId };
        }
    } catch (e) {
        // ignore
    }

    return empty;
};

// ─── In-App Toast Notification UI helper ─────────────────────────────────────

/**
 * Create and display a temporary in-app notification toast.
 * Called when a message arrives while the app is foregrounded.
 *
 * @param {{ title: string, body: string, onClick: Function }} options
 */
export const showInAppToast = ({ title, body, onClick }) => {
    // Remove existing toast if any
    const existing = document.getElementById('fcm-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'fcm-toast';
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'polite');

    Object.assign(toast.style, {
        position: 'fixed',
        top: '16px',
        left: '50%',
        transform: 'translateX(-50%) translateY(-80px)',
        zIndex: '9999',
        maxWidth: '340px',
        width: 'calc(100% - 32px)',
        background: 'var(--color-surface, #ffffff)',
        border: '1px solid var(--color-border, #e5e7eb)',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        padding: '14px 18px',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        transition: 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
        fontFamily: 'inherit',
    });

    toast.innerHTML = `
        <div style="font-size:13px;font-weight:700;color:var(--color-text-primary,#111);">${title}</div>
        <div style="font-size:12px;color:var(--color-text-secondary,#666);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${body}</div>
    `;

    toast.addEventListener('click', () => {
        toast.remove();
        onClick?.();
    });

    document.body.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            toast.style.transform = 'translateX(-50%) translateY(0)';
        });
    });

    // Auto-dismiss after 5s
    setTimeout(() => {
        if (toast.parentNode) {
            toast.style.transform = 'translateX(-50%) translateY(-80px)';
            setTimeout(() => toast.remove(), 400);
        }
    }, 5000);
};
