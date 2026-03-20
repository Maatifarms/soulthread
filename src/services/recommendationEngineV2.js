/**
 * recommendationEngineV2.js — AI Recommendation Engine v2 (Task 88)
 *
 * Intersects four major data scopes (Mood, Trust, Engaged Content, Groups)
 * to synthesize the user's ultimate "For You" global feed array.
 */

class SophisticatedRecommendationEngine {
    constructor() {
        // [In Production] this pulls constants from a Model Registry
        this.WEIGHTS = {
            RECENT_MOOD: 1.5,
            CONTENT_TYPE: 1.2,     // E.g., user prefers Audio over Articles
            COMMUNITY_TRUST: 0.8,  // Trusting highly reputed authors
            GROUP_AFFINITY: 1.0
        };
    }

    /**
     * Synthesizes the exact Feed Array for a given user dynamically.
     * Takes thousands of raw Post IDs and shrinks them to ~50 highly relevant nodes.
     */
    async calculatePayload(userId, userMetricsMatrix, globalPoolArray) {
        console.log(`[RecV2] Executing Vector Intersection for ${userId}...`);

        // 1. Unpack User Vectors natively tracked on-app
        const { avgMood, preferredMedia, trustGraphConnections, activeGroups } = userMetricsMatrix;

        // 2. Map & Sort
        const scoredFeed = globalPoolArray.map(post => {
            let score = 0;

            // Vector A: Mood alignment 
            // If user is highly anxious (avgMood < 2) we boost calming content tags
            if (avgMood <= 2 && post.tags.includes('calm')) score += 10 * this.WEIGHTS.RECENT_MOOD;

            // Vector B: Media Preference
            if (post.mediaType === preferredMedia) score += 5 * this.WEIGHTS.CONTENT_TYPE;

            // Vector C: Reputation System Pipeline Check
            if (trustGraphConnections.includes(post.authorId)) score += 8 * this.WEIGHTS.COMMUNITY_TRUST;

            // Vector D: Context Overlap
            if (activeGroups.includes(post.groupId)) score += 15 * this.WEIGHTS.GROUP_AFFINITY;

            return { ...post, recScore: score };
        });

        // 3. Trim fat and execute Order
        const finalPayload = scoredFeed
            .sort((a, b) => b.recScore - a.recScore)
            .slice(0, 50); // Pagination window

        console.log(`[RecV2] Optimization Complete. Yielded 50 items. Highest confidence: ${finalPayload[0]?.recScore}`);
        return finalPayload;
    }
}

export const recEngineV2 = new SophisticatedRecommendationEngine();
