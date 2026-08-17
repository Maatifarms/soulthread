/**
 * payments.js — Cashfree subscription payments (server-verified).
 *
 * Flow: client calls createSubscriptionOrder(tierId) -> we create a Cashfree
 * order server-side (price looked up from pricing.js, never trusted from the
 * client) and store a pending `orders/{orderId}` doc. Cashfree's webhook
 * (cashfreeWebhook) is the ONLY thing that ever flips a user's subscription
 * tier — verified by HMAC signature before anything in the payload is
 * trusted. The client never writes subscriptionTier/isPremium itself.
 */

const functions = require('firebase-functions/v1');
const admin = require('firebase-admin');
const crypto = require('crypto');
const { defineSecret } = require('firebase-functions/params');
const { getPayableTier, SESSION_FEE } = require('./pricing');

const CASHFREE_APP_ID = defineSecret('CASHFREE_APP_ID');
const CASHFREE_SECRET_KEY = defineSecret('CASHFREE_SECRET_KEY');
const CASHFREE_WEBHOOK_SECRET = defineSecret('CASHFREE_WEBHOOK_SECRET');
const CASHFREE_ENV = defineSecret('CASHFREE_ENV'); // "sandbox" or "production"

const CASHFREE_API_VERSION = '2023-08-01';

function getDb() {
    if (!admin.apps.length) admin.initializeApp();
    return admin.firestore();
}

function cashfreeBaseUrl(env) {
    return env === 'production' ? 'https://api.cashfree.com/pg' : 'https://sandbox.cashfree.com/pg';
}

const SECRETS = [CASHFREE_APP_ID, CASHFREE_SECRET_KEY, CASHFREE_WEBHOOK_SECRET, CASHFREE_ENV];

/**
 * Creates a Cashfree order and returns { paymentSessionId, cashfreeOrderId }.
 * `amount` must already be a trusted, server-computed value — never pass
 * anything derived from client input here.
 */
async function createCashfreeOrder({ orderId, amount, uid, customerEmail, customerPhone }) {
    const env = CASHFREE_ENV.value() || 'sandbox';

    const orderPayload = {
        order_id: orderId,
        order_amount: amount,
        order_currency: 'INR',
        customer_details: {
            customer_id: uid,
            customer_email: customerEmail || 'guest@soulthread.in',
            // Cashfree requires a phone number; SoulThread doesn't collect one today.
            customer_phone: customerPhone || '9999999999'
        },
        order_meta: {
            return_url: `https://soulthread.in/pricing?order_id={order_id}`
        }
    };

    const res = await fetch(`${cashfreeBaseUrl(env)}/orders`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-client-id': CASHFREE_APP_ID.value(),
            'x-client-secret': CASHFREE_SECRET_KEY.value(),
            'x-api-version': CASHFREE_API_VERSION
        },
        body: JSON.stringify(orderPayload)
    });

    const result = await res.json();
    if (!res.ok || !result.payment_session_id) {
        console.error('[Cashfree] Order creation failed:', result);
        throw new functions.https.HttpsError('internal', 'Could not start checkout. Please try again.');
    }

    return { paymentSessionId: result.payment_session_id, cashfreeOrderId: result.cf_order_id || null, env };
}

/**
 * Callable: createSubscriptionOrder({ tierId })
 * Creates a Cashfree order for the authenticated user and a matching
 * `orders/{orderId}` doc. Returns { paymentSessionId, orderId, env }.
 */
exports.createSubscriptionOrder = functions.runWith({ secrets: SECRETS }).https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'You must be logged in to subscribe.');
    }

    const tier = getPayableTier(data.tierId);
    if (!tier) {
        throw new functions.https.HttpsError('invalid-argument', 'Unknown subscription tier.');
    }

    const db = getDb();
    const uid = context.auth.uid;
    const userSnap = await db.collection('users').doc(uid).get();
    const user = userSnap.exists ? userSnap.data() : {};

    const orderId = `order_${uid}_${Date.now()}`;
    const { paymentSessionId, cashfreeOrderId, env } = await createCashfreeOrder({
        orderId,
        amount: tier.price,
        uid,
        customerEmail: user.email || context.auth.token.email,
        customerPhone: user.phoneNumber
    });

    await db.collection('orders').doc(orderId).set({
        kind: 'subscription',
        uid,
        tierId: data.tierId,
        amount: tier.price,
        currency: 'INR',
        status: 'pending',
        cashfreeOrderId,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return { paymentSessionId, orderId, env };
});

