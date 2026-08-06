import React from 'react';

export const WorkspaceStats = ({ stats, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-6"></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-16 bg-gray-100 rounded-lg"></div>
          <div className="h-16 bg-gray-100 rounded-lg"></div>
          <div className="h-16 bg-gray-100 rounded-lg"></div>
          <div className="h-16 bg-gray-100 rounded-lg"></div>
        </div>
      </div>
    );
  }

  const {
    sessionsToday = 0,
    completedSessions = 0,
    revenueToday = 0,
    pendingPayments = 0
  } = stats || {};

  const remaining = sessionsToday - completedSessions;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-5">Today's Snapshot</h3>
      
      <div className="grid grid-cols-2 gap-x-4 gap-y-6">
        
        <div>
          <p className="text-sm text-gray-500 mb-1">Sessions</p>
          <div className="flex items-end">
            <span className="text-2xl font-bold text-gray-900">{sessionsToday}</span>
            <span className="text-sm font-medium text-gray-400 ml-2 mb-1">total</span>
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-500 mb-1">Remaining</p>
          <div className="flex items-end">
            <span className="text-2xl font-bold text-gray-900">{remaining}</span>
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-500 mb-1">Revenue</p>
          <div className="flex items-end">
            <span className="text-2xl font-bold text-green-600">${revenueToday}</span>
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-500 mb-1">Pending</p>
          <div className="flex items-end">
            <span className="text-2xl font-bold text-gray-900">{pendingPayments}</span>
          </div>
        </div>

      </div>
    </div>
  );
};
