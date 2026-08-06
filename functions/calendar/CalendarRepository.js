const admin = require('firebase-admin');

/**
 * CalendarRepository handles all Firestore data access for the Calendar Engine.
 * Isolates the database layer from the domain logic.
 */
class CalendarRepository {
  constructor() {
    this.db = admin.firestore();
  }

  // --- AVAILABILITY CONFIG ---

  async getAvailability(guideId) {
    const snap = await this.db.collection('provider_availability').doc(guideId).get();
    return snap.exists ? snap.data() : null;
  }

  async setAvailability(guideId, payload) {
    await this.db.collection('provider_availability').doc(guideId).set({
      ...payload,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
  }

  // --- EXCEPTIONS (HOLIDAYS/VACATIONS) ---

  async getExceptionsInRange(guideId, startDate, endDate) {
    const snap = await this.db.collection(`provider_time_offs/${guideId}/exceptions`)
      .where('startDate', '<=', endDate)
      // Note: In Firestore, inequality filters must be on the same field, 
      // so we filter by startDate and do manual filtering for endDate overlap in code,
      // or we just fetch all future exceptions if the collection is small.
      // For thousands of bookings/day, the number of exceptions per guide is small (<50/year).
      .get();
      
    // Filter manually for overlap
    return snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(ex => ex.endDate >= startDate); 
  }

  async addException(guideId, payload) {
    const ref = this.db.collection(`provider_time_offs/${guideId}/exceptions`).doc();
    await ref.set(payload);
    return ref.id;
  }

  // --- LOCKS ---

  /**
   * Used for double-booking conflict detection.
   */
  async getLocksInRange(guideId, startUTC, endUTC) {
    // Queries slot_locks where ID starts with guideId
    // Because lock ID is guideId_YYYYMMDD_HHMM, we can use >= and <= if we structure the query right,
    // OR just query the collection. To avoid scanning, slot_locks has a TTL so it's naturally very small.
    // Let's just query by guideId (requires an index on guideId).
    const snap = await this.db.collection('slot_locks')
      .where('guideId', '==', guideId)
      .where('startTime', '>=', startUTC)
      .where('startTime', '<=', endUTC)
      .get();

    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }

  // --- BOOKINGS (FOR CONFLICT DETECTION) ---

  async getBookingsInRange(guideId, startUTC, endUTC) {
    // Only fetch bookings that aren't cancelled or rejected
    const snap = await this.db.collection('bookings')
      .where('guideId', '==', guideId)
      .where('scheduledStartTime', '>=', startUTC)
      .where('scheduledStartTime', '<=', endUTC)
      .get();

    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
      .filter(b => !['cancelled_by_user', 'cancelled_by_guide', 'cancelled_by_admin', 'rejected'].includes(b.status));
  }
}

module.exports = { CalendarRepository };
