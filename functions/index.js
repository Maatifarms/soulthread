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
exports.onNotificationCreate = notifications.onNotificationCreate;



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
exports.dailyGentlePrompt        = growth.dailyGentlePrompt;

/**
 * Cashfree Subscription Payments — server-verified (see payments.js)
 */
const payments = require('./payments');
exports.createSubscriptionOrder     = payments.createSubscriptionOrder;
exports.createSessionOrder           = payments.createSessionOrder;
exports.cashfreeWebhook              = payments.cashfreeWebhook;
exports.expireSubscriptions          = payments.expireSubscriptions;
exports.subscriptionRenewalReminder  = payments.subscriptionRenewalReminder;


const { ISSUE_CATEGORIES } = require('./config/issueCategories');

exports.matchGuideForCaretaker = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Login required');

  const { patientCondition, issueType } = data;

  // Map condition to guide specializations
  const categoryConfig = ISSUE_CATEGORIES[issueType] || ISSUE_CATEGORIES['caretaker'];
  const specializations = categoryConfig.guideSpecializations || [];

  try {
    const guidesSnap = await admin.firestore()
      .collection('guides')
      .where('isAvailable', '==', true)
      .where('isVerified', '==', true)
      .orderBy('rating', 'desc')
      .limit(5)
      .get();

    const guides = guidesSnap.docs.map(d => ({
      id: d.id,
      name: d.data().name,
      specializations: d.data().specializations || [],
      rating: d.data().rating,
      sessionPrice: d.data().sessionPrice,
      avatarUrl: d.data().avatarUrl,
      bio: d.data().bio
    }));

    // Score guides by specialization match
    const scored = guides.map(g => ({
      ...g,
      matchScore: specializations.filter(s =>
        g.specializations.some(gs =>
          gs.toLowerCase().includes(s.toLowerCase())
        )
      ).length
    })).sort((a, b) => b.matchScore - a.matchScore || b.rating - a.rating);

    return { guides: scored.slice(0, 3) };
  } catch (err) {
    throw new functions.https.HttpsError('internal', err.message);
  }
});

/**
 * BUG 4 FIX — Follow Notification
 * Triggered when a new document is created in the `follows` collection.
 */
exports.onNewFollow = functions.firestore.document('follows/{followId}').onCreate(async (snap, context) => {
    const data = snap.data();
    if (!data.followerId || !data.followingId) return;

    try {
        const db = admin.firestore();
        const followerSnap = await db.collection('users').doc(data.followerId).get();
        if (!followerSnap.exists) return;
        const follower = followerSnap.data();
        
        const followingSnap = await db.collection('users').doc(data.followingId).get();
        if (!followingSnap.exists) return;
        const following = followingSnap.data();

        // Get FCM tokens from the following user
        const tokens = following.fcmTokens;
        if (!tokens || !Array.isArray(tokens) || tokens.length === 0) return;
        const targetToken = tokens[tokens.length - 1]; // Use latest token

        const handle = follower.anonymousHandle || `Soul${data.followerId.slice(-4)}`;
        
        const message = {
            notification: {
                title: 'New Connection',
                body: `${handle} started following you.`
            },
            data: { type: 'NEW_FOLLOW', followerId: data.followerId },
            token: targetToken
        };
        
        await admin.messaging().send(message);
    } catch (err) {
        console.error('Error sending follow notification:', err);
    }
});

/**
 * BUG 12 FIX — Admin Notification for Flagged Posts
 * Triggered on post creation or update if flagged.
 */
const nodemailer = require('nodemailer');
exports.onPostFlagged = functions.firestore.document('posts/{postId}').onWrite(async (change, context) => {
    const data = change.after.exists ? change.after.data() : null;
    if (!data) return; // Deleted

    // Check if it's flagged and not yet notified
    if (data.flagged === true && data.adminNotified !== true) {
        try {
            const db = admin.firestore();
            
            // 1. Write to admin_alerts collection
            await db.collection('admin_alerts').add({
                postId: context.params.postId,
                riskLevel: data.riskLevel || 'high',
                content: data.content,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                status: 'pending'
            });

            // 2. Mark as notified so we don't trigger repeatedly
            await change.after.ref.update({ adminNotified: true });

            // 3. Send email using Nodemailer
            // Replace credentials with actual environment variables or configuration
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.GMAIL_USER || 'rupesh2510@gmail.com',
                    pass: process.env.GMAIL_PASS || 'fake-password' // Note: Recommend using Secret Manager or functions.config()
                }
            });

            const mailOptions = {
                from: '"SoulThread Safety" <noreply@soulthread.in>',
                to: 'rupesh2510@gmail.com,anchalmaurya406@gmail.com,bhavyajha.bhu@gmail.com',
                subject: `🚨 [URGENT] Flagged Post Alert - ${data.riskLevel}`,
                text: `A post has been flagged on SoulThread.\n\nRisk Level: ${data.riskLevel}\nPost ID: ${context.params.postId}\nContent: "${data.content}"\n\nPlease review it in the admin dashboard.`
            };

            await transporter.sendMail(mailOptions);
        } catch (err) {
            console.error('Error handling flagged post notification:', err);
        }
    }
});



