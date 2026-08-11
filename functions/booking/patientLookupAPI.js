const functions = require('firebase-functions/v1');
const admin = require('firebase-admin');
const { Logger } = require('../system/Logger');

/**
 * Lets a guide look up a patient's display name — but only for a patient they
 * actually have a real booking with. Not a Firestore rule: rules can only
 * check one exact document path (exists()/get()), and there's no
 * deterministic path from a (guideId, patientId) pair to a specific booking
 * (bookings have auto-generated IDs) — so "does any booking link these two"
 * has to be a real query, which only server code can run. This keeps the
 * authorization check and the actual patient-profile read both in trusted
 * server code, rather than exposing full patient profiles (email/phone/age/
 * gender live on the same doc) to any authenticated guide via a broader rule.
 */
// Shared by both callables below — throws permission-denied if no real booking
// links this guide to this patient, otherwise resolves silently.
async function assertGuideLinkedToPatient(db, guideId, patientId) {
  const linkSnap = await db.collection('bookings')
    .where('guideId', '==', guideId)
    .where('userId', '==', patientId)
    .limit(1)
    .get();
  if (linkSnap.empty) {
    throw new functions.https.HttpsError('permission-denied', 'No booking links you to this patient');
  }
}

exports.getPatientProfileForGuide = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Login required');

  const patientId = data?.patientId;
  if (!patientId || typeof patientId !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'patientId is required');
  }

  const guideId = context.auth.uid;
  const db = admin.firestore();

  try {
    await assertGuideLinkedToPatient(db, guideId, patientId);

    const patientSnap = await db.collection('users').doc(patientId).get();
    if (!patientSnap.exists) {
      return { displayName: null };
    }

    const patientData = patientSnap.data();
    return { displayName: patientData.displayName || patientData.name || null };
  } catch (err) {
    if (err instanceof functions.https.HttpsError) throw err;
    Logger.error('getPatientProfileForGuide failed', { guideId, patientId }, err);
    throw new functions.https.HttpsError('internal', 'Failed to look up patient');
  }
});

/**
 * Powers PatientTimeline.jsx — a guide's "patient workspace" view. Same
 * booking-link authorization as getPatientProfileForGuide, but returns the
 * fuller set that page needs: a profile subset, this guide's own booking
 * history with this patient (not the patient's bookings with *other* guides —
 * a guide shouldn't see a patient's history with someone else), and the
 * patient's timeline events (mood/journal-share/community activity — timeline
 * docs are otherwise owner-only, same reasoning as the profile fix).
 */
exports.getPatientWorkspaceForGuide = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Login required');

  const patientId = data?.patientId;
  if (!patientId || typeof patientId !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'patientId is required');
  }

  const guideId = context.auth.uid;
  const db = admin.firestore();

  try {
    await assertGuideLinkedToPatient(db, guideId, patientId);

    const patientSnap = await db.collection('users').doc(patientId).get();
    const patientData = patientSnap.exists ? patientSnap.data() : {};

    const bookingsSnap = await db.collection('bookings')
      .where('guideId', '==', guideId)
      .where('userId', '==', patientId)
      .get();
    const bookings = bookingsSnap.docs.map(d => {
      const b = d.data();
      return {
        id: d.id,
        status: b.status || null,
        scheduledStartTime: b.scheduledStartTime ? b.scheduledStartTime.toDate().toISOString() : null,
        sessionType: b.sessionType || null,
        clinicalNotes: b.clinicalNotes || null
      };
    });

    const timelineSnap = await db.collection('timeline')
      .where('userId', '==', patientId)
      .orderBy('timestamp', 'desc')
      .limit(50)
      .get();
    const timelineEvents = timelineSnap.docs.map(d => {
      const t = d.data();
      return {
        id: d.id,
        type: t.type || 'activity',
        title: t.title || 'Activity',
        date: t.timestamp ? t.timestamp.toDate().toISOString() : new Date().toISOString(),
        notes: t.description || ''
      };
    });

    return {
      displayName: patientData.displayName || patientData.name || null,
      age: patientData.age || null,
      language: patientData.language || null,
      goals: patientData.goals || [],
      bookings,
      timelineEvents
    };
  } catch (err) {
    if (err instanceof functions.https.HttpsError) throw err;
    Logger.error('getPatientWorkspaceForGuide failed', { guideId, patientId }, err);
    throw new functions.https.HttpsError('internal', 'Failed to load patient workspace');
  }
});
