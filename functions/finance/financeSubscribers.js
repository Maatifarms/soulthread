const admin = require('firebase-admin');
const { InvoiceService } = require('./InvoiceService');
const { RefundService } = require('./RefundService');

class FinanceSubscriber {
  static async handle(eventType, eventData) {
    const db = admin.firestore();
    
    try {
      if (eventType === 'PaymentSucceeded') {
        // Automatically generate an invoice when payment completes
        const { paymentId, bookingId } = eventData.payload;
        if (paymentId && bookingId) {
          await InvoiceService.generateInvoice(db, paymentId, bookingId);
          console.log(`[FinanceSubscriber] Invoice generated for payment ${paymentId}`);
        }
      } 
      else if (eventType.startsWith('BookingCancelled')) {
        // Refund logic triggered by Calendar/Booking Engine cancellation
        const { paymentId, amount, reason } = eventData.payload;
        if (paymentId) {
          // If amount is not provided, RefundService defaults to Full Refund
          await RefundService.processRefund(db, paymentId, amount, reason || 'Booking Cancelled');
          console.log(`[FinanceSubscriber] Refund processed for payment ${paymentId}`);
        }
      }
    } catch (err) {
      console.error(`[FinanceSubscriber] Failed processing ${eventType}:`, err);
    }
  }
}

module.exports = { FinanceSubscriber };
