const { MeetingProviderInterface } = require('./MeetingProviderInterface');

class DailyProvider extends MeetingProviderInterface {
  constructor() {
    super();
    // Use fallback for testing, but in production this should be injected via Secret Manager
    this.apiKey = process.env.DAILY_API_KEY || 'your_daily_api_key_here';
    this.baseUrl = 'https://api.daily.co/v1';
  }

  async createMeeting(params) {
    const roomName = `soulthread-${params.sessionId}-${Date.now()}`;
    const expires = Math.floor(Date.now() / 1000) + (60 * 60 * 2); // 2 hours

    const res = await fetch(`${this.baseUrl}/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        name: roomName,
        privacy: 'private',
        properties: {
          exp: expires,
          enable_chat: true,
          enable_screenshare: false,
          enable_recording: 'cloud',
        }
      })
    });

    if (!res.ok) {
      const err = await res.json();
      console.error('[DailyProvider] Failed to create room:', err);
      throw new Error('Failed to provision Daily.co room');
    }

    const data = await res.json();

    return {
      provider: 'daily',
      meetingId: data.name,
      joinUrl: data.url,
      // For guides, we will generate an owner token on the fly during joinSession
      hostUrl: data.url 
    };
  }

  async getJoinToken(meetingId, role) {
    const isOwner = role === 'guide';
    const expires = Math.floor(Date.now() / 1000) + (60 * 60 * 2);

    const res = await fetch(`${this.baseUrl}/meeting-tokens`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        properties: {
          room_name: meetingId,
          is_owner: isOwner,
          exp: expires,
        }
      })
    });

    if (!res.ok) {
      const err = await res.json();
      console.error('[DailyProvider] Failed to generate token:', err);
      throw new Error('Failed to generate Daily.co token');
    }

    const data = await res.json();
    return data.token;
  }

  async endMeeting(meetingId) {
    const res = await fetch(`${this.baseUrl}/rooms/${meetingId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      }
    });

    if (!res.ok) {
      console.error(`[DailyProvider] Failed to delete room ${meetingId}`);
      return false;
    }

    return true;
  }
}

module.exports = { DailyProvider };
