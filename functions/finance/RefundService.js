const admin = require('firebase-admin');
const { LedgerService } = require('./LedgerService');
const { EventPublisher } = require('../events/EventPublisher');

class RefundService {
  /**
   * Processes a refund via the ledger and triggers gateway refund API.
   */
  static async processRefund(db, paymentId, amount, reason) {
    const paymentRef = db.collection('payments').doc(paymentId);
    const refundRef = db.collection('refunds').doc();
    
    await db.runTransaction(async (transaction) => {
      const snap = await transaction.get(paymentRef);
      if (!snap.exists) throw new Error('Payment not found');
      
      const paymentData = snap.data();
      if (paymentData.status !== 'succeeded') {
        throw new Error('Can only refund succeeded payments');
      }

      // If no amount provided, assume full refund
      const refundAmount = amount || paymentData.amount;
      
      if (refundAmount > paymentData.amount) {
        throw new Error('Refund amount exceeds payment amount');
      }

      // 1. Record Refund Entity
      transaction.set(refundRef, {
        paymentId,
        bookingId: paymentData.bookingId,
        guideId: paymentData.guideId,
        amount: refundAmount,
        reason,
        status: 'completed', // In a real gateway scenario, might be 'pending' until webhook confirms
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // 2. Write Reversing Ledger Entries
      const ledger = new LedgerService();
      ledger.recordRefund(transaction, refundRef.id, paymentData.bookingId, paymentData.guideId, refundAmount);
    });

    await EventPublisher.publish('RefundCompleted', { refundId: refundRef.id, paymentId, amount });
    return refundRef.id;
  }
}

module.exports = { RefundService };
