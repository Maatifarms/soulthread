const functions = require('firebase-functions/v1');
const admin = require('firebase-admin');

if (!admin.apps.length) admin.initializeApp();

/**
 * askSoulGuide - RESTORED & MODULAR
 */
exports.askSoulGuide = functions.https.onCall(async (data, context) => {
    const soulguide = require('./soulguide_core');
    return soulguide.handleAskSoulGuide(data, context);
});

/**
 * askSalesAgent (SoulMaven) - NEW
 */
const { askSalesAgent } = require('./soulmaven_core');
const { generateOutreachMessage } = require('./soulmaven_outreach_core');
const { rotateDailyPrompt, sendWeeklyDigest, onNewPostNotifyFollowers, reEngagementPush } = require('./growth_automation');

// ── Callable Functions ────────────────────────────────────────────────────────

exports.askSalesAgent = functions.https.onCall(async (data, context) => {
    return await askSalesAgent(data, context);
});

exports.refineContent = functions.https.onCall(async (data, context) => {
    const { refineContent } = require('./soulmaven_core');
    return await refineContent(data, context);
});

exports.generateSocialOutreach = functions.https.onCall(async (data, context) => {
    return await generateOutreachMessage(data.platform, data.postContent, data.context || "");
});

/**
 * onNewChatMessage — FCM push notification on new chat messages
 */
const notifications = require('./notifications');
exports.onNewChatMessage = notifications.onNewChatMessage;



/**
 * createPost - MODULAR
 */
exports.createPost = functions.https.onCall(async (data, context) => {
    const feed = require('./feed_logic');
    return feed.handleCreatePost(data, context);
});

/**
 * createInvite - MODULAR
 */
exports.createInvite = functions.https.onCall(async (data, context) => {
    const feed = require('./feed_logic');
    return feed.handleCreateInvite(data, context);
});

/**
 * Metrics Aggregation - MODULAR
 */
exports.aggregateGlobalMetrics = functions.pubsub.schedule('every 60 minutes').onRun(async (context) => {
    const adminLogic = require('./admin_logic');
    return adminLogic.handleAggregateGlobalMetrics(context);
});

/**
 * Payments (Simple Wrapper)
 */
exports.handlePaymentWebhook = functions.https.onRequest(async (req, res) => {
    try {
        const localAdmin = admin;
        const { circleId, userId, paymentId, status } = req.body;
        if (status === 'authorized' || status === 'captured') {
            await localAdmin.firestore().collection('circle_members').doc(`member_${circleId}_${userId}`).update({
                paymentStatus: 'paid',
                lastPaymentId: paymentId,
                updatedAt: localAdmin.firestore.FieldValue.serverTimestamp()
            });
            return res.status(200).send('Member status updated');
        }
        return res.status(400).send('Payment failed');
    } catch (error) {
        console.error('Webhook Error:', error);
        return res.status(500).send('Internal Error');
    }
});

/**
 * Attendance Counters (Simplified)
 */
exports.onAttendanceChange = functions.firestore
    .document('session_attendance/{attendanceId}')
    .onWrite(async (change, context) => {
        const localAdmin = admin;
        const data = change.after.exists ? change.after.data() : change.before.data();
        const sessionId = data.sessionId;
        const db = localAdmin.firestore();
        const attendanceSnap = await db.collection('session_attendance').where('sessionId', '==', sessionId).get();
        const registeredCount = attendanceSnap.size;
        const attendedCount = attendanceSnap.docs.filter(d => d.data().status === 'attended').length;
        await db.collection('circle_sessions').doc(sessionId).update({
            registeredCount, attendedCount, updatedAt: localAdmin.firestore.FieldValue.serverTimestamp()
        });
    });

/**
 * Notifications (Delegated)
 */
exports.onInviteCreate = functions.firestore.document('circle_invites/{inviteId}').onCreate(async (snap, context) => {
    const localAdmin = admin;
    const invite = snap.data();
    const senderSnap = await localAdmin.firestore().collection('users').doc(invite.invitedBy).get();
    const senderName = senderSnap.exists ? senderSnap.data().displayName : 'Someone';
    const message = {
        notification: { title: 'New Circle Invite 🫂', body: `${senderName} invited you to join a circle.` },
        data: { type: 'INVITE', inviteId: context.params.inviteId },
        topic: `user_${invite.targetUserId}`
    };
    await localAdmin.messaging().send(message);
});

exports.scheduledFirestoreBackup = functions.pubsub.schedule('0 3 * * *').onRun(async (context) => {
    console.log("Firestore backup task triggered.");
});

/**
 * Growth Automation — 4 functions
 */
const growth = require('./growth_automation');
exports.rotateDailyPrompt        = growth.rotateDailyPrompt;
exports.sendWeeklyDigest         = growth.sendWeeklyDigest;
exports.onNewPostNotifyFollowers = growth.onNewPostNotifyFollowers;
exports.reEngagementPush         = growth.reEngagementPush;







