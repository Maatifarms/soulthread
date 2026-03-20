/**
 * marketing.js — Launch Marketing Infrastructure (Task 40)
 *
 * Traps attribution parameters (?ref=, ?utm_) dynamically during the onboarding flow
 * linking referred cohorts natively to the `users` metadata profiles.
 */

import { db } from './firebase';
import { doc, updateDoc, arrayUnion, increment } from 'firebase/firestore';

class MarketingGrowth {
    constructor() {
        this.installAttribution();
    }

    /**
     * Traps UTM params / DeepLink Referral Tags globally inside the browser URL 
     * caching them persistently across the session before account creation.
     */
    installAttribution() {
        const urlParams = new URLSearchParams(window.location.search);

        const marketingPayload = {
            utm_source: urlParams.get('utm_source') || localStorage.getItem('utm_source'),
            utm_medium: urlParams.get('utm_medium') || localStorage.getItem('utm_medium'),
            utm_campaign: urlParams.get('utm_campaign') || localStorage.getItem('utm_campaign'),
            referralCode: urlParams.get('ref') || localStorage.getItem('referralCode')
        };

        // Push to offline cache
        if (marketingPayload.utm_source) localStorage.setItem('utm_source', marketingPayload.utm_source);
        if (marketingPayload.utm_medium) localStorage.setItem('utm_medium', marketingPayload.utm_medium);
        if (marketingPayload.utm_campaign) localStorage.setItem('utm_campaign', marketingPayload.utm_campaign);
        if (marketingPayload.referralCode) localStorage.setItem('referralCode', marketingPayload.referralCode);

        this.cache = marketingPayload;
    }

    /**
     * Fired internally right after a User signs up.
     * Appends their `referralCode` tree, increasing points on their inviter.
     */
    async attributeNewUser(userId) {
        if (!this.cache.referralCode && !this.cache.utm_source) return;

        try {
            await updateDoc(doc(db, 'users', userId), {
                acquisitionChannel: {
                    source: this.cache.utm_source || 'organic',
                    medium: this.cache.utm_medium || 'direct',
                    campaign: this.cache.utm_campaign || 'none',
                    referredBy: this.cache.referralCode || null
                }
            });

            // Reward Inviter automatically
            if (this.cache.referralCode) {
                const inviterRef = doc(db, 'users', this.cache.referralCode);
                await updateDoc(inviterRef, {
                    invitedUsers: arrayUnion(userId),
                    reputationScore: increment(50) // Issue 50 growth points
                });
            }

            console.log(`[Growth] Successfully attributed cohort ${userId}`);
        } catch (e) {
            console.error('[Growth] Attribution sync failed', e);
        }
    }

    /**
     * Generates a sharable growth footprint for the native Share API interfaces.
     */
    generateInviteLink(userId) {
        return `https://soulthread.in/welcome?ref=${userId}&utm_source=in_app_share&utm_medium=referral`;
    }
}

export const marketing = new MarketingGrowth();
