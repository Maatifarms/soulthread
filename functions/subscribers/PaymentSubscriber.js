class PaymentSubscriber {
  static async handle(eventType, eventData) {
    console.log(`[PaymentSubscriber] Processing ${eventType}`);
    // E.g., if eventType === 'BookingAccepted', trigger Stripe/Razorpay intent
  }
}

module.exports = { PaymentSubscriber };
