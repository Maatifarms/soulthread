const admin = require('firebase-admin');
const { ProviderFactory } = require('./providers/ProviderFactory');
const { SessionStateMachine } = require('./SessionStateMachine');
const { EventPublisher } = require('../events/EventPublisher');

class SessionService {
  
  static async createSession(db, bookingId, guideId, patientId, duration, mode = 'video') {
    const sessionRef = db.collection('sessions').doc();
    const sessionId = sessionRef.id;

    const provider = ProviderFactory.getProvider(mode);
    const meetingDetails = await provider.createMeeting({ sessionId, guideId, patientId, duration });

    const payload = {
      bookingId,
      guideId,
      patientId,
      mode,
      duration,
      status: SessionStateMachine.STATES.SCHEDULED,
      meetingDetails,
      workflowStatus: {
        recording: false,
        notesCompleted: false,
        followUpAssigned: false
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await sessionRef.set(payload);

    await EventPublisher.publish('SessionCreated', { sessionId, bookingId, meetingDetails });
    return sessionId;
  }

  static async _updateState(db, sessionId, userId, userRole, newStateEvent, nextStateStr) {
    const sessionRef = db.collection('sessions').doc(sessionId);

    return db.runTransaction(async (transaction) => {
      const snap = await transaction.get(sessionRef);
      if (!snap.exists) throw new Error('Session not found');

      const session = snap.data();
      
      // Enforce authorization
      if (userRole === 'guide' && session.guideId !== userId) throw new Error('Unauthorized guide');
      if (userRole === 'patient' && session.patientId !== userId) throw new Error('Unauthorized patient');

      // State Machine check
      const nextState = SessionStateMachine.transition(session, nextStateStr);

      const updates = { status: nextState, updatedAt: admin.firestore.FieldValue.serverTimestamp() };
      
      // If we are starting the session, set the actual start time
      if (nextState === SessionStateMachine.STATES.IN_PROGRESS && session.status !== SessionStateMachine.STATES.PAUSED) {
         updates.actualStartTime = admin.firestore.FieldValue.serverTimestamp();
      }

      transaction.update(sessionRef, updates);

      // Audit Log
      const eventRef = db.collection(`sessions/${sessionId}/session_events`).doc();
      transaction.set(eventRef, {
        type: newStateEvent,
        userId,
        role: userRole,
        previousState: session.status,
        newState: nextState,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });

      return { nextState, session };
    });
  }

  static async markGuideReady(db, sessionId, guideId) {
    const res = await this._updateState(db, sessionId, guideId, 'guide', 'GuideCheckedIn', SessionStateMachine.STATES.GUIDE_READY);
    await EventPublisher.publish('GuideReady', { sessionId, guideId });
    return res;
  }

  static async markUserReady(db, sessionId, patientId) {
    const res = await this._updateState(db, sessionId, patientId, 'patient', 'UserCheckedIn', SessionStateMachine.STATES.USER_READY);
    await EventPublisher.publish('UserReady', { sessionId, patientId });
    return res;
  }

  static async startSession(db, sessionId, userId, role) {
    const res = await this._updateState(db, sessionId, userId, role, 'SessionInitiated', SessionStateMachine.STATES.SESSION_STARTED);
    // Move to IN_PROGRESS automatically upon start
    await this._updateState(db, sessionId, userId, role, 'SessionRunning', SessionStateMachine.STATES.IN_PROGRESS);
    
    await EventPublisher.publish('SessionStarted', { sessionId });
    return res;
  }

  static async completeSession(db, sessionId, guideId) {
    const res = await this._updateState(db, sessionId, guideId, 'guide', 'GuideEndedSession', SessionStateMachine.STATES.COMPLETED);
    
    // Also update actual end time
    await db.collection('sessions').doc(sessionId).update({
      actualEndTime: admin.firestore.FieldValue.serverTimestamp()
    });

    const session = res.session;
    // Tear down meeting if not offline
    if (session.meetingDetails && session.meetingDetails.meetingId) {
      const provider = ProviderFactory.getProvider(session.mode);
      await provider.endMeeting(session.meetingDetails.meetingId);
    }

    await EventPublisher.publish('SessionCompleted', { sessionId, bookingId: session.bookingId, guideId });
    return res;
  }
}

module.exports = { SessionService };
