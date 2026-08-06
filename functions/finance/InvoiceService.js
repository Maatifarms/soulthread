const admin = require('firebase-admin');
const { EventPublisher } = require('../events/EventPublisher');

class InvoiceService {
  /**
   * Automatically generates an Invoice record when a payment succeeds.
   * GST-ready. In a real app, this would also trigger a PDF generation cloud function.
   */
  static async generateInvoice(db, paymentId, bookingId) {
    const invoiceRef = db.collection('invoices').doc();
    
    // Fetch payment and booking details
    const paymentSnap = await db.collection('payments').doc(paymentId).get();
    const bookingSnap = await db.collection('bookings').doc(bookingId).get();
    
    if (!paymentSnap.exists || !bookingSnap.exists) {
      throw new Error('Required documents missing for invoice generation');
    }
    
    const paymentData = paymentSnap.data();
    const bookingData = bookingSnap.data();

    // Unique sequential-looking ID format
    const hashStr = Math.random().toString(36).substring(2, 6).toUpperCase();
    const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const invoiceNumber = `INV-${dateStr}-${hashStr}`;

    const grossAmount = paymentData.amount;
    
    // Simplified GST calculation (e.g. 18% inclusive)
    // If gross = 1500, Base = 1500 / 1.18 = 1271.18, GST = 228.82
    const baseAmount = Math.round((grossAmount / 1.18) * 100) / 100;
    const gstAmount = Math.round((grossAmount - baseAmount) * 100) / 100;

    const payload = {
      invoiceNumber,
      paymentId,
      bookingId,
      patientId: bookingData.patientId,
      guideId: bookingData.guideId,
      grossAmount,
      baseAmount,
      gstAmount,
      gstPercentage: 18,
      status: 'generated',
      pdfUrl: null, // Would be updated by a separate PDF storage function
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await invoiceRef.set(payload);

    await EventPublisher.publish('InvoiceGenerated', { invoiceId: invoiceRef.id, invoiceNumber, bookingId });
    
    return invoiceRef.id;
  }
}

module.exports = { InvoiceService };