/**
 * Callable: createSessionOrder({ guideId, guideName, date, slot })
 * Creates a Cashfree order for a one-time guide session booking
 * (src/pages/GuideList.jsx). The booking itself is only ever created by
 * cashfreeWebhook after a verified payment — never by the client.
 */
exports.createSessionOrder = functions.runWith({ secrets: SECRETS }).https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'You must be logged in to book a session.');
    }
    if (!data.guideId || !data.date || !data.slot) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing guide, date, or time slot.');
    }

    const db = getDb();
    const uid = context.auth.uid;
    const userSnap = await db.collection('users').doc(uid).get();
    const user = userSnap.exists ? userSnap.data() : {};

    const orderId = `order_${uid}_${Date.now()}`;
    const { paymentSessionId, cashfreeOrderId, env } = await createCashfreeOrder({
        orderId,
        amount: SESSION_FEE,
        uid,
        customerEmail: user.email || context.auth.token.email,
        customerPhone: user.phoneNumber
    });

    await db.collection('orders').doc(orderId).set({
        kind: 'session',
        uid,
        userName: user.displayName || 'Friend',
        userEmail: user.email || null,
        guideId: data.guideId,
        guideName: data.guideName || 'A Sanctuary Guide',
        date: data.date,
        slot: data.slot,
        amount: SESSION_FEE,
        currency: 'INR',
        status: 'pending',
        cashfreeOrderId,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return { paymentSessionId, orderId, env };
});

const VALID_ORDER_TYPES = ['guide_session', 'subscription', 'neha_premium'];

/**
 * Callable: createPaymentOrder({ amount, currency, customerName,
 * customerEmail, customerPhone, orderNote, userId, orderType })
 * Generic order-creation entry point for flows that don't yet have a
 * dedicated callable (e.g. NEHA premium). Unlike createSubscriptionOrder/
 * createSessionOrder, `amount` here is client-supplied — callers of this
 * function are responsible for validating price elsewhere, and the
 * cashfreeWebhook only knows how to fulfil `kind: 'session'` and the default
 * subscription-upgrade path today, so 'neha_premium' orders are recorded but
 * not yet auto-fulfilled.
 * Returns { orderId, paymentSessionId, orderAmount, orderCurrency }.
 */
