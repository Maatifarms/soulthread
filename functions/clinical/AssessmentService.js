const admin = require('firebase-admin');
const { TimelineService } = require('./TimelineService');
const { EventPublisher } = require('../events/EventPublisher');

class AssessmentService {

  static _calculateScore(answers, templateId) {
    // In a real application, logic to score specific assessments goes here.
    // E.g., summing up answers for PHQ-9 (0-27)
    let total = 0;
    for (const key in answers) {
      total += (parseInt(answers[key], 10) || 0);
    }
    return total;
  }

  static async assignAssessment(db, patientId, guideId, templateId) {
    const assignRef = db.collection('assessments').doc();
    
    await assignRef.set({
      type: templateId,
      patientId,
      guideId,
      status: 'assigned',
      score: null,
      answers: null,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    await EventPublisher.publish('AssessmentAssigned', { assignmentId: assignRef.id, patientId, type: templateId });
    return assignRef.id;
  }

  static async submitAssessment(db, assignmentId, patientId, answers) {
    const assignRef = db.collection('assessments').doc(assignmentId);
    let templateId = null;
    let score = null;

    await db.runTransaction(async (transaction) => {
      const snap = await transaction.get(assignRef);
      if (!snap.exists) throw new Error('Assessment not found');
      if (snap.data().patientId !== patientId) throw new Error('Unauthorized');
      if (snap.data().status === 'completed') throw new Error('Already completed');

      templateId = snap.data().type;
      score = this._calculateScore(answers, templateId);

      transaction.update(assignRef, {
        status: 'completed',
        answers,
        score,
        completedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });

    await EventPublisher.publish('AssessmentCompleted', { assignmentId, patientId, type: templateId, score });
    await TimelineService.addEvent(db, patientId, 'AssessmentCompleted', { assignmentId, type: templateId, score });
    
    return { score };
  }
}

module.exports = { AssessmentService };
