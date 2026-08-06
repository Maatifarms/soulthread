const { SubscriberIdempotency } = require('../events/SubscriberIdempotency');

class NotificationSubscriber {
  static async handle(eventType, eventData, eventId = null) {
    return await SubscriberIdempotency.execute(eventId, 'NotificationSubscriber', async () => {
      console.log(`[NotificationSubscriber] Processing ${eventType}`);
      // E.g., if eventType === 'BookingRequested', send email/push to Guide
    });
  }
}

module.exports = { NotificationSubscriber };
