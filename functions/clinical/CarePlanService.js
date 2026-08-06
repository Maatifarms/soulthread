const admin = require('firebase-admin');
const { TimelineService } = require('./TimelineService');
const { EventPublisher } = require('../events/EventPublisher');

class CarePlanService {
  /**
   * Recalculates the global progress percentage of a Care Plan based on its items.
   */
  static async _recalculateProgress(transaction, planRef, db) {
    const itemsSnap = await transaction.get(db.collection('care_plan_items').where('planId', '==', planRef.id));
    if (itemsSnap.empty) return;

    let completed = 0;
    itemsSnap.forEach(doc => {
      if (doc.data().status === 'completed') completed++;
    });

    const progress = Math.round((completed / itemsSnap.size) * 100);
    const status = progress === 100 ? 'completed' : 'active';
    
    transaction.update(planRef, { progress, status, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
  }

  static async assignCarePlan(db, patientId, guideId, items) {
    const planRef = db.collection('care_plans').doc();
    const batch = db.batch();

    batch.set(planRef, {
      patientId,
      guideId,
      status: 'active',
      progress: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    items.forEach(item => {
      const itemRef = db.collection('care_plan_items').doc();
      batch.set(itemRef, {
        planId: planRef.id,
        patientId,
        type: item.type,
        resourceId: item.resourceId || null,
        title: item.title || null,
        dueDate: admin.firestore.Timestamp.fromDate(new Date(item.dueDate)),
        status: 'assigned',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });

    await batch.commit();

    await EventPublisher.publish('CarePlanAssigned', { planId: planRef.id, patientId, guideId });
    await TimelineService.addEvent(db, patientId, 'CarePlanAssigned', { planId: planRef.id, itemCount: items.length });

    return planRef.id;
  }

  static async completeHomework(db, itemId, patientId) {
    const itemRef = db.collection('care_plan_items').doc(itemId);
    
    await db.runTransaction(async (transaction) => {
      const snap = await transaction.get(itemRef);
      if (!snap.exists) throw new Error('Item not found');
      if (snap.data().patientId !== patientId) throw new Error('Unauthorized');

      transaction.update(itemRef, { 
        status: 'completed', 
        completedAt: admin.firestore.FieldValue.serverTimestamp() 
      });

      const planRef = db.collection('care_plans').doc(snap.data().planId);
      await this._recalculateProgress(transaction, planRef, db);
    });

    await EventPublisher.publish('HomeworkCompleted', { itemId, patientId });
    await TimelineService.addEvent(db, patientId, 'HomeworkCompleted', { itemId });
  }
}

module.exports = { CarePlanService };
