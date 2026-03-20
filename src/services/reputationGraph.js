/**
 * reputationGraph.js — Community Reputation Network (Task 86)
 *
 * Scans metadata tracking multidirectional trust paths between users organically.
 * E.g., If Alpha is highly trusted, and Alpha heavily upvotes Bravo over 30 days, Bravo becomes trusted faster.
 */

import { db } from './firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

class CommunityReputationEngine {
    constructor() {
        this.cache = new Map();
    }

    /**
     * Fired when User A "Endorses", "Upvotes Profile", or "Marks Helpful" User B.
     */
    async mapEndorsement(endorserId, receiverId, contextSignal) {
        console.log(`[ReputationGraph] Generating edge: ${endorserId} -> ${receiverId} (${contextSignal})`);

        try {
            const endorserSnap = await getDoc(doc(db, 'users', endorserId));
            if (!endorserSnap.exists()) return;

            // PageRank-style logic: The weight of the endorsement depends on the Endorser's own rank.
            const endorserRank = endorserSnap.data().trustRank || 'new_member';
            let weightMultiplier = 1.0;

            if (endorserRank === 'moderator_candidate') weightMultiplier = 3.0;
            else if (endorserRank === 'community_helper') weightMultiplier = 1.5;

            // Apply weighted boost to Receiver
            const receiverRef = doc(db, 'users', receiverId);
            const receiverSnap = await getDoc(receiverRef);

            let currentScore = receiverSnap.data()?.trustScore || 50;
            let boost = 2 * weightMultiplier; // Base 2 points mutated by rank

            const newScore = Math.min(100, currentScore + boost);

            await updateDoc(receiverRef, {
                trustScore: newScore,
                lastEndorsementAt: new Date().toISOString()
            });

            console.log(`[ReputationGraph] Mutated ${receiverId} score by +${boost}.`);
        } catch (e) {
            console.error('[ReputationGraph] Edge creation failed.', e);
        }
    }
}

export const reputationEngine = new CommunityReputationEngine();
