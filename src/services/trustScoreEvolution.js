/**
 * trustScoreEvolution.js — Trust Score Upgrade (Task 76)
 *
 * Extends the original Trust System (Task 66).
 * Modifies base limits with advanced Community Endorsement logic and strict ranking tiers.
 */

import { db } from './firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

class TrustScoreEvolution {
    constructor() {
        this.BASE_SCORE = 50;
        // Advanced Evolutionary Ranks
        this.RANKS = [
            { id: 'new_member', min: 0, max: 29 },
            { id: 'trusted_member', min: 30, max: 69 },
            { id: 'community_helper', min: 70, max: 89 },
            { id: 'moderator_candidate', min: 90, max: 100 }
        ];

        this.WEBS = {
            HELPFUL_REPLY: 4,      // E.g. Upvoted as 'best advice' in a Support Group
            MOD_ENDORSEMENT: 15,   // Peer vetted by existing Mod explicitly
            REPORT_ACCURACY: 5,
            SPAM_FLAG: -30         // Serious penalty mapping to Shadow Bans natively
        };
    }

    /**
     * Re-evaluates User Rank structurally when an Event fires.
     */
    async evaluateTrustState(userId, actionKey) {
        if (!this.WEBS[actionKey]) return;

        try {
            const userRef = doc(db, 'users', userId);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) return;

            let currentScore = userSnap.data().trustScore || this.BASE_SCORE;
            let newScore = Math.max(0, Math.min(100, currentScore + this.WEBS[actionKey]));

            const newRank = this.RANKS.find(r => newScore >= r.min && newScore <= r.max).id;
            const currentRank = userSnap.data().trustRank || 'new_member';

            if (newRank !== currentRank) {
                console.log(`[TrustEvolution] User ${userId} evolved from ${currentRank} to ${newRank}.`);
                // Potentially trigger Push Notification celebrating 'Community Helper' tier!
            }

            // Sync structural update
            await updateDoc(userRef, {
                trustScore: newScore,
                trustRank: newRank,
                isTrustedModerator: newRank === 'moderator_candidate' // Resolves Mod Privileges
            });

        } catch (e) {
            console.error('[TrustEvolution] Metric failure', e);
        }
    }
}

export const trustEvo = new TrustScoreEvolution();