exports.createPaymentOrder = functions.runWith({ secrets: SECRETS }).https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'You must be logged in to make a payment.');
    }

    const { amount, currency, customerName, customerEmail, customerPhone, orderNote, userId, orderType, metadata } = data || {};

    if (userId && userId !== context.auth.uid) {
        throw new functions.https.HttpsError('permission-denied', 'userId does not match the authenticated user.');
    }
    if (!VALID_ORDER_TYPES.includes(orderType)) {
        throw new functions.https.HttpsError('invalid-argument', `orderType must be one of: ${VALID_ORDER_TYPES.join(', ')}.`);
    }

    let finalAmount = amount;
    let validatedPlan = null;

    if (orderType === 'subscription') {
        const planId = metadata?.plan || metadata?.tierId || data?.plan || data?.tierId;
        if (!planId) {
            throw new functions.https.HttpsError('invalid-argument', 'Missing subscription plan ID in request.');
        }

        const tier = getPayableTier(planId);
        if (!tier) {
            throw new functions.https.HttpsError('invalid-argument', `Invalid subscription plan: ${planId}.`);
        }

        finalAmount = tier.price;
        validatedPlan = planId;
    } else if (orderType === 'guide_session') {
        finalAmount = SESSION_FEE;
    }

    if (typeof finalAmount !== 'number' || !Number.isFinite(finalAmount) || finalAmount <= 0) {
        throw new functions.https.HttpsError('invalid-argument', 'amount must be a positive number.');
    }

    const db = getDb();
    const uid = context.auth.uid;
    const env = CASHFREE_ENV.value() || 'sandbox';
    const orderCurrency = currency || 'INR';
    const orderId = `order_${orderType}_${uid}_${Date.now()}`;

    const orderPayload = {
        order_id: orderId,
        order_amount: finalAmount,
        order_currency: orderCurrency,
        customer_details: {
            customer_id: uid,
            customer_name: customerName || 'Friend',
            customer_email: customerEmail || context.auth.token.email || 'guest@soulthread.in',
            // Cashfree requires a phone number; fall back if the caller didn't collect one.
            customer_phone: customerPhone || '9999999999'
        },
        order_meta: {
            return_url: `https://soulthread.in/pricing?order_id={order_id}`
        }
    };
    if (orderNote) {
        orderPayload.order_note = orderNote;
    }

    let result;
    try {
        const res = await fetch(`${cashfreeBaseUrl(env)}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-client-id': CASHFREE_APP_ID.value(),
                'x-client-secret': CASHFREE_SECRET_KEY.value(),
                'x-api-version': CASHFREE_API_VERSION
            },
            body: JSON.stringify(orderPayload)
        });
        result = await res.json();
        if (!res.ok || !result.payment_session_id) {
            console.error('[Cashfree] createPaymentOrder failed:', result);
            throw new functions.https.HttpsError('internal', 'Could not start checkout. Please try again.');
        }
    } catch (error) {
        if (error instanceof functions.https.HttpsError) throw error;
        console.error('[Cashfree] createPaymentOrder request error:', error);
        throw new functions.https.HttpsError('internal', 'Could not reach the payment gateway. Please try again.');
    }

    await db.collection('orders').doc(orderId).set({
        kind: orderType,
        uid,
        userId: uid,
        customerName: customerName || 'Friend',
        customerEmail: customerEmail || null,
        customerPhone: customerPhone || null,
        orderNote: orderNote || null,
        amount: finalAmount,
        currency: orderCurrency,
        status: 'created',
        cashfreeOrderId: result.cf_order_id || null,
        plan: validatedPlan,
        tierId: validatedPlan,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return {
        orderId,
        paymentSessionId: result.payment_session_id,
        orderAmount: finalAmount,
        orderCurrency
    };
});

/**
 * HTTP webhook: Cashfree calls this after a payment event.
 * Verifies x-webhook-signature/x-webhook-timestamp before trusting anything
 * in the body, per https://docs.cashfree.com/docs/webhooks-basics. Cashfree
 * requires this endpoint to always answer 200 or it keeps retrying — every
 * rejection reason below is logged server-side instead of surfaced via
 * status code.
 */
exports.cashfreeWebhook = functions.runWith({ secrets: SECRETS }).https.onRequest(async (req, res) => {
    try {
        const signature = req.headers['x-webhook-signature'];
        const timestamp = req.headers['x-webhook-timestamp'];
        const rawBody = req.rawBody ? req.rawBody.toString('utf8') : JSON.stringify(req.body);

        if (!signature || !timestamp) {
            console.error('[Cashfree Webhook] Missing signature headers');
            return res.status(200).send('Missing signature headers');
        }

        const expectedSignature = crypto
            .createHmac('sha256', CASHFREE_WEBHOOK_SECRET.value())
            .update(timestamp + rawBody)
            .digest('base64');

        const signatureBuf = Buffer.from(signature);
        const expectedBuf = Buffer.from(expectedSignature);
        const isValid = signatureBuf.length === expectedBuf.length &&
            crypto.timingSafeEqual(signatureBuf, expectedBuf);

        if (!isValid) {
            console.error('[Cashfree Webhook] Signature mismatch — rejecting');
            return res.status(200).send('Invalid signature');
        }

        const event = req.body || {};
        const orderId = event?.data?.order?.order_id;
        const paymentStatus = event?.data?.payment?.payment_status;

        if (!orderId) {
            console.error('[Cashfree Webhook] Missing order_id in payload');
            return res.status(200).send('Missing order_id');
        }

        const db = getDb();
        const orderRef = db.collection('orders').doc(orderId);
        const orderSnap = await orderRef.get();

        if (!orderSnap.exists) {
            console.error(`[Cashfree Webhook] Unknown order ${orderId}`);
            return res.status(200).send('Unknown order');
        }

        const order = orderSnap.data();

        // Idempotency — Cashfree retries webhooks, only act on the first success.
        if (order.status === 'paid') {
            return res.status(200).send('Already processed');
        }

        if (paymentStatus !== 'SUCCESS') {
            await orderRef.update({ status: 'failed' });
            console.log(`[Cashfree Webhook] Order ${orderId} not successful (${paymentStatus})`);
            return res.status(200).send('Payment not successful');
        }

        // Legacy orders (createSubscriptionOrder/createSessionOrder) store the
        // type under `kind` with values 'session' | 'subscription';
        // createPaymentOrder stores the caller-supplied `orderType` directly
        // ('guide_session' | 'subscription' | 'neha_premium'). Normalize both
        // onto the same branches below.
        const rawType = order.orderType || order.kind;
        const orderType = rawType === 'session' ? 'guide_session' : rawType;
        const uid = order.uid || order.userId;
        let notificationBody = 'Your payment was successful.';

        if (orderType === 'guide_session') {
            const bookingRef = db.collection('bookings').doc(orderId);
            const guideId = order.guideId || null;
            const slotTime = order.slotTime || (order.date && order.slot ? `${order.date} ${order.slot}` : null);
            const incomplete = !guideId;
            if (incomplete) {
                console.error(`[Cashfree Webhook] Order ${orderId} is guide_session but has no guideId — booking will need manual follow-up`);
            }

            await db.runTransaction(async (tx) => {
                tx.update(orderRef, {
                    status: 'paid',
                    needsManualFulfillment: incomplete,
                    paidAt: admin.firestore.FieldValue.serverTimestamp()
                });
                tx.set(bookingRef, {
                    guideId,
                    // psychologistId/slot kept for GuideDashboard.jsx, which
                    // queries bookings by these existing field names.
                    psychologistId: guideId,
                    psychologistName: order.guideName || null,
                    userId: uid,
                    userName: order.userName || order.customerName || 'Friend',
                    userEmail: order.userEmail || order.customerEmail || null,
                    date: order.date || null,
                    slot: order.slot || null,
                    slotTime,
                    status: 'confirmed',
                    paymentId: orderId,
                    amountPaid: order.amount,
                    currency: order.currency || 'INR',
                    platformCommission: Math.floor((order.amount || 0) * 0.2),
                    createdAt: admin.firestore.FieldValue.serverTimestamp()
                });
            });

            console.log(`[Cashfree Webhook] ✅ Booking confirmed for ${uid} with guide ${guideId}`);
            notificationBody = 'Your session booking is confirmed.';
        } else if (orderType === 'subscription') {
            const plan = order.tierId || order.plan || null;
            const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
            const incomplete = !plan;
            if (incomplete) {
                console.error(`[Cashfree Webhook] Order ${orderId} is subscription but has no plan/tierId — needs manual follow-up`);
            }

            await db.runTransaction(async (tx) => {
                tx.update(orderRef, {
                    status: 'paid',
                    needsManualFulfillment: incomplete,
                    paidAt: admin.firestore.FieldValue.serverTimestamp()
                });
                tx.update(db.collection('users').doc(uid), {
                    subscription: { plan, expiresAt, status: 'active' },
                    // Legacy top-level fields — Pricing.jsx reads
                    // subscriptionTier directly, and the expireSubscriptions/
                    // subscriptionRenewalReminder crons below query
                    // subscriptionActive/currentPeriodEnd off the user doc.
                    subscriptionTier: plan,
                    isPremium: true,
                    subscriptionActive: true,
                    currentPeriodEnd: expiresAt,
                    lastPayment: {
                        gateway: 'cashfree',
                        orderId,
                        amount: order.amount,
                        timestamp: admin.firestore.FieldValue.serverTimestamp()
                    }
                });
            });

            console.log(`[Cashfree Webhook] ✅ ${uid} upgraded to ${plan}`);
            notificationBody = 'Your subscription is now active.';
        } else if (orderType === 'neha_premium') {
            const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

            await db.runTransaction(async (tx) => {
                tx.update(orderRef, {
                    status: 'paid',
                    paidAt: admin.firestore.FieldValue.serverTimestamp()
                });
                tx.update(db.collection('users').doc(uid), {
                    neha_premium: {
                        active: true,
                        activatedAt: admin.firestore.FieldValue.serverTimestamp(),
                        expiresAt
                    }
                });
            });

            console.log(`[Cashfree Webhook] ✅ NEHA Premium activated for ${uid}`);
            notificationBody = 'NEHA Premium is now active.';
        } else {
            console.error(`[Cashfree Webhook] Order ${orderId} has unrecognized orderType/kind: ${rawType}`);
            await orderRef.update({
                status: 'paid',
                needsManualFulfillment: true,
                paidAt: admin.firestore.FieldValue.serverTimestamp()
            });
        }

        // Best-effort push — the payment is already recorded even if this fails.
        try {
            const userSnap = await db.collection('users').doc(uid).get();
            const fcmToken = userSnap.exists ? userSnap.data().fcmToken : null;
            if (fcmToken) {
                await admin.messaging().send({
                    token: fcmToken,
                    notification: { title: 'Payment confirmed', body: notificationBody },
                    data: { type: 'PAYMENT_CONFIRMED', orderId, url: '/pricing' },
                    android: { priority: 'high' },
                    webpush: {
                        notification: { icon: '/icon-192.png', badge: '/badge-72.png' },
                        fcmOptions: { link: 'https://soulthread.in/pricing' }
                    }
                });
            }
        } catch (pushError) {
            if (pushError.code === 'messaging/registration-token-not-registered') {
                await db.collection('users').doc(uid).update({ fcmToken: admin.firestore.FieldValue.delete() });
            } else {
                console.error('[Cashfree Webhook] Push notification failed:', pushError);
            }
        }

        return res.status(200).send('OK');
    } catch (error) {
        console.error('[Cashfree Webhook] Error:', error);
        return res.status(200).send('Internal error');
    }
});

/**
 * Daily scheduled function — expires subscriptions past currentPeriodEnd.
 * Mirrors the cron style used in growth_automation.js.
 */
exports.expireSubscriptions = functions.pubsub
    .schedule('0 19 * * *') // ~00:30 IST
    .timeZone('Asia/Kolkata')
    .onRun(async () => {
        const db = getDb();
        const nowIso = new Date().toISOString();

        const expiredSnap = await db.collection('users')
            .where('subscriptionActive', '==', true)
            .where('currentPeriodEnd', '<=', nowIso)
            .get();

        if (expiredSnap.empty) {
            console.log('[ExpireSubscriptions] Nothing to expire today');
            return null;
        }

        const batch = db.batch();
        expiredSnap.docs.forEach((doc) => {
            batch.update(doc.ref, {
                subscriptionTier: 'free',
                isPremium: false,
                subscriptionActive: false
            });
        });
        await batch.commit();

        console.log(`[ExpireSubscriptions] ✅ Expired ${expiredSnap.size} subscriptions`);
        return null;
    });

/**
 * Daily scheduled function — reminds users 3 days before renewal is due.
 */
exports.subscriptionRenewalReminder = functions.pubsub
    .schedule('0 13 * * *') // ~18:30 IST
    .timeZone('Asia/Kolkata')
    .onRun(async () => {
        const db = getDb();
        const in3Days = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        const dueSnap = await db.collection('users')
            .where('subscriptionActive', '==', true)
            .get();

        const candidates = dueSnap.docs.filter((doc) => {
            const periodEnd = doc.data().currentPeriodEnd;
            return periodEnd && periodEnd.split('T')[0] === in3Days && doc.data().fcmToken;
        });

        if (candidates.length === 0) {
            console.log('[RenewalReminder] No renewals due in 3 days');
            return null;
        }

        await Promise.all(candidates.map((doc) => {
            const user = doc.data();
            return admin.messaging().send({
                token: user.fcmToken,
                notification: {
                    title: 'Your SoulThread plan renews soon',
                    body: 'Renew in 3 days to keep your premium series and tools.'
                },
                data: { type: 'RENEWAL_REMINDER', url: '/pricing' },
                android: { priority: 'normal' },
                webpush: {
                    notification: { icon: '/icon-192.png', badge: '/badge-72.png' },
                    fcmOptions: { link: 'https://soulthread.in/pricing' }
                }
            }).catch((err) => {
                if (err.code === 'messaging/registration-token-not-registered') {
                    return doc.ref.update({ fcmToken: admin.firestore.FieldValue.delete() });
                }
            });
        }));

        console.log(`[RenewalReminder] ✅ Reminded ${candidates.length} users`);
        return null;
    });
