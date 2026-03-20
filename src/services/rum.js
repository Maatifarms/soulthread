/**
 * rum.js — Real User Monitoring (RUM) System (Task 36)
 *
 * Silently captures critical performance metrics (TTFB, FCP, LCP) and 
 * native UX delays from clients globally, sending them to the backend dashboard.
 */

import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

class RUMService {
    constructor() {
        this.metrics = {
            url: window.location.pathname,
            userAgent: navigator.userAgent,
            deviceMemory: navigator.deviceMemory || 'unknown',
            networkType: navigator.connection?.effectiveType || 'unknown',
            lcp: 0, // Largest Contentful Paint
            fcp: 0, // First Contentful Paint
            jsErrors: 0
        };

        this.initObservers();

        // Let React render & settle before sending telemetry
        window.addEventListener('load', () => setTimeout(() => this.sendTelemetry(), 5000));
        window.addEventListener('error', () => { this.metrics.jsErrors++; });
    }

    initObservers() {
        if ('PerformanceObserver' in window) {
            // FCP
            try {
                const fcpObserver = new PerformanceObserver((entryList) => {
                    for (const entry of entryList.getEntriesByName('first-contentful-paint')) {
                        this.metrics.fcp = Math.round(entry.startTime);
                    }
                });
                fcpObserver.observe({ type: 'paint', buffered: true });
            } catch (e) {
                console.warn('FCP observation not supported.');
            }

            // LCP
            try {
                const lcpObserver = new PerformanceObserver((entryList) => {
                    for (const entry of entryList.getEntries()) {
                        this.metrics.lcp = Math.round(entry.startTime);
                    }
                });
                lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
            } catch (e) {
                console.warn('LCP observation not supported.');
            }
        }
    }

    async sendTelemetry() {
        try {
            await addDoc(collection(db, 'rum_telemetry'), {
                ...this.metrics,
                timestamp: serverTimestamp()
            });
        } catch (error) {
            // Fail silently; Telemetry shouldn't break the app
            console.error('[RUM] Telemetry submission failed.');
        }
    }
}

export const rum = new RUMService();
