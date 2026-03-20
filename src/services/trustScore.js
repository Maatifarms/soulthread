/**
 * trustScore.js — Community Trust Score System (Task 66)
 *
 * Background service that algorithmically evaluates users’ behavior, 
 * granting Mod Privileges to high-scoring accounts seamlessly.
 */

import { db } from './firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

class TrustScoreSystem {
    constructor() {
        this.BASE_SCORE = 50; // New accounts start neutral
        this.MODERATOR_THRESHOLD = 90; // Score required for mod features

        this.WEIGHTS = {
            HELPFUL_COMMENT: 2,
            REPORT_ACCURACY: 5,     // Successfully reporting a valid threat
            REPORT_FALSE: -3,       // Abusing the report button
            HARASSMENT_FLAG: -20,   // Being legitimately reported
            ACTIVE_DAY: 0.1         // Slow passive growth
        };
    }

    /**
     * Executes dynamically whenever a relevant social action occurs in the app.
     */
    async adjustScore(userId, actionKey) {
        if (!this.WEIGHTS[actionKey]) return;

        try {
            const userRef = doc(db, 'users', userId);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) return;

            let currentScore = userSnap.data().trustScore || this.BASE_SCORE;
            const newScore = Math.max(0, Math.min(100, currentScore + this.WEIGHTS[actionKey])); // Clamp 0-100

            // Grant or Revoke Moderation Assistance Privileges
            let isTrustedComm = userSnap.data().isTrustedModerator || false;

            if (newScore >= this.MODERATOR_THRESHOLD && !isTrustedComm) {
                isTrustedComm = true;
                console.log(`[TrustSystem] User ${userId} promoted to Community Moderator.`);
            } else if (newScore < this.MODERATOR_THRESHOLD && isTrustedComm) {
                isTrustedComm = false;
                console.log(`[TrustSystem] User ${userId} demoted from Community Moderator.`);
            }

            // Sync to Firestore
            await updateDoc(userRef, {
                trustScore: newScore,
                isTrustedModerator: isTrustedComm
            });

        } catch (e) {
            console.error('[TrustSystem] Failed to adjust trust limits', e);
        }
    }

    /**
     * Called nightly by a CRON job / Cloud Function to reward active users passively.
     */
    async creditDailyActivity(userId) {
        await this.adjustScore(userId, 'ACTIVE_DAY');
    }
}

export const trustSystem = new TrustScoreSystem();
