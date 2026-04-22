const admin = require('firebase-admin');

function getDb() {
    if (!admin.apps.length) admin.initializeApp();
    return admin.firestore();
}


// Rate Limiter
const rateLimitMap = new Map();
function isRateLimited(userId, action, limitPerHour) {
    const key = `${userId}_${action}`;
    const now = Date.now();
    const windowMs = 60 * 60 * 1000;
    let userStats = rateLimitMap.get(key);
    if (!userStats || (now - userStats.startTime > windowMs)) {
        userStats = { count: 0, startTime: now };
    }
    if (userStats.count >= limitPerHour) return true;
    userStats.count++;
    rateLimitMap.set(key, userStats);
    return false;
}

exports.handleCreatePost = async (data, context) => {
    const functions = require('firebase-functions/v1');
    if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'User must be logged in.');
    const userId = context.auth.uid;

    if (isRateLimited(userId, 'createPost', 100)) {
        throw new functions.https.HttpsError('resource-exhausted', 'Post limit exceeded.');
    }

    const { content, mediaItems, circleId, isAnonymous, isSensitive, hashtags, type, promptId, promptText, categoryId } = data;
    const db = getDb();
    const userSnap = await db.collection('users').doc(userId).get();
    const userData = userSnap.exists ? userSnap.data() : {};

    const authorData = userData.isAnonymous ? { authorName: null, authorPhotoURL: null, authorIsAnonymous: true, isIncognito: true } :
        (isAnonymous ? { authorName: 'Anonymous Soul', authorPhotoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=anonymous', authorIsAnonymous: false, isIncognito: true } :
            { authorName: userData.displayName || 'Friend', authorPhotoURL: userData.photoURL || null, authorIsAnonymous: false, isIncognito: false });

    try {
        const postRef = await db.collection('posts').add({
            authorId: userId, ...authorData, content: content || "",
            mediaUrl: (mediaItems && mediaItems.length > 0) ? mediaItems[0].url : null,
            mediaType: (mediaItems && mediaItems.length > 0) ? mediaItems[0].type : null,
            mediaItems: mediaItems || [], isSensitive: isSensitive || false, hashtags: hashtags || [],
            categoryId: categoryId || 'general', type: type || 'normal', promptId: promptId || null, promptText: promptText || null, circleId: circleId || null,
            createdAt: admin.firestore.FieldValue.serverTimestamp(), likesCount: 0, commentsCount: 0, status: "processing"
        });
        return { success: true, postId: postRef.id };
    } catch (error) {
        throw new functions.https.HttpsError('internal', 'Could not create post.');
    }
};

exports.handleCreateInvite = async (data, context) => {
    const functions = require('firebase-functions/v1');
    if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'User must be logged in.');
    const userId = context.auth.uid;
    if (isRateLimited(userId, 'createInvite', 10)) throw new functions.https.HttpsError('resource-exhausted', 'Invite limit exceeded.');

    const { circleId, circleName, targetUserId } = data;
    try {
        await admin.firestore().collection('circle_invites').doc(`invite_${circleId}_${targetUserId}`).set({
            circleId, circleName, invitedBy: userId, targetUserId, status: 'pending', createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        return { success: true };
    } catch (error) {
        throw new functions.https.HttpsError('internal', 'Failed to send invite.');
    }
};
