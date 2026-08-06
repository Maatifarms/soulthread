import { apiClient } from '../api/apiClient';

export const SessionService = {
  joinSession: async (sessionId) => {
    return await apiClient.post('joinSession', { sessionId });
  },

  markReady: async (sessionId) => {
    return await apiClient.post('markReady', { sessionId });
  },

  startSession: async (sessionId) => {
    return await apiClient.post('startSession', { sessionId });
  },

  completeSession: async (sessionId) => {
    return await apiClient.post('completeSession', { sessionId });
  }
};
