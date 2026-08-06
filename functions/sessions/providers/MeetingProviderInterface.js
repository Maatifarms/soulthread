class MeetingProviderInterface {
  /**
   * Creates a meeting room and returns meeting details.
   * @param {Object} params { sessionId, guideId, patientId, duration }
   * @returns {Promise<{ meetingId: string, hostUrl: string, joinUrl: string }>}
   */
  async createMeeting(params) {
    throw new Error('Method createMeeting() must be implemented');
  }

  /**
   * Retrieves a short-lived token for joining the meeting.
   * @param {string} meetingId 
   * @param {string} role 'guide' or 'patient'
   * @returns {Promise<string>} token
   */
  async getJoinToken(meetingId, role) {
    throw new Error('Method getJoinToken() must be implemented');
  }

  /**
   * Forcibly ends the meeting room.
   * @param {string} meetingId 
   */
  async endMeeting(meetingId) {
    throw new Error('Method endMeeting() must be implemented');
  }
}

module.exports = { MeetingProviderInterface };
