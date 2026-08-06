const admin = require('firebase-admin');

class EventPublisher {
  /**
   * Publishes a domain event using the Transactional Outbox Pattern.
   * If a transaction is provided, the event is committed atomically with the business state.
   * A separate Firestore Trigger (EventRouter) will reliably fan out the event to subscribers.
   *
   * @param {string} eventType 
   * @param {Object} eventData 
   * @param {admin.firestore.Transaction} [transaction=null]
   */
  static async publish(eventType, eventData, transaction = null) {
    const db = admin.firestore();
    const eventRef = db.collection('system_events').doc();
    
    const payload = {
      type: eventType,
      data: eventData,
      status: 'PENDING',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      retryCount: 0
    };

    console.log(`[EventPublisher] Writing Outbox Event: ${eventType} (${eventRef.id})`);

    if (transaction) {
      transaction.set(eventRef, payload);
    } else {
      await eventRef.set(payload);
    }
    
    return eventRef.id;
  }
}

module.exports = { EventPublisher };
