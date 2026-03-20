/**
 * analytics.js — Advanced User Analytics System (Task 26)
 *
 * Implements an event-based tracking system with batch submission to reduce network load.
 * Utilizes a local queue (localStorage) when offline, and pushes to Firestore when online.
 */

import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const ANALYTICS_QUEUE_KEY = 'soulthread_analytics_queue';
const BATCH_SIZE = 10;
const FLUSH_INTERVAL_MS = 30000; // 30 seconds

class AnalyticsService {
    constructor() {
        this.queue = this.loadQueue();
        this.flushInterval = setInterval(() => this.flush(), FLUSH_INTERVAL_MS);

        // Listen for online status to flush
        window.addEventListener('online', () => this.flush());
    }

    loadQueue() {
        try {
            const saved = localStorage.getItem(ANALYTICS_QUEUE_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    }

    saveQueue() {
        try {
            localStorage.setItem(ANALYTICS_QUEUE_KEY, JSON.stringify(this.queue));
        } catch (e) {
            console.error('[Analytics] Failed to save queue', e);
        }
    }

    /**
     * Log an event to the analytics queue.
     * @param {string} eventName - e.g., 'post_created', 'app_launch'
     * @param {Object} eventData - additional parameters
     */
    logEvent(eventName, eventData = {}) {
        const event = {
            eventName,
            ...eventData,
            timestamp: Date.now(),
            sessionId: this.getSessionId()
        };

        // Standard GA4 Logging (Client-side)
        if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('event', eventName, {
                ...eventData,
                session_id: event.sessionId,
                source: 'soulthread_analytics_js'
            });
        }

        this.queue.push(event);
        this.saveQueue();

        if (this.queue.length >= BATCH_SIZE) {
            this.flush();
        }
    }

    getSessionId() {
        let sid = sessionStorage.getItem('st_session_id');
        if (!sid) {
            sid = 'sess_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('st_session_id', sid);
        }
        return sid;
    }

    async flush() {
        if (this.queue.length === 0 || !navigator.onLine) return;

        const batch = [...this.queue];
        this.queue = [];
        this.saveQueue();

        try {
            // In a real production setup, this would go to a specialized analytics endpoint 
            // or Firebase Analytics. For this task, we log to a Firestore collection.
            await addDoc(collection(db, 'analytics_events'), {
                events: batch,
                uploadedAt: serverTimestamp()
            });
            console.log(`[Analytics] Flushed ${batch.length} events.`);
        } catch (error) {
            console.error('[Analytics] Flush failed, restoring queue.', error);
            // Restore failed events to queue
            this.queue = [...batch, ...this.queue];
            this.saveQueue();
        }
    }
}

export const analytics = new AnalyticsService();
