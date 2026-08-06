const { JitsiProvider } = require('./JitsiProvider');
const { OfflineProvider } = require('./OfflineProvider');

class ProviderFactory {
  static getProvider(type) {
    switch (type) {
      case 'daily':
      case 'jitsi':
      case 'video':
        return new JitsiProvider();
      case 'offline':
        return new OfflineProvider();
      default:
        // Default to video for now
        return new JitsiProvider();
    }
  }
}

module.exports = { ProviderFactory };
