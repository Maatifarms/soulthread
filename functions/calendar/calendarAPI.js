const functions = require('firebase-functions/v1');
const admin = require('firebase-admin');
const { CalendarService } = require('./CalendarService');
const { updateAvailabilitySchema, blockDateSchema, reserveSlotSchema } = require('./calendarSchema');

const calendarService = new CalendarService();

exports.updateAvailability = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Login required');
  const { error, value } = updateAvailabilitySchema.validate(data);
  if (error) throw new functions.https.HttpsError('invalid-argument', error.message);

  if (value.guideId !== context.auth.uid && context.auth.token.role !== 'admin') {
    throw new functions.https.HttpsError('permission-denied', 'Only guide or admin can update availability');
  }

  await calendarService.updateAvailability(value.guideId, value);
  return { success: true };
});

exports.blockDate = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Login required');
  const { error, value } = blockDateSchema.validate(data);
  if (error) throw new functions.https.HttpsError('invalid-argument', error.message);

  if (value.guideId !== context.auth.uid && context.auth.token.role !== 'admin') {
    throw new functions.https.HttpsError('permission-denied', 'Only guide or admin can block dates');
  }

  const exceptionId = await calendarService.blockDate(value.guideId, value);
  return { success: true, exceptionId };
});

exports.getAvailableSlots = functions.https.onCall(async (data, context) => {
  // Public endpoint (often no auth required for just viewing slots)
  const { guideId, targetDate } = data;
  if (!guideId || !targetDate) throw new functions.https.HttpsError('invalid-argument', 'guideId and targetDate required');

  try {
    const slots = await calendarService.getAvailableSlots(guideId, targetDate);
    return { slots };
  } catch (err) {
    console.error('Error fetching slots:', err);
    throw new functions.https.HttpsError('internal', err.message);
  }
});

exports.reserveSlot = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Login required');
  const { error, value } = reserveSlotSchema.validate(data);
  if (error) throw new functions.https.HttpsError('invalid-argument', error.message);

  const db = admin.firestore();
  try {
    const lockId = await calendarService.reserveSlot(db, value.guideId, context.auth.uid, value.startTime, value.endTime);
    return { success: true, lockId };
  } catch (err) {
    if (err.message.includes('already locked')) {
      throw new functions.https.HttpsError('already-exists', 'Slot is already taken');
    }
    throw new functions.https.HttpsError('internal', err.message);
  }
});

exports.releaseSlot = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Login required');
  const { lockId } = data;
  if (!lockId) throw new functions.https.HttpsError('invalid-argument', 'lockId required');

  const db = admin.firestore();
  await calendarService.releaseSlot(db, lockId, context.auth.uid);
  return { success: true };
});
