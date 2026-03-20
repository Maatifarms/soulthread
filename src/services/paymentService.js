/**
 * paymentService.js — Payment Gateway Integration (Phase 2)
 *
 * Handles handshakes with Razorpay and Stripe.
 * Orchestrates secure transaction IDs and webhook verification stubs.
 */

import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

class PaymentService {
    /**
     * Initializes a Razorpay checkout session.
     * Note: Requires Razorpay script to be loaded in index.html or dynamically.
     */
    async initializeRazorpay(user, tier, amount) {
        if (!window.Razorpay) {
            await this.loadScript('https://checkout.razorpay.com/v1/checkout.js');
        }

        return new Promise((resolve, reject) => {
            const options = {
                key: 'rzp_test_YOUR_KEY_HERE', // Should be moved to environment variables
                amount: amount * 100, // paise
                currency: 'INR',
                name: 'SoulThread Sanctuary',
                description: `Subscription: ${tier.name}`,
                image: '/logo192.png',
                handler: async (response) => {
                    // This is triggered after successful payment
                    console.log('✅ Razorpay Payment Success:', response.razorpay_payment_id);
                    
                    try {
                        await this.upgradeUserTier(user.uid, tier.id, {
                            gateway: 'razorpay',
                            paymentId: response.razorpay_payment_id,
                            orderId: response.razorpay_order_id,
                            signature: response.razorpay_signature
                        });
                        resolve(response);
                    } catch (err) {
                        reject(err);
                    }
                },
                prefill: {
                    name: user.displayName,
                    email: user.email,
                    contact: user.phoneNumber || ''
                },
                theme: {
                    color: '#3D8B7F'
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', (response) => {
                console.error('❌ Razorpay Payment Failed:', response.error.description);
                reject(new Error(response.error.description));
            });
            rzp.open();
        });
    }

    /**
     * Initializes a Stripe Checkout session.
     * Note: Usually handled via a backend Firebase Function to create a session URL.
     */
    async initializeStripe(user, tierId) {
        console.log(`[Stripe] Redirecting to Checkout for ${tierId}...`);
        // In a real implementation, you'd call a Cloud Function here:
        // const response = await fetch('/api/create-stripe-session', { ... });
        // const { url } = await response.json();
        // window.location.href = url;
        
        return { success: true, message: 'Redirecting to Stripe...' };
    }

    /**
     * Updates the user's subscription status in Firestore.
     */
    async upgradeUserTier(userId, tierId, paymentDetails) {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            subscriptionTier: tierId,
            isPremium: tierId !== 'free',
            lastPayment: {
                ...paymentDetails,
                timestamp: serverTimestamp()
            },
            subscriptionActive: true,
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
        });
    }

    loadScript(src) {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    }
}

export const paymentService = new PaymentService();
