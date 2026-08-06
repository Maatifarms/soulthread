const functions = require('firebase-functions/v1');
const admin = require('firebase-admin');

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
