const admin = require('firebase-admin');
const { LedgerService } = require('./LedgerService');
const { EventPublisher } = require('../events/EventPublisher');

class SettlementService {
  /**
   * Aggregates all unpaid CREDIT entries in a Guide's Payable account
   * and creates a Settlement batch for payout.
   */
  static async calculateSettlement(db, guideId) {
    const accountId = `GUIDE_PAYABLE_${guideId}`;
    
    // V2 SCALABILITY: Using Aggregate Queries to prevent O(N) memory blowup
    const queryBase = db.collection('ledger_entries').where('accountId', '==', accountId);
    
    const creditAggregate = await queryBase.where('type', '==', 'CREDIT').aggregate({ total: admin.firestore.AggregateField.sum('amount') }).get();
    const debitAggregate = await queryBase.where('type', '==', 'DEBIT').aggregate({ total: admin.firestore.AggregateField.sum('amount') }).get();

    const totalCredits = creditAggregate.data().total || 0;
    const totalDebits = debitAggregate.data().total || 0;

    const netOwed = totalCredits - totalDebits;
    return Math.round(netOwed * 100) / 100;
  }

  /**
   * Called by the weekly CRON job to payout the accumulated balance.
   */
  static async executeWeeklySettlement(db, guideId) {
    try {
      const amountToSettle = await this.calculateSettlement(db, guideId);
      if (amountToSettle <= 0) return null; // Nothing to settle

      const settlementRef = db.collection('settlements').doc();

      await db.runTransaction(async (transaction) => {
        // 1. Create Settlement Record
        transaction.set(settlementRef, {
          guideId,
          amount: amountToSettle,
          status: 'paid', // Or 'processing' if calling external bank API
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        // 2. Add Debit Ledger Entry to zero out the account
        const ledger = new LedgerService();
        ledger.recordSettlementPayout(transaction, settlementRef.id, guideId, amountToSettle);
      });

      await EventPublisher.publish('SettlementCompleted', { settlementId: settlementRef.id, guideId, amount: amountToSettle });

      return settlementRef.id;
    } catch (error) {
      // V2 ERROR HANDLING: Log gracefully without crashing the global cron job
      console.error(`[CRITICAL] Failed to execute settlement for Guide ${guideId}:`, error);
      throw new Error('Settlement execution failed');
    }
  }
}

module.exports = { SettlementService };
