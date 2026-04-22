const admin = require('firebase-admin');

function getDb() {
    if (!admin.apps.length) admin.initializeApp();
    return admin.firestore();
}


exports.handleAggregateGlobalMetrics = async (context) => {
    const db = getDb();
    const circlesSnap = await db.collection('circles').get();
    const totalCircles = circlesSnap.size;
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weeklyCircleGrowth = circlesSnap.docs.filter(d => d.data().createdAt?.toDate() > weekAgo).length;

    const membersSnap = await db.collection('circle_members').where('paymentStatus', '==', 'paid').get();
    const totalPaidMembers = membersSnap.size;
    let totalRevenue = 0;
    const paidByCircle = {};
    membersSnap.forEach(d => {
        const { circleId } = d.data();
        paidByCircle[circleId] = (paidByCircle[circleId] || 0) + 1;
    });

    for (const circleId in paidByCircle) {
        const cSnap = await db.collection('circles').doc(circleId).get();
        if (cSnap.exists()) {
            totalRevenue += (cSnap.data().price || 0) * paidByCircle[circleId];
        }
    }

    await db.collection('aggregated_metrics').doc('global_stats').set({
        totalCircles,
        weeklyCircleGrowth,
        totalPaidMembers,
        totalRevenue: Math.round(totalRevenue),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
};
