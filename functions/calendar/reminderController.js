const functions = require('firebase-functions/v1');
const admin = require('firebase-admin');

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
