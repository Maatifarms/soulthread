export const SUBSCRIPTION_TIERS = {
    PRO: 'pro_tier'
};

export const sustainability = {
    verifyAccess: async (user, tier) => {
        if (!user) return false;
        // In this cleaned up version, we bypass actual payments/tier checks
        // just to keep the series unlocking logic working for existing Pro users.
        return user.isPro || false;
    },
    getTierDetails: (tier) => {
        return {
            name: 'Soul Pro',
            price: 499,
            description: 'Access to all expert series'
        };
    }
};
