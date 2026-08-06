const functions = require('firebase-functions/v1');
const admin = require('firebase-admin');

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
