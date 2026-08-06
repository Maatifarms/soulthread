const admin = require('firebase-admin');

class TimelineService {
  /**
   * Appends an immutable event to the Patient Timeline.
   */
  static async addEvent(db, patientId, type, dataSnapshot) {
    const timelineRef = db.collection('patient_timeline').doc();
    
    await timelineRef.set({
      patientId,
      type,
      data: dataSnapshot,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    return timelineRef.id;
  }
}

module.exports = { TimelineService };
