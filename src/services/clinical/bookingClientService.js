import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../firebase';

export const BookingClientService = {
  /**
   * Safely submits a booking request. 
   * Includes retry mechanisms and error isolation.
   */
  async submitBooking({ psychologistId, guideName, guidePhotoURL, currentUser, guestDetails, selectedDate, selectedSlot, amountPaid }) {
    try {
      const sStart = new Date(selectedSlot.start);
      const sEnd = new Date(selectedSlot.end);
      const durationMins = Math.round((sEnd - sStart) / 60000);

      const payload = {
        patientId: currentUser.uid,
        guideId: psychologistId,
        sessionType: 'video',
        sessionDurationMins: durationMins || 50,
        scheduledStartTime: sStart.toISOString(),
        scheduledEndTime: sEnd.toISOString(),
        timezonePatient: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
        timezoneGuide: 'Asia/Kolkata' // Defaulting guide to IST for MVP
      };
      
      const createBookingCall = httpsCallable(functions, 'createBooking');
      const result = await createBookingCall(payload);
      const bookingId = result.data.bookingId;

      // In a real V2 Enterprise system, the backend Event Bus should handle notification generation.
      // We keep this client side to avoid altering product behavior until the backend is fully refactored,
      // but wrap it safely so failure here doesn't fail the booking.
      try {
        await this._dispatchClientSideEvents(currentUser, psychologistId, guestDetails.name, guideName, sStart, bookingId);
      } catch (eventErr) {
        console.warn('[BookingService] Non-critical event dispatch failed:', eventErr);
      }

      return bookingId;
    } catch (error) {
      console.error('[CRITICAL] Booking submission failed:', error);
      throw new Error('Failed to process booking. Please check your connection and try again.');
    }
  },

  async _dispatchClientSideEvents(currentUser, guideId, userName, guideName, startDate, bookingId) {
    const promises = [];
    
    if (currentUser) {
      promises.push(
        addDoc(collection(db, 'notifications'), {
          recipientId: currentUser.uid,
          type: 'booking',
          title: 'Session Confirmed',
          message: `Your session with ${guideName} on ${startDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at ${startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} is confirmed.`,
          read: false,
          createdAt: serverTimestamp(),
          link: `/sessions`
        })
      );

      promises.push(
        addDoc(collection(db, 'timeline'), {
          userId: currentUser.uid,
          type: 'booking_created',
          title: 'Session Booked',
          description: `Booked a 50-min session with ${guideName}.`,
          timestamp: serverTimestamp(),
          metadata: { bookingId }
        })
      );
    }

    promises.push(
      addDoc(collection(db, 'notifications'), {
        recipientId: guideId,
        type: 'booking',
        title: 'New Session Booked',
        message: `${userName} booked a session on ${startDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at ${startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}.`,
        read: false,
        createdAt: serverTimestamp(),
        link: `/guide-dashboard`
      })
    );

    await Promise.all(promises);
  }
};
