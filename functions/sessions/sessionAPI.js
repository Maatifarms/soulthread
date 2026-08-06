const functions = require('firebase-functions/v1');
const admin = require('firebase-admin');
const { SessionService } = require('./SessionService');
const { ProviderFactory } = require('./providers/ProviderFactory');
const { sessionIdSchema, reportIssueSchema } = require('./sessionSchema');

// Utility to determine role based on token
const getRole = (context) => {
  return context.auth.token.role === 'guide' ? 'guide' : 'patient';
};

exports.joinSession = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Login required');
  const { error, value } = sessionIdSchema.validate(data);
  if (error) throw new functions.https.HttpsError('invalid-argument', error.message);

  const db = admin.firestore();
  const sessionSnap = await db.collection('sessions').doc(value.sessionId).get();
  if (!sessionSnap.exists) throw new functions.https.HttpsError('not-found', 'Session not found');
  
  const session = sessionSnap.data();
  const role = getRole(context);

  // Auth check
  if (role === 'guide' && session.guideId !== context.auth.uid) throw new functions.https.HttpsError('permission-denied', 'Not your session');
  if (role === 'patient' && session.patientId !== context.auth.uid) throw new functions.https.HttpsError('permission-denied', 'Not your session');

  if (session.mode === 'offline') {
    return { provider: 'offline', joinUrl: null, token: null };
  }

  const provider = ProviderFactory.getProvider(session.mode);
  const token = await provider.getJoinToken(session.meetingDetails.meetingId, role);
  
  const url = role === 'guide' ? session.meetingDetails.hostUrl : session.meetingDetails.joinUrl;

  return { provider: session.mode, joinUrl: url, token };
});

exports.markReady = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Login required');
  const { error, value } = sessionIdSchema.validate(data);
  if (error) throw new functions.https.HttpsError('invalid-argument', error.message);

  const db = admin.firestore();
  const role = getRole(context);

  try {
    if (role === 'guide') {
      await SessionService.markGuideReady(db, value.sessionId, context.auth.uid);
    } else {
      await SessionService.markUserReady(db, value.sessionId, context.auth.uid);
    }
    return { success: true };
  } catch (err) {
    throw new functions.https.HttpsError('internal', err.message);
  }
});

exports.startSession = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Login required');
  const { error, value } = sessionIdSchema.validate(data);
  if (error) throw new functions.https.HttpsError('invalid-argument', error.message);

  const db = admin.firestore();
  try {
    await SessionService.startSession(db, value.sessionId, context.auth.uid, getRole(context));
    return { success: true };
  } catch (err) {
    throw new functions.https.HttpsError('internal', err.message);
  }
});

exports.completeSession = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Login required');
  const { error, value } = sessionIdSchema.validate(data);
  if (error) throw new functions.https.HttpsError('invalid-argument', error.message);

  const role = getRole(context);
  if (role !== 'guide') throw new functions.https.HttpsError('permission-denied', 'Only guide can complete a session');

  const db = admin.firestore();
  try {
    await SessionService.completeSession(db, value.sessionId, context.auth.uid);
    return { success: true };
  } catch (err) {
    throw new functions.https.HttpsError('internal', err.message);
  }
});
