class SessionStateMachine {
  // Define legal states
  static STATES = {
    SCHEDULED: 'scheduled',
    PREPARING: 'preparing',
    GUIDE_READY: 'guide_ready',
    USER_READY: 'user_ready',
    SESSION_STARTED: 'session_started',
    IN_PROGRESS: 'in_progress',
    PAUSED: 'paused',
    COMPLETED: 'completed',
    FOLLOW_UP_PENDING: 'follow_up_pending',
    CLOSED: 'closed',
    // Exceptions
    GUIDE_NO_SHOW: 'guide_no_show',
    USER_NO_SHOW: 'user_no_show',
    TECHNICAL_FAILURE: 'technical_failure',
    EMERGENCY_END: 'emergency_end',
    CANCELLED_BEFORE_START: 'cancelled_before_start'
  };

  /**
   * Evaluates if a transition from current to next is legal.
   */
  static isLegalTransition(currentState, nextState) {
    const transitions = {
      [this.STATES.SCHEDULED]: [
        this.STATES.PREPARING, 
        this.STATES.CANCELLED_BEFORE_START
      ],
      [this.STATES.PREPARING]: [
        this.STATES.GUIDE_READY, 
        this.STATES.USER_READY, 
        this.STATES.GUIDE_NO_SHOW, 
        this.STATES.USER_NO_SHOW,
        this.STATES.CANCELLED_BEFORE_START
      ],
      [this.STATES.GUIDE_READY]: [
        this.STATES.SESSION_STARTED, 
        this.STATES.USER_NO_SHOW,
        this.STATES.CANCELLED_BEFORE_START
      ],
      [this.STATES.USER_READY]: [
        this.STATES.SESSION_STARTED, 
        this.STATES.GUIDE_NO_SHOW,
        this.STATES.CANCELLED_BEFORE_START
      ],
      [this.STATES.SESSION_STARTED]: [
        this.STATES.IN_PROGRESS,
        this.STATES.TECHNICAL_FAILURE
      ],
      [this.STATES.IN_PROGRESS]: [
        this.STATES.PAUSED, 
        this.STATES.COMPLETED, 
        this.STATES.TECHNICAL_FAILURE, 
        this.STATES.EMERGENCY_END
      ],
      [this.STATES.PAUSED]: [
        this.STATES.IN_PROGRESS, 
        this.STATES.TECHNICAL_FAILURE, 
        this.STATES.COMPLETED
      ],
      [this.STATES.COMPLETED]: [
        this.STATES.FOLLOW_UP_PENDING,
        this.STATES.CLOSED
      ],
      [this.STATES.FOLLOW_UP_PENDING]: [
        this.STATES.CLOSED
      ]
    };

    const allowed = transitions[currentState] || [];
    return allowed.includes(nextState);
  }

  static transition(sessionDoc, nextState) {
    if (!this.isLegalTransition(sessionDoc.status, nextState)) {
      throw new Error(`Illegal state transition from ${sessionDoc.status} to ${nextState}`);
    }
    return nextState;
  }
}

module.exports = { SessionStateMachine };
