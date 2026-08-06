const admin = require('firebase-admin');
const { CalendarService } = require('../calendar/CalendarService');

class CalendarSubscriber {
  static async handle(eventType, eventData) {
    console.log(`[CalendarSubscriber] Processing ${eventType}`);
    const calendarService = new CalendarService();
    const db = admin.firestore();
    
    try {
      if (eventType === 'BookingConfirmed' || eventType === 'BookingAccepted') {
        // Find the lock ID based on the booking payload
        const { guideId, scheduledStartTime } = eventData.payload;
        if (!guideId || !scheduledStartTime) return;
        
        // Regenerate the lockId (guideId_YYYYMMDD_HHMM)
        const timeObj = scheduledStartTime.toDate ? scheduledStartTime.toDate() : new Date(scheduledStartTime);
        const { SlotLocker } = require('../calendar/SlotLocker');
        const lockId = SlotLocker.generateLockId(guideId, timeObj);
        
        await calendarService.confirmSlot(db, lockId);
        console.log(`[CalendarSubscriber] Confirmed slot lock: ${lockId}`);
      } 
      else if (eventType.startsWith('BookingCancelled')) {
        // e.g., BookingCancelledByUser
        const { guideId, scheduledStartTime, userId } = eventData.payload;
        if (!guideId || !scheduledStartTime || !userId) return;
        
        const timeObj = scheduledStartTime.toDate ? scheduledStartTime.toDate() : new Date(scheduledStartTime);
        const { SlotLocker } = require('../calendar/SlotLocker');
        const lockId = SlotLocker.generateLockId(guideId, timeObj);
        
        await calendarService.releaseSlot(db, lockId, userId);
        console.log(`[CalendarSubscriber] Released slot lock: ${lockId}`);
      }
    } catch (err) {
      console.error(`[CalendarSubscriber] Failed processing ${eventType}:`, err);
    }
  }
}

module.exports = { CalendarSubscriber };
