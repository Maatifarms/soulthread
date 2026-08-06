class ConflictDetector {
  /**
   * Checks if a proposed slot [candidateStartUTC, candidateEndUTC] overlaps with any locked or booked slots.
   * Both candidate and existing arrays must be UTC ISO strings or Date objects.
   */
  static hasConflict(candidateStart, candidateEnd, existingLocks, existingBookings) {
    const startTime = new Date(candidateStart).getTime();
    const endTime = new Date(candidateEnd).getTime();

    // Check against locks
    if (existingLocks && existingLocks.length > 0) {
      for (const lock of existingLocks) {
        const lockStart = lock.startTime.toDate ? lock.startTime.toDate().getTime() : new Date(lock.startTime).getTime();
        const lockEnd = lock.endTime.toDate ? lock.endTime.toDate().getTime() : new Date(lock.endTime).getTime();
        
        // Overlap logic: (StartA < EndB) and (EndA > StartB)
        if (startTime < lockEnd && endTime > lockStart) {
          // If lock is expired, we could ignore it, but in Firestore we usually use TTL so it auto-deletes.
          // Still good to verify expiration to be absolutely safe in case TTL hasn't run yet.
          const expiresAt = lock.expiresAt.toDate ? lock.expiresAt.toDate().getTime() : new Date(lock.expiresAt).getTime();
          if (Date.now() < expiresAt) {
            return true;
          }
        }
      }
    }

    // Check against confirmed/requested bookings
    if (existingBookings && existingBookings.length > 0) {
      for (const booking of existingBookings) {
        const bookStart = booking.scheduledStartTime.toDate ? booking.scheduledStartTime.toDate().getTime() : new Date(booking.scheduledStartTime).getTime();
        const bookEnd = booking.scheduledEndTime.toDate ? booking.scheduledEndTime.toDate().getTime() : new Date(booking.scheduledEndTime).getTime();
        
        if (startTime < bookEnd && endTime > bookStart) {
          return true;
        }
      }
    }

    return false;
  }
}

module.exports = { ConflictDetector };
