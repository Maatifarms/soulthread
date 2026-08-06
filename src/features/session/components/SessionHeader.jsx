import React from 'react';
import { Button } from '../../common/Button';
import { Badge } from '../../common/Badge';

export const SessionHeader = ({ sessionDetails, elapsedTimer, onEndSession }) => {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 shrink-0">
      
      {/* Session Context */}
      <div className="flex items-center space-x-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{sessionDetails?.patientName || 'Session Context'}</h1>
          <div className="flex items-center space-x-3 mt-1 text-sm text-gray-500">
            <span>{sessionDetails?.sessionType || 'Therapy Session'}</span>
            <span>•</span>
            <span className="flex items-center">
              <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
              {sessionDetails?.mode === 'video' ? 'Video Connected' : 'In-Person'}
            </span>
          </div>
        </div>
      </div>

      {/* Timer & Controls */}
      <div className="flex items-center space-x-6">
        <div className="text-center">
          <div className="text-2xl font-mono font-medium text-gray-900 tabular-nums">
            {elapsedTimer || '00:00'}
          </div>
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-0.5">Elapsed</div>
        </div>
        
        <div className="h-8 w-px bg-gray-200 mx-2"></div>
        
        <div className="flex items-center space-x-3">
          <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
            Emergency
          </Button>
          <Button variant="outline">
            Pause
          </Button>
          <Button 
            variant="primary" 
            className="bg-red-600 hover:bg-red-700 text-white focus:ring-red-500"
            onClick={onEndSession}
          >
            End Session
          </Button>
        </div>
      </div>

    </header>
  );
};
