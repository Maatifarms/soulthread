import { apiClient } from '../api/apiClient';

export const BookingService = {
  createBooking: async (guideId, startTime, duration) => {
    return await apiClient.post('createBooking', { guideId, startTime, duration });
  },

  acceptBooking: async (bookingId) => {
    return await apiClient.post('acceptBooking', { bookingId });
  },

  cancelBooking: async (bookingId, reason) => {
    return await apiClient.post('cancelBooking', { bookingId, reason });
  }
};
