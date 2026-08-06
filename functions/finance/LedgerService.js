const { LedgerRepository } = require('./LedgerRepository');

class LedgerService {
  constructor() {
    this.repo = new LedgerRepository();
  }

  /**
   * Calculates the commission split dynamically.
   * e.g., 20% platform commission.
   */
  static calculateSplit(grossAmount, commissionRate = 0.20) {
    const commissionAmount = Math.round(grossAmount * commissionRate * 100) / 100; // Round to 2 decimals
    const netAmount = grossAmount - commissionAmount;
    return { commissionAmount, netAmount };
  }

  /**
   * Processes ledger entries for a successful booking payment.
   * Must be called within an existing Firestore transaction.
   */
  recordBookingPayment(transaction, paymentId, bookingId, guideId, grossAmount) {
    const { commissionAmount } = LedgerService.calculateSplit(grossAmount);
    this.repo.addBookingEntries(transaction, paymentId, bookingId, guideId, grossAmount, commissionAmount);
  }

  /**
   * Processes ledger entries for a refund.
   * Must be called within an existing Firestore transaction.
   */
  recordRefund(transaction, refundId, bookingId, guideId, grossAmount) {
    const { commissionAmount } = LedgerService.calculateSplit(grossAmount);
    this.repo.addRefundEntries(transaction, refundId, bookingId, guideId, grossAmount, commissionAmount);
  }

  /**
   * Processes ledger entries for a settlement payout.
   */
  recordSettlementPayout(transaction, settlementId, guideId, amount) {
    this.repo.addSettlementEntry(transaction, settlementId, guideId, amount);
  }
}

module.exports = { LedgerService };
