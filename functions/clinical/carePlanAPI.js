const functions = require('firebase-functions/v1');
const admin = require('firebase-admin');
const { CarePlanService } = require('./CarePlanService');
const { assignCarePlanSchema, completeHomeworkSchema } = require('./clinicalSchema');

exports.assignCarePlan = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Login required');
  if (context.auth.token.role !== 'guide') throw new functions.https.HttpsError('permission-denied', 'Only guides can assign care plans');

  const { error, value } = assignCarePlanSchema.validate(data);
  if (error) throw new functions.https.HttpsError('invalid-argument', error.message);

  const db = admin.firestore();
  try {
    const planId = await CarePlanService.assignCarePlan(db, value.patientId, context.auth.uid, value.items);
    return { success: true, planId };
  } catch (err) {
    throw new functions.https.HttpsError('internal', err.message);
  }
});

exports.completeHomework = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Login required');
  
  const { error, value } = completeHomeworkSchema.validate(data);
  if (error) throw new functions.https.HttpsError('invalid-argument', error.message);

  const db = admin.firestore();
  try {
    await CarePlanService.completeHomework(db, value.itemId, context.auth.uid);
    return { success: true };
  } catch (err) {
    throw new functions.https.HttpsError('internal', err.message);
  }
});
