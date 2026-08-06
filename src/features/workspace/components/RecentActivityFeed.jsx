import React from 'react';

export const RecentActivityFeed = ({ activities = [], isLoading }) => {
  if (isLoading) {
    return (
      <div className="mt-8">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-5">Live Activity</h3>
        <div className="space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex-shrink-0"></div>
              <div className="h-4 bg-gray-100 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activities.length === 0) {
    return null;
  }

  const getIconForType = (type) => {
    switch (type) {
      case 'PatientJoined': return '👋';
      case 'PaymentReceived': return '💵';
      case 'BookingAccepted': return '✅';
      case 'NoteDrafted': return '📝';
      default: return '⚡';
    }
  };

  return (
    <div className="mt-8">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-5">Live Activity</h3>
      
      <ul className="space-y-5 relative before:absolute before:inset-0 before:ml-[15px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
        {activities.map((activity, idx) => (
          <li key={idx} className="relative flex items-center justify-between group">
            
            <div className="flex items-center space-x-4 relative z-10 w-full bg-white group-hover:bg-gray-50 p-2 -ml-2 rounded-lg transition-colors cursor-default">
              <div className="flex items-center justify-center w-8 h-8 bg-white border border-gray-200 rounded-full shadow-sm text-sm">
                {getIconForType(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 truncate">
                  <span className="font-semibold">{activity.subject}</span> {activity.action}
                </p>
                <p className="text-xs text-gray-500">{activity.timeStr}</p>
              </div>
            </div>
            
          </li>
        ))}
      </ul>
    </div>
  );
};
