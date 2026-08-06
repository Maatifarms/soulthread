import { apiClient } from '../api/apiClient';

export const ClinicalService = {
  updatePrivateNote: async (noteId, privateContent) => {
    return await apiClient.post('updatePrivateNote', { noteId, privateContent });
  },

  signClinicalNote: async (noteId) => {
    return await apiClient.post('signClinicalNote', { noteId });
  },

  publishPatientSummary: async (noteId, sharedSummary) => {
    return await apiClient.post('publishPatientSummary', { noteId, sharedSummary });
  },

  assignCarePlan: async (patientId, items) => {
    return await apiClient.post('assignCarePlan', { patientId, items });
  },

  completeHomework: async (itemId) => {
    return await apiClient.post('completeHomework', { itemId });
  },

  assignAssessment: async (patientId, templateId) => {
    return await apiClient.post('assignAssessment', { patientId, templateId });
  },

  submitAssessment: async (assignmentId, answers) => {
    return await apiClient.post('submitAssessment', { assignmentId, answers });
  }
};
