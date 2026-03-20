/**
 * abTesting.js — A/B Testing Framework (Task 31)
 *
 * Implements an experimentation framework for feature flagging, 
 * variant testing, and gradual feature rollouts locally, 
 * with eventual syncing to Remote Config or an analytics backend.
 */

class ABTestingService {
    constructor() {
        // Mocked remote flags — usually fetched from Firebase Remote Config
        this.flags = {
            'new_feed_algorithm': { status: 'active', percentages: { 'A': 50, 'B': 50 } }, // 50/50 A/B Test
            'enhanced_onboarding': { status: 'rollingOut', rolloutPercentage: 80 },        // Gradual Rollout
            'hidden_dev_tool': { status: 'disabled' },                                     // Feature Flag
        };
        this.cache = this.loadCache();
    }

    loadCache() {
        try {
            return JSON.parse(localStorage.getItem('st_ab_cache')) || {};
        } catch {
            return {};
        }
    }

    saveCache() {
        localStorage.setItem('st_ab_cache', JSON.stringify(this.cache));
    }

    /**
     * Determines which variant of an A/B test the current user falls into.
     * Evaluates consistently based on a hashed user ID.
     */
    getVariant(experimentKey, userId = 'anonymous') {
        const flag = this.flags[experimentKey];
        if (!flag || flag.status !== 'active') return 'A'; // Default Control

        // Check if previously assigned
        if (this.cache[experimentKey]) return this.cache[experimentKey];

        // Hash user ID to bucket 0-99 deterministically 
        const hash = [...userId].reduce((acc, char) => acc + char.charCodeAt(0), 0) % 100;

        let cumulative = 0;
        let assignedVariant = 'A';

        for (const [variant, percentage] of Object.entries(flag.percentages)) {
            cumulative += percentage;
            if (hash < cumulative) {
                assignedVariant = variant;
                break;
            }
        }

        // Cache persistent assignment
        this.cache[experimentKey] = assignedVariant;
        this.saveCache();

        return assignedVariant;
    }

    /**
     * True if a feature flag is enabled for the user's bucket
     */
    isFeatureEnabled(featureKey, userId = 'anonymous') {
        const flag = this.flags[featureKey];
        if (!flag) return false;

        if (flag.status === 'active') return true;
        if (flag.status === 'disabled') return false;

        if (flag.status === 'rollingOut') {
            const hash = [...userId].reduce((acc, char) => acc + char.charCodeAt(0), 0) % 100;
            return hash < flag.rolloutPercentage;
        }

        return false;
    }
}

export const abTesting = new ABTestingService();
