/**
 * paymentService.js — Cashfree checkout (server-verified)
 *
 * The client only ever asks the server to create an order and open
 * checkout. It never decides or writes the user's subscription tier —
 * that only happens via a Cashfree webhook verified server-side
 * (see functions/payments.js). This service intentionally has no
 * "upgrade the user" method.
 */

import { httpsCallable } from 'firebase/functions';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, functions } from './firebase';

const CASHFREE_SDK_URL = 'https://sdk.cashfree.com/js/v3/cashfree.js';

// Cached across calls so the SDK script and Cashfree instance are only
// created once per page load — subsequent loadCashfreeSDK() calls resolve
// immediately from this promise.
let cashfreeSdkPromise = null;

function detectCashfreeMode() {
    if (typeof window === 'undefined') return 'production';
    const host = window.location.hostname;
    const isDebugEnv = host === 'localhost' || host === '127.0.0.1' ||
        host.includes('--staging') || host.includes('web.app') || host.includes('firebaseapp.com');
    return isDebugEnv ? 'sandbox' : 'production';
}

class PaymentService {
    loadScript(src) {
        if (document.querySelector(`script[src="${src}"]`)) return Promise.resolve(true);
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    }

    /**
     * Opens the Cashfree checkout modal for an already-created order.
     * Resolves once the checkout UI closes (payment success/failure is
     * confirmed asynchronously by the webhook, not by this promise).
     */
    async openCheckout({ paymentSessionId, env }) {
        const loaded = await this.loadScript(CASHFREE_SDK_URL);
        if (!loaded || !window.Cashfree) {
            throw new Error('Could not load the payment checkout. Please try again.');
        }

        const cashfree = window.Cashfree({ mode: env === 'production' ? 'production' : 'sandbox' });
        await cashfree.checkout({
            paymentSessionId,
            redirectTarget: '_modal'
        });
    }

    /**
     * Requests a Cashfree order for the given subscription tier and opens
     * the checkout modal.
     */
    async startCheckout(tierId) {
        const createOrder = httpsCallable(functions, 'createSubscriptionOrder');
        const { data } = await createOrder({ tierId });
        await this.openCheckout(data);
        return data;
    }

    /**
     * Requests a Cashfree order for a one-time guide session booking and
     * opens the checkout modal. The booking itself is only ever created by
     * the Cashfree webhook after a verified payment — see functions/payments.js.
     */
    async startSessionCheckout({ guideId, guideName, date, slot }) {
        const createOrder = httpsCallable(functions, 'createSessionOrder');
        const { data } = await createOrder({ guideId, guideName, date, slot });
        await this.openCheckout(data);
        return data;
    }

    /**
     * Loads the Cashfree JS SDK once and caches the resulting instance for
     * the lifetime of the page — subsequent calls resolve immediately.
     * Resets the cache on failure so a transient network error doesn't
     * permanently break checkout for the rest of the session.
     */
    loadCashfreeSDK() {
        if (!cashfreeSdkPromise) {
            cashfreeSdkPromise = this.loadScript(CASHFREE_SDK_URL).then((loaded) => {
                if (!loaded || !window.Cashfree) {
                    cashfreeSdkPromise = null;
                    throw new Error('Could not load the payment checkout. Please try again.');
                }
                return window.Cashfree({ mode: detectCashfreeMode() });
            });
        }
        return cashfreeSdkPromise;
    }

    /**
     * Generic order-creation entry point backed by
     * functions/payments.js:createPaymentOrder. `metadata` is forwarded for
     * forward-compatibility, but createPaymentOrder doesn't persist it
     * server-side yet — orderType-specific fulfillment (e.g. guideId for
     * guide_session, plan for subscription) still needs that function
     * extended before this can fully replace startCheckout/startSessionCheckout.
     */
    async initiatePayment({ amount, orderNote, orderType, metadata }) {
        const { httpsCallable: callCallable } = await import('firebase/functions');
        const createOrder = callCallable(functions, 'createPaymentOrder');

        const user = auth.currentUser;
        const { data } = await createOrder({
            amount,
            orderNote,
            orderType,
            metadata,
            userId: user?.uid,
            customerName: user?.displayName,
            customerEmail: user?.email,
            customerPhone: user?.phoneNumber
        });

        const cashfree = await this.loadCashfreeSDK();
        const result = await cashfree.checkout({
            paymentSessionId: data.paymentSessionId,
            // Cashfree substitutes {order_id} itself at redirect time — do not interpolate.
            returnUrl: 'https://soulthread.in/payment-status?orderId={order_id}',
            redirectTarget: '_self'
        });

        return { orderId: data.orderId, ...result };
    }

    /**
     * Reads the current status of an order created via initiatePayment().
     * Used by /payment-status after Cashfree redirects back.
     */
    async checkPaymentStatus(orderId) {
        const snap = await getDoc(doc(db, 'orders', orderId));
        if (!snap.exists()) {
            throw new Error('Order not found.');
        }
        const order = snap.data();
        const orderType = order.orderType || (order.kind === 'session' ? 'guide_session' : order.kind);
        return { status: order.status, orderType, amount: order.amount };
    }
}

export const paymentService = new PaymentService();
