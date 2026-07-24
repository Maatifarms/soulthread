/**
 * notifications.js — Firebase Cloud Function
 * Sends FCM push notifications when new chat messages arrive.
 *
 * Trigger: Firestore onCreate — conversations/{chatId}/messages/{msgId}
 *
 * Features:
 * - Skips notification if sender === recipient (self-chat guard)
 * - Supports Android (high-priority) and iOS (APNs)
 * - Background and foreground notification payloads
 * - Deep-link data so tapping notification opens the conversation
 * - Gracefully handles missing FCM tokens (not an error)
 * - Handles token rotation: removes stale tokens automatically
 */

const functions = require('firebase-functions/v1');
const admin = require('firebase-admin');

// Lazy-initialize Admin to share across functions in the same process
function getAdmin() {
    if (!admin.apps.length) admin.initializeApp();
    return admin;
}

// ─── Helper: truncate message preview ────────────────────────────────────────
const buildMessagePreview = (msg) => {
    const { text, content, type } = msg;

    switch (type) {
        case 'image': return '📷 Photo';
        case 'video': return '🎥 Video';
        case 'voice': return '🎤 Voice message';
        case 'gif': return '🎞️ GIF';
        default: {
            const body = text || content || '';
            return body.length > 100 ? body.slice(0, 97) + '…' : body;
        }
    }
};

// ─── Helper: build notification payload ──────────────────────────────────────
const buildPayload = ({ token, title, body, chatId, senderId, msgId, senderPhotoURL }) => ({
    token,
    notification: { title, body },
    data: {
        // String values only in FCM data payloads
        type: 'NEW_MESSAGE',
        conversationId: chatId,
        senderId,
        messageId: msgId,
        click_action: 'FLUTTER_NOTIFICATION_CLICK', // Capacitor/PWA compat
        url: `/messages?chat=${chatId}`,
    },
    android: {
        priority: 'high',
        notification: {
            channelId: 'messages',
            priority: 'max',
            defaultSound: true,
            defaultVibrateTimings: true,
            ...(senderPhotoURL ? { imageUrl: senderPhotoURL } : {}),
        },
    },
    apns: {
        payload: {
            aps: {
                alert: { title, body },
                sound: 'default',
                badge: 1,
                'content-available': 1,
                'mutable-content': 1,
            },
        },
        fcmOptions: {
            imageUrl: senderPhotoURL || undefined,
        },
    },
    webpush: {
        notification: {
            title,
            body,
            icon: '/icon-192.png',
            badge: '/badge-72.png',
            data: { url: `/messages?chat=${chatId}` },
        },
        fcmOptions: { link: `/messages?chat=${chatId}` },
    },
});

// ─── Cloud Function ───────────────────────────────────────────────────────────
exports.onNewChatMessage = functions.firestore
    .document('conversations/{chatId}/messages/{msgId}')
    .onCreate(async (snap, context) => {
        const localAdmin = getAdmin();
        const db = localAdmin.firestore();

        const msg = snap.data();
        const { chatId, msgId } = context.params;

        // Skip system / optimistic messages
        if (!msg.senderId) return null;

        // ── Get conversation to find recipient ───────────────────────────────
        const convoRef = db.doc(`conversations/${chatId}`);
        const convoSnap = await convoRef.get();
        if (!convoSnap.exists) return null;

        const convo = convoSnap.data();
        const participants = convo.participants || [];

        // Recipient is the participant who is NOT the sender
        const recipientId = participants.find(uid => uid !== msg.senderId);
        if (!recipientId) return null;

        // Guard: never notify self
        if (recipientId === msg.senderId) return null;

        // ── Fetch recipient's FCM token ───────────────────────────────────────
        const recipientSnap = await db.doc(`users/${recipientId}`).get();
        if (!recipientSnap.exists) return null;

        const recipientData = recipientSnap.data();
        const fcmToken = recipientData.fcmToken;

        // User hasn't granted notification permission or isn't logged in anywhere
        if (!fcmToken) {
            console.log(`[FCM] No token for user ${recipientId} — skipping`);
            return null;
        }

        // ── Build notification ────────────────────────────────────────────────
        const senderName = msg.senderName || convo.participantDetails?.[msg.senderId]?.displayName || 'Someone';
        const senderPhotoURL = msg.photoURL || convo.participantDetails?.[msg.senderId]?.photoURL || null;
        const preview = buildMessagePreview(msg);

        const payload = buildPayload({
            token: fcmToken,
            title: `New message from ${senderName}`,
            body: preview,
            chatId,
            senderId: msg.senderId,
            msgId,
            senderPhotoURL,
        });

        // ── Send ──────────────────────────────────────────────────────────────
        try {
            const result = await localAdmin.messaging().send(payload);
            console.log(`[FCM] ✅ Sent to ${recipientId}: ${result}`);
        } catch (err) {
            // Stale token — remove it from the user doc to prevent future failures
            if (
                err.code === 'messaging/registration-token-not-registered' ||
                err.code === 'messaging/invalid-registration-token'
            ) {
                console.warn(`[FCM] Stale token for ${recipientId} — removing`);
                await db.doc(`users/${recipientId}`).update({ fcmToken: admin.firestore.FieldValue.delete() });
            } else {
                // Log but don't throw — notification failure shouldn't break the write
                console.error(`[FCM] Failed to send: ${err.code} — ${err.message}`);
            }
        }

        return null;
    });

