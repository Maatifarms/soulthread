const admin = require('firebase-admin');
const { EventPublisher } = require('../events/EventPublisher');
const { TimelineService } = require('./TimelineService');

class ClinicalNotesService {
  /**
   * Instantiates a draft clinical note. Usually triggered automatically by SessionCompleted.
   */
  static async createDraft(db, sessionId, bookingId, guideId, patientId) {
    const noteRef = db.collection('clinical_notes').doc();
    
    await noteRef.set({
      sessionId,
      bookingId,
      guideId,
      patientId,
      status: 'draft',
      privateContent: '',
      sharedSummary: '',
      versionHistory: [],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    await EventPublisher.publish('ClinicalNoteCreated', { noteId: noteRef.id, sessionId, patientId });
    
    // Create timeline entry for draft initialization
    await TimelineService.addEvent(db, patientId, 'ClinicalNoteCreated', { sessionId, noteId: noteRef.id });

    return noteRef.id;
  }

  /**
   * Autosaves or manually saves the private note. 
   * Strict authorization enforced at the API layer.
   */
  static async updatePrivateContent(db, noteId, guideId, content) {
    const noteRef = db.collection('clinical_notes').doc(noteId);
    
    await db.runTransaction(async (transaction) => {
      const snap = await transaction.get(noteRef);
      if (!snap.exists) throw new Error('Note not found');
      
      const noteData = snap.data();
      if (noteData.guideId !== guideId) throw new Error('Unauthorized');
      if (noteData.status === 'signed') throw new Error('Cannot edit a signed clinical note');

      const versionEntry = {
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        author: guideId,
        contentLength: content.length
      };

      transaction.update(noteRef, {
        privateContent: content,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        versionHistory: admin.firestore.FieldValue.arrayUnion(versionEntry)
      });
    });
  }

  /**
   * Locks the private note for compliance.
   */
  static async signNote(db, noteId, guideId) {
    const noteRef = db.collection('clinical_notes').doc(noteId);
    
    await db.runTransaction(async (transaction) => {
      const snap = await transaction.get(noteRef);
      if (!snap.exists) throw new Error('Note not found');
      if (snap.data().guideId !== guideId) throw new Error('Unauthorized');

      transaction.update(noteRef, {
        status: 'signed',
        signedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });
  }

  /**
   * Explicitly publishes a summary to the patient.
   */
  static async publishSummary(db, noteId, guideId, summaryContent) {
    const noteRef = db.collection('clinical_notes').doc(noteId);
    let patientId = null;
    let sessionId = null;

    await db.runTransaction(async (transaction) => {
      const snap = await transaction.get(noteRef);
      if (!snap.exists) throw new Error('Note not found');
      const noteData = snap.data();
      if (noteData.guideId !== guideId) throw new Error('Unauthorized');

      patientId = noteData.patientId;
      sessionId = noteData.sessionId;

      transaction.update(noteRef, {
        sharedSummary: summaryContent,
        summaryPublishedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });

    // Write to patient timeline so they actually see it
    await TimelineService.addEvent(db, patientId, 'SummaryPublished', { sessionId, noteId });
    await EventPublisher.publish('SummaryPublished', { noteId, patientId });
  }
}

module.exports = { ClinicalNotesService };
