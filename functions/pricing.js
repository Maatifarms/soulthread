/**
 * pricing.js — Server-side source of truth for subscription tier prices.
 *
 * Mirrors src/services/sustainabilityModel.js's TIERS map. Client requests
 * only ever send a tierId — the amount actually charged always comes from
 * here, never from anything the browser sends.
 */

const SUBSCRIPTION_TIERS = {
    FREE: 'free',
    BASIC: 'soul_basic',
    PRO: 'soul_pro'
};

const TIERS = {
    [SUBSCRIPTION_TIERS.BASIC]: { name: 'Soul Basic', price: 199 },
    [SUBSCRIPTION_TIERS.PRO]: { name: 'Soul Pro', price: 499 }
};

// Flat fee for a one-time guide session booking (src/pages/GuideList.jsx).
const SESSION_FEE = 999;

function getPayableTier(tierId) {
    return TIERS[tierId] || null;
}

module.exports = { SUBSCRIPTION_TIERS, TIERS, SESSION_FEE, getPayableTier };
