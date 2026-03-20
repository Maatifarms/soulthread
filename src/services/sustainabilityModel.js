/**
 * sustainabilityModel.js — Sustainability and Funding Model (Phase 2)
 *
 * Manages institutional subscriptions, tiered access, and ensures the
 * "Support Layer" remains 100% free for users in need.
 */

export const SUBSCRIPTION_TIERS = {
    FREE: 'free',
    BASIC: 'soul_basic',
    PRO: 'soul_pro'
};

class SustainabilityModel {
    constructor() {
        this.FREE_TIER_GUARANTEE = true;
        this.TIERS = {
            [SUBSCRIPTION_TIERS.FREE]: {
                name: 'Sanctuary Free',
                price: 0,
                benefits: ['Community Feed', 'Basic Chat', 'Public Groups', 'Support Circles']
            },
            [SUBSCRIPTION_TIERS.BASIC]: {
                name: 'Soul Basic',
                price: 199, // INR
                benefits: ['Everything in Free', 'Access to Focus Series', 'Premium Wellness Tools', 'Priority Support']
            },
            [SUBSCRIPTION_TIERS.PRO]: {
                name: 'Soul Pro',
                price: 499, // INR
                benefits: ['Everything in Basic', '1-on-1 AI Deep Care', 'Private Institutional Groups', 'Advanced Mental Analytics']
            }
        };
    }

    /**
     * Calculates organizational subscription fees based on seat count.
     */
    async generateEnterpriseQuote(organizationType, seatCount) {
        let baseRate = organizationType === 'university' ? 40 : 150; // Discounted per seat/month
        const total = seatCount * baseRate;

        return {
            monthlySub: total,
            currency: 'INR',
            includes: ['White-label Dashboard', 'Employee Wellness Reports', 'Dedicated Counselor Line']
        };
    }

    /**
     * Validates if a user has access to specific content/feature based on their tier.
     */
    async verifyAccess(user, requiredTier = SUBSCRIPTION_TIERS.FREE) {
        if (!user) return requiredTier === SUBSCRIPTION_TIERS.FREE;
        
        const userTier = user.subscriptionTier || SUBSCRIPTION_TIERS.FREE;
        
        // Priority check: Admins and Psychologists have all-access
        if (user.role === 'admin' || user.role === 'psychologist' || user.isAdmin) {
            return true;
        }

        const tierOrder = [SUBSCRIPTION_TIERS.FREE, SUBSCRIPTION_TIERS.BASIC, SUBSCRIPTION_TIERS.PRO];
        const userTierIndex = tierOrder.indexOf(userTier);
        const requiredTierIndex = tierOrder.indexOf(requiredTier);

        return userTierIndex >= requiredTierIndex;
    }

    getTierDetails(tierId) {
        return this.TIERS[tierId] || this.TIERS[SUBSCRIPTION_TIERS.FREE];
    }
}

export const sustainability = new SustainabilityModel();
