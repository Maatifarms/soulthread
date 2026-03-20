/**
 * healthMonitor.js — App Health Monitoring System (Task 33)
 *
 * Continuously tracks API Latency, Error Rates, Crash Frequency, 
 * and Message Delivery drops. Designed to trigger alarms if thresholds are exceeded.
 */

import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const HEALTH_CHECK_INTERVAL = 60000; // 1 min heartbeats
const ERROR_THRESHOLD = 5;

class HealthMonitor {
    constructor() {
        this.metrics = {
            apiLatency: [], // ms values
            errorCount: 0,
            crashes: 0,
            droppedMessages: 0
        };

        // Window Handlers
        window.addEventListener('error', (event) => this.recordError('Unhandled Crash', event.error));
        window.addEventListener('unhandledrejection', (event) => this.recordError('Unhandled Promise', event.reason));

        // Periodic flush for aggregation
        setInterval(() => this.analyzeAndFlush(), HEALTH_CHECK_INTERVAL);
    }

    /**
     * Record roundtrip API overhead
     * @param {number} startMs - Initial Date.now() timestamp
     */
    trackLatency(startMs) {
        const ms = Date.now() - startMs;
        this.metrics.apiLatency.push(ms);
    }

    /**
     * Increments dropped message counters for socket connection issues
     */
    trackDroppedMessage() {
        this.metrics.droppedMessages += 1;
    }

    /**
     * Safely traps & categorizes an application error
     */
    recordError(type, errorObj) {
        this.metrics.errorCount += 1;

        // Critical crashes skip the interval wait and report instantly
        if (type.includes('Crash')) {
            this.metrics.crashes += 1;
            this.reportAnomaly('CRITICAL_CRASH', { msg: String(errorObj) });
        }
    }

    /**
     * Analyzes collected data over the minute interval, flushing to DB
     */
    async analyzeAndFlush() {
        const avgLatency = this.metrics.apiLatency.length
            ? this.metrics.apiLatency.reduce((a, b) => a + b, 0) / this.metrics.apiLatency.length
            : 0;

        // Check Thresholds
        if (this.metrics.errorCount >= ERROR_THRESHOLD) {
            this.reportAnomaly('HIGH_ERROR_RATE', { count: this.metrics.errorCount });
        }
        if (avgLatency > 1500) { // 1.5s is an unacceptable global latency
            this.reportAnomaly('DEGRADED_LATENCY', { avgMs: Math.round(avgLatency) });
        }
        if (this.metrics.droppedMessages > 0) {
            this.reportAnomaly('MESSAGE_DROPS_DETECTED', { count: this.metrics.droppedMessages });
        }

        // Reset
        this.metrics = { apiLatency: [], errorCount: 0, crashes: 0, droppedMessages: 0 };
    }

    /**
     * Ships anomaly details securely into the backend 
     * where Datadog, Sentry, or Cloud Monitoring will trigger PagerDuty alerts.
     */
    async reportAnomaly(alertCode, details) {
        console.warn(`[HealthMonitor] Alert Triggered: ${alertCode}`, details);
        try {
            await addDoc(collection(db, 'health_alerts'), {
                code: alertCode,
                details: details,
                userAgent: navigator.userAgent,
                timestamp: serverTimestamp()
            });
        } catch (e) {
            console.error('Failed to report anomaly', e);
        }
    }
}

export const monitor = new HealthMonitor();
