const functions = require('firebase-functions/v1');
const admin = require('firebase-admin');

// Dynamically require subscribers to avoid circular dependencies at boot
const getSubscribers = () => ({
  NotificationSubscriber: require('../subscribers/NotificationSubscriber').NotificationSubscriber,
  CalendarSubscriber: require('../subscribers/CalendarSubscriber').CalendarSubscriber,
  PaymentSubscriber: require('../subscribers/PaymentSubscriber').PaymentSubscriber,
  FinanceSubscriber: require('../finance/financeSubscribers').FinanceSubscriber,
  SessionSubscriber: require('../sessions/SessionSubscriber').SessionSubscriber,
  ClinicalSubscriber: require('../clinical/ClinicalSubscriber').ClinicalSubscriber
});

/**
 * EventRouter is the core of the Transactional Outbox Pattern.
 * It listens for new events in the `system_events` collection and fans them out
 * to the appropriate subscribers. It handles basic retry logic.
 */
exports.processSystemEvent = functions.firestore
  .document('system_events/{eventId}')
  .onCreate(async (snap, context) => {
    const eventId = context.params.eventId;
    const eventPayload = snap.data();

    console.log(`[EventRouter] Routing Event: ${eventPayload.type} (${eventId})`);

    const subscribers = getSubscribers();
    
    // Fire and forget handling by subscribers. 
    // In a pure enterprise environment, this would push to Pub/Sub to decouple execution, 
    // but for our current boundary, invoking them here ensures at-least-once delivery 
    // because this trigger will automatically retry if configured in GCP.
    
    const results = await Promise.allSettled(
      Object.values(subscribers).map(subscriber => 
        subscriber.handle(eventPayload.type, eventPayload.data, eventId)
      )
    );

    const failures = results.filter(r => r.status === 'rejected');
    
    const db = admin.firestore();
    
    if (failures.length === 0) {
      await db.collection('system_events').doc(eventId).update({
        status: 'COMPLETED',
        completedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    } else {
      console.error(`[EventRouter] ${failures.length} subscribers failed for event ${eventId}.`);
      failures.forEach(f => console.error(f.reason));
      
      // Update retry count. If it fails too many times, mark as DEAD_LETTER.
      const maxRetries = 3;
      const nextRetryCount = (eventPayload.retryCount || 0) + 1;
      
      await db.collection('system_events').doc(eventId).update({
        status: nextRetryCount >= maxRetries ? 'DEAD_LETTER' : 'FAILED',
        retryCount: nextRetryCount,
        lastError: failures[0].reason?.message || 'Unknown error',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      // Throwing forces the Cloud Function to retry (if retry on failure is enabled)
      if (nextRetryCount < maxRetries) {
        throw new Error('Partial subscriber failure, triggering function retry.');
      }
    }
  });
