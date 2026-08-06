const admin = require('firebase-admin');

class LedgerRepository {
  constructor() {
    this.db = admin.firestore();
  }

  /**
   * Generates 3 immutable entries for a double-entry accounting system inside a transaction.
   * 1. Credit Platform Gross Account (Total paid by patient)
   * 2. Debit Platform Commission (SoulThread's cut)
   * 3. Credit Guide Payable Account (Net Earnings for Guide)
   */
  addBookingEntries(transaction, paymentId, bookingId, guideId, grossAmount, commissionAmount) {
    const netAmount = grossAmount - commissionAmount;
    const timestamp = admin.firestore.FieldValue.serverTimestamp();

    const createEntry = (accountId, type, amount, description) => {
      const entryRef = this.db.collection('ledger_entries').doc();
      transaction.set(entryRef, {
        accountId,
        transactionId: paymentId,
        referenceType: 'booking',
        referenceId: bookingId,
        type, // 'CREDIT' | 'DEBIT'
        amount,
        description,
        createdAt: timestamp
      });
    };

    // 1. Credit the global platform holding account with the full gross amount received
    createEntry('PLATFORM_GROSS', 'CREDIT', grossAmount, `Gross receipt for booking ${bookingId}`);

    // 2. Debit the commission account (Recognize Revenue for the platform)
    createEntry('PLATFORM_COMMISSION', 'DEBIT', commissionAmount, `Platform commission for booking ${bookingId}`);

    // 3. Credit the Guide's payable account (Liability for the platform)
    createEntry(`GUIDE_PAYABLE_${guideId}`, 'CREDIT', netAmount, `Guide net earnings for booking ${bookingId}`);
  }

  /**
   * Reverses entries (e.g. on full refund)
   */
  addRefundEntries(transaction, refundId, bookingId, guideId, grossAmount, commissionAmount) {
    const netAmount = grossAmount - commissionAmount;
    const timestamp = admin.firestore.FieldValue.serverTimestamp();

    const createEntry = (accountId, type, amount, description) => {
      const entryRef = this.db.collection('ledger_entries').doc();
      transaction.set(entryRef, {
        accountId,
        transactionId: refundId,
        referenceType: 'refund',
        referenceId: bookingId,
        type,
        amount,
        description,
        createdAt: timestamp
      });
    };

    createEntry('PLATFORM_GROSS', 'DEBIT', grossAmount, `Gross refund for booking ${bookingId}`);
    createEntry('PLATFORM_COMMISSION', 'CREDIT', commissionAmount, `Commission reversal for booking ${bookingId}`);
    createEntry(`GUIDE_PAYABLE_${guideId}`, 'DEBIT', netAmount, `Guide earnings reversal for booking ${bookingId}`);
  }

  /**
   * When a settlement is paid out to a guide, we debit their payable account to zero it out.
   */
  addSettlementEntry(transaction, settlementId, guideId, amount) {
    const entryRef = this.db.collection('ledger_entries').doc();
    transaction.set(entryRef, {
      accountId: `GUIDE_PAYABLE_${guideId}`,
      transactionId: settlementId,
      referenceType: 'settlement',
      referenceId: settlementId,
      type: 'DEBIT',
      amount,
      description: `Payout settlement ${settlementId}`,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
  }
}

module.exports = { LedgerRepository };
