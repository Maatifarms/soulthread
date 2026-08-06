import React from 'react';

/**
 * A UI wrapper for the video provider integration (e.g., Daily.co).
 * Collapses gracefully if the session is audio-only or offline.
 */
export const VideoCanvas = ({ mode = 'video', isConnected = true }) => {
  if (mode === 'offline') {
    return (
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 flex flex-col items-center justify-center h-48">
        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-3 text-xl">👥</div>
        <h3 className="font-semibold text-gray-700">In-Person Session</h3>
        <p className="text-sm text-gray-500">No video connection required.</p>
      </div>
    );
  }

  return (
    <div className="relative bg-gray-900 rounded-xl overflow-hidden aspect-video shadow-inner">
      {/* Provider Integration Point (WebRTC Canvas would go here) */}
      
      {!isConnected ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/90 text-white p-6 text-center backdrop-blur-sm">
          <div className="w-12 h-12 rounded-full border-2 border-red-500 flex items-center justify-center mb-4 text-red-500">!</div>
          <h3 className="text-lg font-semibold mb-2">Connection Lost</h3>
          <p className="text-sm text-gray-300 max-w-sm mb-6">The patient has disconnected or there is a network issue. The Live Notes editor remains safely fully functional.</p>
          <button className="px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-colors">Attempt Reconnect</button>
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-gray-500">
          [ WebRTC Video Stream Placeholder ]
        </div>
      )}

      {/* Guide PiP (Picture in Picture) */}
      <div className="absolute bottom-4 right-4 w-32 h-24 bg-gray-800 rounded-lg border-2 border-gray-700 shadow-lg overflow-hidden">
        <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">
          [ Guide Camera ]
        </div>
      </div>
    </div>
  );
};
