const functions = require('firebase-functions/v1');
const admin = require('firebase-admin');
const { SettlementService } = require('./SettlementService');

/**
 * Runs every Sunday at Midnight to calculate and disburse Guide earnings.
 */
exports.weeklySettlementRun = functions.pubsub
  .schedule('0 0 * * 0') // Sunday midnight
  .timeZone('Asia/Kolkata')
  .onRun(async (context) => {
    console.log('[Finance] Starting weekly settlement run...');
    const db = admin.firestore();
    
    // Fetch all guides who have a payable balance
    // In a huge system, this would page through 'users' where role == 'guide'
    const guidesSnap = await db.collection('users').where('isGuide', '==', true).get();
    
    for (const guideDoc of guidesSnap.docs) {
      try {
        await SettlementService.executeWeeklySettlement(db, guideDoc.id);
      } catch (err) {
        console.error(`[Finance] Failed to process settlement for guide ${guideDoc.id}:`, err);
      }
    }
    
    console.log('[Finance] Weekly settlement run completed.');
  });