/**
 * onNotificationCreate — Sends generic, private FCM notifications on comments/reactions
 * Enforces a daily limit of 3 notifications per recipient.
 */
exports.onNotificationCreate = functions.firestore
    .document('notifications/{notificationId}')
    .onCreate(async (snap, context) => {
        const localAdmin = getAdmin();
        const db = localAdmin.firestore();
        const notif = snap.data();

        const { type, recipientId, postId } = notif;
        if (!recipientId || !postId) return null;

        // Only process post_comment and post_reaction
        if (type !== 'post_comment' && type !== 'post_reaction') return null;

        // Fetch recipient's FCM token
        const recipientSnap = await db.doc(`users/${recipientId}`).get();
        if (!recipientSnap.exists) return null;

        const recipientData = recipientSnap.data();
        const fcmToken = recipientData.fcmToken;
        if (!fcmToken) {
            console.log(`[onNotificationCreate] No FCM token for user ${recipientId} — skipping`);
            return null;
        }

        // Enforce limit of 3 notifications per user per day
        const todayStr = new Date().toISOString().split('T')[0];
        const limitRef = db.doc(`users/${recipientId}/notification_limits/${todayStr}`);

        try {
            const count = await db.runTransaction(async (transaction) => {
                const limitSnap = await transaction.get(limitRef);
                const currentCount = limitSnap.exists ? (limitSnap.data().count || 0) : 0;
                if (currentCount < 3) {
                    transaction.set(limitRef, { count: currentCount + 1 }, { merge: true });
                    return currentCount + 1;
                }
                return currentCount + 1; // indicates cap reached/exceeded
            });

            if (count > 3) {
                console.log(`[onNotificationCreate] Limit reached (3/day) for recipient ${recipientId} — skipping FCM`);
                return null;
            }
        } catch (err) {
            console.error('[onNotificationCreate] Transaction for daily limit check failed:', err);
            return null;
        }

        // Build notification body
        const title = 'SoulThread';
        let body = '';
        if (type === 'post_comment') {
            body = 'Someone replied to what you shared 💬';
        } else {
            body = "Someone said 'been there' on your post 🫂";
        }

        const payload = {
            token: fcmToken,
            notification: { title, body },
            data: {
                type,
                postId,
                url: `/post/${postId}`,
            },
            android: {
                priority: 'high',
                notification: {
                    channelId: 'posts',
                    priority: 'max',
                    defaultSound: true,
                    defaultVibrateTimings: true,
                },
            },
            apns: {
                payload: {
                    aps: {
                        alert: { title, body },
                        sound: 'default',
                        badge: 1,
                    },
                },
            },
            webpush: {
                notification: {
                    title,
                    body,
                    icon: '/icon-192.png',
                    badge: '/badge-72.png',
                    data: { url: `/post/${postId}` },
                },
                fcmOptions: { link: `/post/${postId}` },
            },
        };

        try {
            const response = await localAdmin.messaging().send(payload);
            console.log(`[onNotificationCreate] ✅ FCM notification sent to ${recipientId}: ${response}`);
        } catch (err) {
            if (
                err.code === 'messaging/registration-token-not-registered' ||
                err.code === 'messaging/invalid-registration-token'
            ) {
                console.warn(`[onNotificationCreate] Stale token for ${recipientId} — removing`);
                await db.doc(`users/${recipientId}`).update({ fcmToken: admin.firestore.FieldValue.delete() });
            } else {
                console.error(`[onNotificationCreate] Failed to send push: ${err.code} — ${err.message}`);
            }
        }

        return null;
    });

