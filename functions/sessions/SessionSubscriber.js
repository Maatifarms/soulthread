const admin = require('firebase-admin');
const { SessionService } = require('./SessionService');

class SessionSubscriber {
  static async handle(eventType, eventData) {
    const db = admin.firestore();
    
    try {
      if (eventType === 'BookingConfirmed') {
        const { bookingId, guideId, patientId, duration } = eventData.payload;
        // In a real app, mode would be extracted from the booking payload
        const mode = eventData.payload.mode || 'video'; 

        if (bookingId && guideId && patientId) {
          const sessionId = await SessionService.createSession(db, bookingId, guideId, patientId, duration || 45, mode);
          console.log(`[SessionSubscriber] Session ${sessionId} created for booking ${bookingId}`);
        }
      }
    } catch (err) {
      console.error(`[SessionSubscriber] Failed processing ${eventType}:`, err);
    }
  }
}

module.exports = { SessionSubscriber };
