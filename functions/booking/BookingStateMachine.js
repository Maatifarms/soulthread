const { FieldValue } = require('firebase-admin/firestore');

const BOOKING_STATES = {
  DRAFT: 'draft',
  REQUESTED: 'requested',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  AWAITING_PAYMENT: 'awaiting_payment',
  PAYMENT_FAILED: 'payment_failed',
  PAYMENT_SUCCESSFUL: 'payment_successful',
  CONFIRMED: 'confirmed',
  REMINDER_SCHEDULED: 'reminder_scheduled',
  GUIDE_CHECKED_IN: 'guide_checked_in',
  USER_CHECKED_IN: 'user_checked_in',
  IN_SESSION: 'in_session',
  COMPLETED: 'completed',
  FOLLOW_UP_PENDING: 'follow_up_pending',
  CLOSED: 'closed',
  CANCELLED_BY_USER: 'cancelled_by_user',
  CANCELLED_BY_GUIDE: 'cancelled_by_guide',
  CANCELLED_BY_ADMIN: 'cancelled_by_admin',
  NO_SHOW_USER: 'no_show_user',
  NO_SHOW_GUIDE: 'no_show_guide',
  EMERGENCY_CANCEL: 'emergency_cancel',
  REFUND_PENDING: 'refund_pending',
  REFUND_COMPLETED: 'refund_completed',
  RESCHEDULED: 'rescheduled'
};

const VALID_TRANSITIONS = {
  [BOOKING_STATES.DRAFT]: [BOOKING_STATES.REQUESTED],
  [BOOKING_STATES.REQUESTED]: [
    BOOKING_STATES.ACCEPTED, 
    BOOKING_STATES.REJECTED, 
    BOOKING_STATES.CANCELLED_BY_USER,
    BOOKING_STATES.CANCELLED_BY_ADMIN
  ],
  [BOOKING_STATES.ACCEPTED]: [
    BOOKING_STATES.AWAITING_PAYMENT, 
    BOOKING_STATES.CANCELLED_BY_USER,
    BOOKING_STATES.CANCELLED_BY_ADMIN
  ],
  [BOOKING_STATES.AWAITING_PAYMENT]: [
    BOOKING_STATES.PAYMENT_SUCCESSFUL, 
    BOOKING_STATES.PAYMENT_FAILED, 
    BOOKING_STATES.CANCELLED_BY_USER,
    BOOKING_STATES.CANCELLED_BY_ADMIN
  ],
  [BOOKING_STATES.PAYMENT_FAILED]: [
    BOOKING_STATES.AWAITING_PAYMENT,
    BOOKING_STATES.CANCELLED_BY_USER,
    BOOKING_STATES.CANCELLED_BY_ADMIN
  ],
  [BOOKING_STATES.PAYMENT_SUCCESSFUL]: [
    BOOKING_STATES.CONFIRMED
  ],
  [BOOKING_STATES.CONFIRMED]: [
    BOOKING_STATES.REMINDER_SCHEDULED,
    BOOKING_STATES.GUIDE_CHECKED_IN,
    BOOKING_STATES.USER_CHECKED_IN,
    BOOKING_STATES.RESCHEDULED,
    BOOKING_STATES.CANCELLED_BY_USER,
    BOOKING_STATES.CANCELLED_BY_GUIDE,
    BOOKING_STATES.CANCELLED_BY_ADMIN
  ],
  [BOOKING_STATES.REMINDER_SCHEDULED]: [
    BOOKING_STATES.GUIDE_CHECKED_IN,
    BOOKING_STATES.USER_CHECKED_IN,
    BOOKING_STATES.CANCELLED_BY_USER,
    BOOKING_STATES.CANCELLED_BY_GUIDE,
    BOOKING_STATES.CANCELLED_BY_ADMIN
  ],
  [BOOKING_STATES.GUIDE_CHECKED_IN]: [
    BOOKING_STATES.IN_SESSION,
    BOOKING_STATES.NO_SHOW_USER,
    BOOKING_STATES.CANCELLED_BY_USER,
    BOOKING_STATES.CANCELLED_BY_GUIDE
  ],
  [BOOKING_STATES.USER_CHECKED_IN]: [
    BOOKING_STATES.IN_SESSION,
    BOOKING_STATES.NO_SHOW_GUIDE,
    BOOKING_STATES.CANCELLED_BY_USER,
    BOOKING_STATES.CANCELLED_BY_GUIDE
  ],
  [BOOKING_STATES.IN_SESSION]: [
    BOOKING_STATES.COMPLETED,
    BOOKING_STATES.EMERGENCY_CANCEL
  ],
  [BOOKING_STATES.COMPLETED]: [
    BOOKING_STATES.FOLLOW_UP_PENDING,
    BOOKING_STATES.CLOSED
  ],
  [BOOKING_STATES.FOLLOW_UP_PENDING]: [
    BOOKING_STATES.CLOSED
  ],
  [BOOKING_STATES.CANCELLED_BY_USER]: [
    BOOKING_STATES.REFUND_PENDING
  ],
  [BOOKING_STATES.CANCELLED_BY_GUIDE]: [
    BOOKING_STATES.REFUND_PENDING
  ],
  [BOOKING_STATES.CANCELLED_BY_ADMIN]: [
    BOOKING_STATES.REFUND_PENDING
  ],
  [BOOKING_STATES.REFUND_PENDING]: [
    BOOKING_STATES.REFUND_COMPLETED
  ]
};

class BookingStateMachine {
  
  static isValidTransition(currentState, nextState) {
    const allowed = VALID_TRANSITIONS[currentState] || [];
    return allowed.includes(nextState);
  }

  static async transition(transaction, bookingRef, currentState, nextState, actorId, reason = null) {
    if (!this.isValidTransition(currentState, nextState)) {
      throw new Error(`Illegal state transition from ${currentState} to ${nextState}`);
    }

    const timestamp = FieldValue.serverTimestamp();
    const updatePayload = {
      status: nextState,
      updatedAt: timestamp,
      updatedBy: actorId
    };

    if (nextState === BOOKING_STATES.COMPLETED) {
      updatePayload.completedAt = timestamp;
    }
    if (reason) {
      updatePayload.cancellationReason = reason;
    }

    // Write state change
    transaction.update(bookingRef, updatePayload);

    // Create Audit Log
    const auditRef = bookingRef.collection('audit_logs').doc();
    transaction.set(auditRef, {
      previousState: currentState,
      newState: nextState,
      actorId: actorId,
      reason: reason || null,
      timestamp: timestamp
    });

    // Create Event Log for Event Bus Publisher
    const eventRef = bookingRef.collection('booking_events').doc();
    transaction.set(eventRef, {
      type: `Booking${this._pascalCase(nextState)}`,
      bookingId: bookingRef.id,
      timestamp: timestamp,
      payload: updatePayload
    });

    return true;
  }

  static _pascalCase(snakeStr) {
    return snakeStr.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
  }
}

module.exports = {
  BOOKING_STATES,
  BookingStateMachine
};
