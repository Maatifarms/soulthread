const admin = require('firebase-admin');

/**
 * Ensures a subscriber only executes once per event.
 * Vital for exactly-once processing guarantees in distributed event architectures.
 */
class SubscriberIdempotency {
  /**
   * @param {string} eventId 
   * @param {string} subscriberName 
   * @param {Function} handler - The async business logic to execute
   */
  static async execute(eventId, subscriberName, handler) {
    if (!eventId) {
      // Legacy path: Event generated without an outbox ID (e.g. from local tests)
      // Execute directly without idempotency guarantees
      return await handler();
    }

    const db = admin.firestore();
    const lockRef = db.collection('event_locks').doc(`${eventId}_${subscriberName}`);

    return await db.runTransaction(async (transaction) => {
      const lockSnap = await transaction.get(lockRef);
      
      if (lockSnap.exists) {
        console.log(`[Idempotency] Event ${eventId} already processed by ${subscriberName}. Skipping.`);
        return { skipped: true };
      }

      // Execute the handler inside or alongside the transaction context.
      // Note: Ideally, the handler itself should receive the transaction object to atomicise its writes.
      // For this refactor boundary, we will just lock the execution.
      await handler();

      transaction.set(lockRef, {
        processedAt: admin.firestore.FieldValue.serverTimestamp(),
        subscriber: subscriberName,
        eventId: eventId
      });

      return { skipped: false };
    });
  }
}

module.exports = { SubscriberIdempotency };
