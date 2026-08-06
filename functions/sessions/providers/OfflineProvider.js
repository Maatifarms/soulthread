const { MeetingProviderInterface } = require('./MeetingProviderInterface');

class OfflineProvider extends MeetingProviderInterface {
  async createMeeting(params) {
    // Face-to-Face sessions have no URLs
    return {
      provider: 'offline',
      meetingId: `offline-${params.sessionId}`,
      joinUrl: null,
      hostUrl: null
    };
  }

  async getJoinToken(meetingId, role) {
    return null; // No tokens needed for physical check-ins
  }

  async endMeeting(meetingId) {
    return true;
  }
}

module.exports = { OfflineProvider };
