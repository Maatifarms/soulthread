const admin = require('firebase-admin');

class SlotLocker {
  /**
   * Generates a deterministic ID for a slot lock.
   */
  static generateLockId(guideId, startTimeUTC) {
    const timeStr = startTimeUTC.toISOString().replace(/[:.-]/g, '');
    return `${guideId}_${timeStr}`;
  }

  /**
   * Attempts to acquire a lock using a Firestore transaction.
   * Fails if the slot is already locked by someone else and hasn't expired.
   */
  static async acquireLock(db, guideId, userId, startTimeUTC, endTimeUTC) {
    const lockId = this.generateLockId(guideId, startTimeUTC);
    const lockRef = db.collection('slot_locks').doc(lockId);

    return db.runTransaction(async (transaction) => {
      const snap = await transaction.get(lockRef);

      if (snap.exists) {
        const lockData = snap.data();
        const expiresAt = lockData.expiresAt.toDate ? lockData.expiresAt.toDate().getTime() : lockData.expiresAt;
        
        if (Date.now() < expiresAt) {
          throw new Error('Slot is already locked or booked.');
        }
        // If expired, we can overwrite it
      }

      // 10 minute lock TTL
      const expirationDate = new Date(Date.now() + 10 * 60 * 1000);

      const payload = {
        guideId,
        userId,
        startTime: startTimeUTC,
        endTime: endTimeUTC,
        status: 'locked',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        expiresAt: admin.firestore.Timestamp.fromDate(expirationDate)
      };

      transaction.set(lockRef, payload);
      return lockId;
    });
  }

  static async releaseLock(db, lockId, userId) {
    const lockRef = db.collection('slot_locks').doc(lockId);
    return db.runTransaction(async (transaction) => {
      const snap = await transaction.get(lockRef);
      if (!snap.exists) return; // Already gone

      const lockData = snap.data();
      if (lockData.userId !== userId) {
        throw new Error('Unauthorized to release this lock.');
      }

      transaction.delete(lockRef);
    });
  }

  static async confirmLock(db, lockId) {
    const lockRef = db.collection('slot_locks').doc(lockId);
    // Mark as booked, extend expiration indefinitely or delete it in favor of the Booking doc.
    // In our architecture, the Booking doc becomes the source of truth, so we can just delete the lock,
    // OR we can change status to 'booked' and set expiration to session end time.
    // Setting status to 'booked' is cleaner for the ConflictDetector.
    return db.runTransaction(async (transaction) => {
      const snap = await transaction.get(lockRef);
      if (snap.exists) {
        // Extend to next year so TTL doesn't wipe it before session happens
        const farFuture = new Date();
        farFuture.setFullYear(farFuture.getFullYear() + 1);
        
        transaction.update(lockRef, { 
          status: 'booked',
          expiresAt: admin.firestore.Timestamp.fromDate(farFuture)
        });
      }
    });
  }
}

module.exports = { SlotLocker };
