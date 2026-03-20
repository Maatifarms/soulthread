import { doc, increment, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from './firebase';

/**
 * trackingService.js
 * Tracks user interaction with categories for personalized feed.
 */

export const trackCategoryInteraction = async (categoryId, type, value = 1) => {
    try {
        const user = auth.currentUser;
        if (!user || user.isAnonymous) return; // Don't track if not logged in or account-level anonymous

        const userRef = doc(db, 'users', user.uid);

        let field = '';
        if (type === 'click') field = `categoryEngagementStats.${categoryId}.clicks`;
        else if (type === 'like') field = `categoryEngagementStats.${categoryId}.likes`;
        else if (type === 'readTime') field = `categoryEngagementStats.${categoryId}.readTime`;

        if (!field) return;

        await updateDoc(userRef, {
            [field]: increment(value),
            lastInteractionAt: serverTimestamp()
        });

    } catch (error) {
        console.warn("[Tracking] Failed to track interaction:", error);
    }
};

/**
 * Helper to record story read time
 * @param {string} categoryId 
 * @param {number} seconds 
 */
export const recordReadTime = (categoryId, seconds) => {
    if (seconds < 2) return; // Filter out accidental scrolls
    trackCategoryInteraction(categoryId, 'readTime', seconds);
};
