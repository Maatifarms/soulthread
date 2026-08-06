const functions = require('firebase-functions/v1');
const admin = require('firebase-admin');
const { AssessmentService } = require('./AssessmentService');
const { assignAssessmentSchema, submitAssessmentSchema } = require('./clinicalSchema');

exports.assignAssessment = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Login required');
  if (context.auth.token.role !== 'guide') throw new functions.https.HttpsError('permission-denied', 'Only guides can assign assessments');

  const { error, value } = assignAssessmentSchema.validate(data);
  if (error) throw new functions.https.HttpsError('invalid-argument', error.message);

  const db = admin.firestore();
  try {
    const assignmentId = await AssessmentService.assignAssessment(db, value.patientId, context.auth.uid, value.templateId);
    return { success: true, assignmentId };
  } catch (err) {
    throw new functions.https.HttpsError('internal', err.message);
  }
});

exports.submitAssessment = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Login required');

  const { error, value } = submitAssessmentSchema.validate(data);
  if (error) throw new functions.https.HttpsError('invalid-argument', error.message);

  const db = admin.firestore();
  try {
    const res = await AssessmentService.submitAssessment(db, value.assignmentId, context.auth.uid, value.answers);
    return { success: true, score: res.score };
  } catch (err) {
    throw new functions.https.HttpsError('internal', err.message);
  }
});
