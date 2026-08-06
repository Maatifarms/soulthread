const admin = require('firebase-admin');
const { LedgerService } = require('./LedgerService');
const { EventPublisher } = require('../events/EventPublisher');

class PaymentService {
  /**
   * Initializes a payment intent. In a real scenario, this reaches out to Stripe/Razorpay.
   * Here we create a generic 'payment' document tracking the intent.
   */
  static async createPaymentIntent(db, bookingId, patientId, guideId, amount) {
    const paymentRef = db.collection('payments').doc();
    
    // Publish initiated event
    await EventPublisher.publish('PaymentInitiated', { paymentId: paymentRef.id, bookingId, amount });

    await paymentRef.set({
      bookingId,
      patientId,
      guideId,
      amount,
      status: 'pending',
      provider: 'razorpay', // or stripe
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return paymentRef.id;
  }

  /**
   * Processes a successful webhook callback from a gateway.
   * This MUST be idempotent.
   */
  static async processSuccessfulPayment(db, paymentId) {
    const paymentRef = db.collection('payments').doc(paymentId);
    
    return db.runTransaction(async (transaction) => {
      const snap = await transaction.get(paymentRef);
      if (!snap.exists) throw new Error('Payment not found');
      
      const paymentData = snap.data();
      if (paymentData.status === 'succeeded') {
        // Idempotency check: Already processed
        return paymentData;
      }

      // Update Payment Status
      transaction.update(paymentRef, {
        status: 'succeeded',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Write Ledger Entries
      const ledger = new LedgerService();
      ledger.recordBookingPayment(transaction, paymentId, paymentData.bookingId, paymentData.guideId, paymentData.amount);

      return paymentData;
    });
  }

  /**
   * Directly record a cash payment for an offline session.
   * Bypasses the gateway logic but hits the exact same ledger paths.
   */
  static async recordCashPayment(db, bookingId, guideId, amount) {
    const paymentRef = db.collection('payments').doc();
    const paymentId = paymentRef.id;

    await db.runTransaction(async (transaction) => {
      // 1. Create Payment Record
      transaction.set(paymentRef, {
        bookingId,
        patientId: 'offline_user', // Usually derived from booking
        guideId,
        amount,
        status: 'succeeded',
        provider: 'cash',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // 2. Write Ledger Entries
      const ledger = new LedgerService();
      ledger.recordBookingPayment(transaction, paymentId, bookingId, guideId, amount);
    });

    // Fire Event Bus (which will update booking state to Confirmed and trigger Invoice creation)
    await EventPublisher.publish('PaymentSucceeded', { paymentId, bookingId, amount, provider: 'cash' });

    return paymentId;
  }
}

module.exports = { PaymentService };
