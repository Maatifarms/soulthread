const functions = require('firebase-functions/v1');
const admin = require('firebase-admin');

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
