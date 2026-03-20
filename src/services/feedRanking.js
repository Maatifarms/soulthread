/**
 * feedRanking.js — Advanced Feed Ranking Strategy
 *
 * Ranking Categories:
 *   - For You: Mix of high engagement + recent content
 *   - Latest: Purely chronological
 *   - Following: Only people the user follows (chronological/mixed)
 *   - Trending: Highly engaged posts regardless of active time decay
 *
 * Algorithm factors:
 *   - Recency (Gravity time decay)
 *   - Engagement (Weighted comments > likes)
 *   - Safety (Content deprioritization based on risk limits)
 */

/**
 * Calculates a dynamic edge rank score for a post
 */
function calculateScore(post, nowMs) {
    let score = 0;

    // 1. Engagement Base
    const likes = post.likesCount || 0;
    const comments = post.commentsCount || 0;
    score += (likes * 1.5) + (comments * 4); // Comments are higher effort

    // 2. Time Decay (Half-life model: 12 hours)
    const postTimeMs = post.createdAt?.toMillis ? post.createdAt.toMillis() : Date.now();
    let ageHours = (nowMs - postTimeMs) / (1000 * 60 * 60);
    if (ageHours < 0) ageHours = 0;

    // Reduces engagement score heavily as post ages
    const timeMultiplier = Math.pow(0.5, ageHours / 12);
    score = score * timeMultiplier;

    // 3. Recency Boost (Freshness)
    if (ageHours < 2) {
        score += 30; // Boost very new posts to seed engagement
    }
    if (ageHours < 0.5) {
        score += 50; // Super fresh
    }

    // 4. Safety/Quality Modifiers
    if (post.isSensitive) {
        score *= 0.2; // Heavily deprioritize sensitive content from viral loops
    }
    if (post.crisisFlag) {
        score *= 0.05; // Hide crisis level items from main feed (should be handled via support resources)
    }

    return score;
}

/**
 * Ranks and filters a batch of posts based on the selected category strategy.
 * @param {Array} posts - Array of post objects
 * @param {string} category - Feed tab ('For You', 'Latest', 'Trending', 'Following')
 * @param {Object} currentUser - Current Authed user object (for 'Following' tab)
 * @returns {Array} Sorted and filtered array
 */
export const rankFeed = (posts, category = 'For You', currentUser = null) => {
    if (!posts || posts.length === 0) return [];
    const nowMs = Date.now();
    let result = [...posts];

    // --- Tab Filtering ---
    if (category === 'Following') {
        const followingIds = currentUser?.following || []; // Requires graph expansion in prod
        result = result.filter(p => followingIds.includes(p.authorId));
    }

    // --- Tab Sorting ---
    if (category === 'Latest' || category === 'Following') {
        // Pure Chronological
        result.sort((a, b) => {
            const ta = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
            const tb = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
            return tb - ta;
        });
    } else if (category === 'Trending') {
        // Pure Engagement (Less time decay)
        result.sort((a, b) => {
            const engA = (a.likesCount || 0) + (a.commentsCount * 3 || 0);
            const engB = (b.likesCount || 0) + (b.commentsCount * 3 || 0);
            return engB - engA;
        });
    } else {
        // Default: 'For You' - Algorithmic blend
        result.sort((a, b) => calculateScore(b, nowMs) - calculateScore(a, nowMs));
    }

    return result;
};
