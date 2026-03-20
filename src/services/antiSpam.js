/**
 * antiSpam.js — Anti-Spam and Bot Protection (Task 28)
 *
 * Client-side rate limiting and malicious pattern detection.
 * (In production, heavily enforced by Firebase App Check & Security Rules)
 */

import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const WINDOW_MS = 60000; // 1 minute
const MAX_ACTIONS_PER_WINDOW = 10;

class AntiSpamSystem {
    constructor() {
        this.actionLog = [];
        this.shadowBanned = false; // Local state
    }

    /**
     * Verify if the user action is permitted within rate limits.
     * Logs to `abuse_logs` on failure.
     */
    async checkRateLimit(actionType, userId) {
        if (this.shadowBanned) {
            console.warn('[Anti-Spam] Action blocked (shadow banned).');
            return false;
        }

        const now = Date.now();
        // Clean log
        this.actionLog = this.actionLog.filter(ts => now - ts < WINDOW_MS);

        if (this.actionLog.length >= MAX_ACTIONS_PER_WINDOW) {
            this.shadowBanned = true; // Temporary local shadow ban

            // Log to server
            try {
                await addDoc(collection(db, 'abuse_logs'), {
                    userId,
                    reason: `Exceeded local rate limit for action: ${actionType}`,
                    actionLogCount: this.actionLog.length,
                    timestamp: serverTimestamp()
                });
            } catch (e) {
                console.error('[Anti-Spam] Failed to log abuse.', e);
            }

            return false; // Action rejected
        }

        this.actionLog.push(now);
        return true; // Action allowed
    }

    /**
     * Scan messages or post bodies for malicious URLs or spam content.
     */
    detectSuspiciousContent(text) {
        if (!text) return false;

        // Basic keyword filters / Link dumping detection
        const urlMatch = text.match(/https?:\/\//g);
        if (urlMatch && urlMatch.length > 3) return true; // Too many links

        const maliciousKeywords = ['win money', 'free followers', 'crypto giveaway'];
        for (const kw of maliciousKeywords) {
            if (text.toLowerCase().includes(kw)) {
                return true;
            }
        }

        return false;
    }
}

export const antiSpam = new AntiSpamSystem();
