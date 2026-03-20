import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from './firebase';

/**
 * classificationService.js
 * Handles secure, async AI categorization for stories.
 */

export const classifyStory = async (storyId, content) => {
    try {
        console.log(`[AI] Starting classification for story: ${storyId}`);

        // 1. Get Security Token
        const user = auth.currentUser;
        if (!user) {
            console.warn("[AI] No user logged in. Aborting server-side classification.");
            return finalizeFallback(storyId);
        }

        const idToken = await user.getIdToken(true);

        // 2. Call Secure Backend Endpoint
        // NOTE: Replace with actual production URL when deployed
        const API_ENDPOINT = 'https://us-central1-soulthread-dev.cloudfunctions.net/classifyStory';

        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`
            },
            body: JSON.stringify({ storyId, content })
        });

        if (!response.ok) {
            throw new Error(`HTTP Error ${response.status}: ${await response.text()}`);
        }

        const result = await response.json();
        // Expected result: { categoryId, confidenceScore, modelVersion }

        // 3. Story Existence Check & Update
        return await updateStoryWithResult(storyId, result);

    } catch (error) {
        console.error(`[AI] Error in classification flow for ${storyId}:`, error);

        // Failure Handling: Never leave story uncategorized
        await logClassificationError(storyId, error.message);
        return finalizeFallback(storyId);
    }
};

/** Verify if story still exists before updating to prevent race conditions */
async function updateStoryWithResult(storyId, result) {
    const postRef = doc(db, 'posts', storyId);
    const snap = await getDoc(postRef);

    if (!snap.exists()) {
        console.warn(`[AI] Story ${storyId} was deleted before classification finished. Aborting update.`);
        return;
    }

    const {
        categoryId,
        confidenceScore,
        modelVersion,
        selfHarmRiskScore,
        crisisFlag,
        sensitiveContentScore
    } = result;

    const dataToUpdate = {
        categoryId,
        confidenceScore,
        modelVersion: modelVersion || "v1",
        status: "published",
        selfHarmRiskScore: selfHarmRiskScore || 0,
        crisisFlag: crisisFlag || false,
        sensitiveContentScore: sensitiveContentScore || 0,
        // Consolidated Moderation Flag (R59)
        requiresModeratorAttention: (crisisFlag === true || confidenceScore < 0.70),
        needsReview: (confidenceScore < 0.70)
    };

    await updateDoc(postRef, dataToUpdate);

    // Crisis Logging (No raw content stored per R59 safety check)
    if (crisisFlag === true) {
        await logModerationEvent(storyId, snap.data()?.authorId, {
            selfHarmRiskScore,
            crisisFlag,
            sensitiveContentScore
        });
    }

    console.log(`[AI] Story ${storyId} categorized as ${categoryId}. Moderation Attention: ${dataToUpdate.requiresModeratorAttention}`);
}

/** Log moderation events without raw content for security (R59) */
async function logModerationEvent(storyId, authorId, scores) {
    try {
        const { addDoc, collection, serverTimestamp } = await import('firebase/firestore');
        await addDoc(collection(db, 'moderation_logs'), {
            storyId,
            authorId,
            ...scores,
            timestamp: serverTimestamp()
        });
    } catch (e) {
        console.error("[Moderation] Failed to log crisis event.", e);
    }
}

/** Fallback mechanism: Always ensure a category is assigned */
async function finalizeFallback(storyId) {
    try {
        const postRef = doc(db, 'posts', storyId);
        const snap = await getDoc(postRef);
        if (!snap.exists()) return;

        await updateDoc(postRef, {
            categoryId: 'healing-recovery-stories', // Default fallback
            confidenceScore: 0,
            status: "published",
            modelVersion: "fallback-v1",
            needsReview: true
        });
        console.warn(`[AI] Fallback applied to story ${storyId}`);
    } catch (e) {
        console.error("[AI] Fatal: Could not even apply fallback.", e);
    }
}

/** Log errors for admin auditing */
async function logClassificationError(storyId, message) {
    // Implement logging to 'classification_logs' collection
    try {
        const { addDoc, collection, serverTimestamp } = await import('firebase/firestore');
        await addDoc(collection(db, 'classification_logs'), {
            storyId,
            error: message,
            timestamp: serverTimestamp()
        });
    } catch (e) {
        console.error("[AI] Failed to log error to Firestore.", e);
    }
}
