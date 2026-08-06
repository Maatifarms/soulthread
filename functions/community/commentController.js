const functions = require('firebase-functions/v1');
const admin = require('firebase-admin');

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
