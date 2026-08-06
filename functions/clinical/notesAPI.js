const functions = require('firebase-functions/v1');
const admin = require('firebase-admin');
const { ClinicalNotesService } = require('./ClinicalNotesService');
const { signNoteSchema, updateNoteSchema, publishSummarySchema } = require('./clinicalSchema');

exports.updatePrivateNote = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Login required');
  if (context.auth.token.role !== 'guide') throw new functions.https.HttpsError('permission-denied', 'Only guides can edit notes');

  const { error, value } = updateNoteSchema.validate(data);
  if (error) throw new functions.https.HttpsError('invalid-argument', error.message);

  const db = admin.firestore();
  try {
    await ClinicalNotesService.updatePrivateContent(db, value.noteId, context.auth.uid, value.privateContent || '');
    return { success: true };
  } catch (err) {
    throw new functions.https.HttpsError('internal', err.message);
  }
});

exports.signClinicalNote = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Login required');
  if (context.auth.token.role !== 'guide') throw new functions.https.HttpsError('permission-denied', 'Only guides can sign notes');

  const { error, value } = signNoteSchema.validate(data);
  if (error) throw new functions.https.HttpsError('invalid-argument', error.message);

  const db = admin.firestore();
  try {
    await ClinicalNotesService.signNote(db, value.noteId, context.auth.uid);
    return { success: true };
  } catch (err) {
    throw new functions.https.HttpsError('internal', err.message);
  }
});

exports.publishPatientSummary = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Login required');
  if (context.auth.token.role !== 'guide') throw new functions.https.HttpsError('permission-denied', 'Only guides can publish summaries');

  const { error, value } = publishSummarySchema.validate(data);
  if (error) throw new functions.https.HttpsError('invalid-argument', error.message);

  const db = admin.firestore();
  try {
    await ClinicalNotesService.publishSummary(db, value.noteId, context.auth.uid, value.sharedSummary);
    return { success: true };
  } catch (err) {
    throw new functions.https.HttpsError('internal', err.message);
  }
});
