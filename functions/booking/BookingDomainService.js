const { BOOKING_STATES, BookingStateMachine } = require('./BookingStateMachine');
const admin = require('firebase-admin');

/**
 * BookingDomainService houses pure business rules and orchestrates repositories.
 * It is completely unaware of HTTP requests or Cloud Function signatures.
 */
class BookingDomainService {
  /**
   * Constructs the payload and executes the transaction for creating a booking.
   */
  static async createBooking(bookingData, actorId) {
    const db = admin.firestore();
    const bookingRef = db.collection('bookings').doc();
    
    const payload = {
      ...bookingData,
      userId: actorId, 
      status: BOOKING_STATES.REQUESTED, 
      paymentStatus: 'pending',
      bookingNumber: `ST-${Math.floor(10000 + Math.random() * 90000)}`,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: actorId,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: actorId
    };

    await db.runTransaction(async (transaction) => {
      // 1. Check Guide Availability (Double booking rule) - conceptual placeholder
      // 2. Create Booking
      transaction.set(bookingRef, payload);
      
      // 3. Write Audit Log
      const auditRef = bookingRef.collection('audit_logs').doc();
      transaction.set(auditRef, {
        previousState: BOOKING_STATES.DRAFT,
        newState: BOOKING_STATES.REQUESTED,
        actorId: actorId,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });

      // 4. Emit Domain Event
      const eventRef = bookingRef.collection('booking_events').doc();
      transaction.set(eventRef, {
        type: 'BookingRequested',
        bookingId: bookingRef.id,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        payload: payload
      });
    });

    return bookingRef.id;
  }

  /**
   * Determines cancellation state and executes transition.
   */
  static async cancelBooking(bookingId, actorId, actorRole, reason) {
    const db = admin.firestore();
    const bookingRef = db.collection('bookings').doc(bookingId);

    await db.runTransaction(async (transaction) => {
      const snap = await transaction.get(bookingRef);
      if (!snap.exists) throw new Error('NOT_FOUND');
      const currentBooking = snap.data();
      
      let nextState;
      if (currentBooking.userId === actorId) {
        nextState = BOOKING_STATES.CANCELLED_BY_USER;
      } else if (currentBooking.guideId === actorId) {
        nextState = BOOKING_STATES.CANCELLED_BY_GUIDE;
      } else if (actorRole === 'admin') {
        nextState = BOOKING_STATES.CANCELLED_BY_ADMIN;
      } else {
        throw new Error('PERMISSION_DENIED');
      }

      await BookingStateMachine.transition(
        transaction, 
        bookingRef, 
        currentBooking.status, 
        nextState, 
        actorId,
        reason
      );
    });
  }

  /**
   * Determines next state for check-in and executes transition.
   * Returns true if session is ready.
   */
  static async checkIn(bookingId, actorId) {
    const db = admin.firestore();
    const bookingRef = db.collection('bookings').doc(bookingId);
    let isSessionReady = false;

    await db.runTransaction(async (transaction) => {
      const snap = await transaction.get(bookingRef);
      if (!snap.exists) throw new Error('NOT_FOUND');
      const currentBooking = snap.data();
      
      let nextState;
      if (currentBooking.userId === actorId) {
        nextState = currentBooking.status === BOOKING_STATES.GUIDE_CHECKED_IN 
          ? BOOKING_STATES.IN_SESSION 
          : BOOKING_STATES.USER_CHECKED_IN;
      } else if (currentBooking.guideId === actorId) {
        nextState = currentBooking.status === BOOKING_STATES.USER_CHECKED_IN 
          ? BOOKING_STATES.IN_SESSION 
          : BOOKING_STATES.GUIDE_CHECKED_IN;
      } else {
        throw new Error('PERMISSION_DENIED');
      }

      if (nextState === BOOKING_STATES.IN_SESSION) {
        isSessionReady = true;
      }

      await BookingStateMachine.transition(
        transaction, 
        bookingRef, 
        currentBooking.status, 
        nextState, 
        actorId
      );
    });

    return isSessionReady;
  }
  
  /**
   * Accepts a booking if the actor is authorized.
   */
  static async acceptBooking(bookingId, actorId, actorRole) {
    const db = admin.firestore();
    const bookingRef = db.collection('bookings').doc(bookingId);

    await db.runTransaction(async (transaction) => {
      const snap = await transaction.get(bookingRef);
      if (!snap.exists) throw new Error('NOT_FOUND');
      
      const currentBooking = snap.data();
      
      if (currentBooking.guideId !== actorId && actorRole !== 'admin') {
        throw new Error('PERMISSION_DENIED');
      }

      await BookingStateMachine.transition(
        transaction, 
        bookingRef, 
        currentBooking.status, 
        BOOKING_STATES.ACCEPTED, 
        actorId
      );
    });
  }
  
  /**
   * Rejects a booking if the actor is authorized.
   */
  static async rejectBooking(bookingId, actorId, actorRole, reason) {
    const db = admin.firestore();
    const bookingRef = db.collection('bookings').doc(bookingId);

    await db.runTransaction(async (transaction) => {
      const snap = await transaction.get(bookingRef);
      if (!snap.exists) throw new Error('NOT_FOUND');
      const currentBooking = snap.data();
      
      if (currentBooking.guideId !== actorId && actorRole !== 'admin') {
        throw new Error('PERMISSION_DENIED');
      }

      await BookingStateMachine.transition(
        transaction, 
        bookingRef, 
        currentBooking.status, 
        BOOKING_STATES.REJECTED, 
        actorId,
        reason
      );
    });
  }
}

module.exports = { BookingDomainService };