/**
 * onNewComment - Send FCM push notification on new replies
 */
exports.onNewComment = functions.firestore.document('posts/{postId}/replies/{replyId}').onCreate(async (snap, context) => {
    const data = snap.data();
    if (!data.authorId) return;

    try {
        const db = admin.firestore();
        const postSnap = await db.collection('posts').doc(context.params.postId).get();
        if (!postSnap.exists) return;
        const post = postSnap.data();
        
        if (post.authorId === data.authorId) return; // Don't notify self

        const authorSnap = await db.collection('users').doc(post.authorId).get();
        if (!authorSnap.exists) return;
        const author = authorSnap.data();

        const tokens = author.fcmTokens;
        if (!tokens || !Array.isArray(tokens) || tokens.length === 0) return;
        const targetToken = tokens[tokens.length - 1];

        const message = {
            notification: {
                title: 'New Reply',
                body: `${data.authorName || 'Someone'} replied to your post.`
            },
            data: { type: 'NEW_COMMENT', postId: context.params.postId },
            token: targetToken
        };
        
        await admin.messaging().send(message);
    } catch (err) {
        console.error('Error sending comment notification:', err);
    }
});

/**
 * seriesDailyReminder - Daily FCM reminder for Series
 */
exports.seriesDailyReminder = functions.pubsub
    .schedule('0 14 * * *') // 2:00 PM UTC = 7:30 PM IST
    .timeZone('UTC')
    .onRun(async (context) => {
        const db = admin.firestore();
        const usersSnap = await db.collection('users').get();
        const messaging = admin.messaging();

        for (const userDoc of usersSnap.docs) {
            const userData = userDoc.data();
            
            // Fallback: Check 'fcmToken' string or 'fcmTokens' array
            const token = userData.fcmToken || (userData.fcmTokens && userData.fcmTokens.length > 0 ? userData.fcmTokens[userData.fcmTokens.length - 1] : null);
            if (!token) continue;

            try {
                // Check if they are in any series
                const seriesProgressSnap = await userDoc.ref.collection('series_progress').get();
                if (seriesProgressSnap.empty) continue;

                for (const seriesDoc of seriesProgressSnap.docs) {
                    const seriesId = seriesDoc.id;
                    const progressData = seriesDoc.data();
                    
                    const daysSnap = await seriesDoc.ref.collection('days').where('completed', '==', true).orderBy('completedAt', 'desc').limit(1).get();
                    let completedToday = false;
                    
                    if (!daysSnap.empty) {
                        const lastCompletedAt = daysSnap.docs[0].data().completedAt;
                        if (lastCompletedAt) {
                            const date = lastCompletedAt.toDate();
                            const today = new Date();
                            if (date.toDateString() === today.toDateString()) {
                                completedToday = true;
                            }
                        }
                    }

                    if (!completedToday) {
                        const nextDay = (progressData.lastCompletedDay || 0) + 1;
                        const seriesTitle = seriesId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                        
                        try {
                            await messaging.send({
                                token: token,
                                notification: {
                                    title: `Ready for Day ${nextDay}?`,
                                    body: `Jump back into ${seriesTitle} and keep the momentum going.`
                                },
                                data: {
                                    type: 'series_reminder',
                                    seriesId: seriesId
                                }
                            });
                        } catch (error) {
                            console.error(`Failed to send FCM to ${userDoc.id}`, error);
                        }
                        
                        // Only send one series reminder per user per day to avoid spam
                        break; 
                    }
                }
            } catch (error) {
                console.error(`Error processing series reminder for ${userDoc.id}:`, error);
            }
        }
    });

/**
 * 5a — Session reminder notifications
 * Scheduled to run every hour. Sends push notifications to user and guide 24hrs before confirmed session.
 */
exports.sessionReminder = functions.pubsub
  .schedule('every 1 hours')
  .onRun(async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    
    const snap = await admin.firestore()
      .collection('bookings')
      .where('date', '==', dateStr)
      .where('status', '==', 'confirmed')
      .get();
    
    for (const doc of snap.docs) {
      const b = doc.data();
      // Notify user
      await admin.firestore().collection('notifications').add({
        recipientId: b.userId,
        type: 'session_reminder',
        title: 'Session Tomorrow 📅',
        message: `Your session with ${b.guideName} is tomorrow at ${b.slot}.`,
        bookingId: doc.id,
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      // Notify guide
      await admin.firestore().collection('notifications').add({
        recipientId: b.guideId,
        type: 'session_reminder',
        title: 'Session Tomorrow 📅',
        message: `You have a session with ${b.userName} tomorrow at ${b.slot}.`,
        bookingId: doc.id,
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
  });
