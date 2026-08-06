import { BaseRepository } from './BaseRepository';
import { where, orderBy } from 'firebase/firestore';

class BookingRepositoryImpl extends BaseRepository {
  constructor() {
    super('bookings');
  }

  /**
   * Listens to upcoming bookings for a specific patient.
   * @param {string} userId 
   * @param {Function} callback 
   * @returns {Function} Unsubscribe function
   */
  listenUpcomingForPatient(userId, callback) {
    return this.listen([
      where('userId', '==', userId),
      where('status', 'in', ['upcoming', 'requested', 'accepted']),
      orderBy('date', 'asc')
    ], callback);
  }

  /**
   * Listens to all active bookings assigned to a guide.
   * @param {string} guideId 
   * @param {Function} callback 
   * @returns {Function} Unsubscribe function
   */
  listenActiveForGuide(guideId, callback) {
    return this.listen([
      where('guideId', '==', guideId),
      where('status', 'in', ['upcoming', 'requested', 'accepted', 'in_session'])
    ], callback);
  }
}

export const BookingRepository = new BookingRepositoryImpl();
