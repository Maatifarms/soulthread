const admin = require('firebase-admin');
const { ClinicalNotesService } = require('./ClinicalNotesService');

class ClinicalSubscriber {
  static async handle(eventType, eventData) {
    const db = admin.firestore();
    
    try {
      if (eventType === 'SessionCompleted') {
        const { sessionId, bookingId, guideId } = eventData.payload;
        if (sessionId && bookingId && guideId) {
          
          // Need patientId to create a note. Fetch from session document
          const sessionSnap = await db.collection('sessions').doc(sessionId).get();
          if (sessionSnap.exists) {
            const patientId = sessionSnap.data().patientId;
            
            // Auto-instantiate draft note
            await ClinicalNotesService.createDraft(db, sessionId, bookingId, guideId, patientId);
            console.log(`[ClinicalSubscriber] Draft note created for session ${sessionId}`);
          }
        }
      }
    } catch (err) {
      console.error(`[ClinicalSubscriber] Failed processing ${eventType}:`, err);
    }
  }
}

module.exports = { ClinicalSubscriber };
