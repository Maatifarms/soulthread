import React from 'react';
import { useAuthStore } from '../../../store/useAuthStore';

export const WorkspaceHeader = () => {
  const { user } = useAuthStore();
  const today = new Date();
  
  const options = { weekday: 'long', month: 'long', day: 'numeric' };
  const formattedDate = today.toLocaleDateString('en-US', options);

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-4 border-b border-gray-200">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Good morning, Dr. {user?.lastName || 'Guide'}</h1>
        <p className="text-sm text-gray-500 mt-1">{formattedDate}</p>
      </div>
      <div className="mt-4 md:mt-0 flex items-center space-x-4">
        {/* Command Bar Hint */}
        <div className="hidden md:flex items-center text-sm text-gray-400 bg-gray-50 px-3 py-1.5 rounded-md border border-gray-200">
          <span className="mr-2">Search anything</span>
          <kbd className="font-sans font-medium text-xs bg-white px-1.5 py-0.5 rounded border border-gray-200 shadow-sm">⌘K</kbd>
        </div>
        
        {/* Working Status Toggle (Stub) */}
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
          <span className="text-sm font-medium text-gray-700">Accepting Sessions</span>
        </div>
      </div>
    </header>
  );
};
