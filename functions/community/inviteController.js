const functions = require('firebase-functions/v1');
const admin = require('firebase-admin');

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
