const { MeetingProviderInterface } = require('./MeetingProviderInterface');
const crypto = require('crypto');

class JitsiProvider extends MeetingProviderInterface {
  async createMeeting(params) {
    // Generate a secure, unique, and predictable room name
    const hash = crypto.createHash('sha256').update(`${params.sessionId}-${process.env.APP_BASE_URL || 'soulthread'}`).digest('hex');
    const roomName = `soulthread-${hash.substring(0, 16)}`;
    
    // Jitsi's public server is meet.jit.si
    const baseUrl = 'https://meet.jit.si';
    
    return {
      provider: 'jitsi',
      meetingId: roomName,
      joinUrl: `${baseUrl}/${roomName}`,
      hostUrl: `${baseUrl}/${roomName}`
    };
  }

  async getJoinToken(meetingId, role) {
    // Jitsi's public server does not enforce JWTs by default. 
    // We can just return a simple role string. The frontend will use this to determine UI state.
    return role;
  }

  async endMeeting(meetingId) {
    // Jitsi rooms on the public server are ephemeral. They auto-delete when the last person leaves.
    // There is no REST API to explicitly delete them.
    console.log(`[JitsiProvider] Room ${meetingId} marked for closure.`);
    return true;
  }
}

module.exports = { JitsiProvider };
