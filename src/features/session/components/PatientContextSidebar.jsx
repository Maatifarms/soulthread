import React from 'react';
import { Badge } from '../../common/Badge';
import { Button } from '../../common/Button';

export const PatientContextSidebar = ({ patient }) => {
  // Mock data for the layout
  const pastSessions = [
    { date: 'Oct 12', topic: 'Anxiety Management' },
    { date: 'Oct 05', topic: 'Initial Intake' }
  ];

  return (
    <aside className="h-full bg-gray-50 border-r border-gray-200 overflow-y-auto flex flex-col custom-scrollbar">
      
      {/* Patient Profile Header */}
      <div className="p-6 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-700 font-bold text-xl">
            {patient?.initials || 'JD'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{patient?.name || 'Jane Doe'}</h2>
            <p className="text-sm text-gray-500">28 yrs • {patient?.pronouns || 'She/Her'}</p>
          </div>
        </div>

        {/* Risk Indicators */}
        <div className="flex flex-wrap gap-2 mt-4">
          <Badge status="danger">High Anxiety (GAD-7: 18)</Badge>
          <Badge status="warning">Sleep Disturbance</Badge>
        </div>
      </div>

      {/* Clinical Context */}
      <div className="p-6 flex-1 space-y-8">
        
        {/* Primary Concerns */}
        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Primary Concerns</h3>
          <p className="text-sm text-gray-700 leading-relaxed bg-white p-3 rounded-lg border border-gray-100">
            Experiencing severe panic attacks in crowded spaces. Difficulty maintaining focus at work due to intrusive thoughts.
          </p>
        </div>

        {/* History Timeline */}
        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Recent Timeline</h3>
          <div className="space-y-4 relative before:absolute before:inset-0 before:ml-[5px] before:h-full before:w-0.5 before:bg-gray-200">
            {pastSessions.map((session, idx) => (
              <div key={idx} className="relative flex items-start pl-5 group">
                <div className="absolute left-0 top-1.5 w-3 h-3 rounded-full bg-white border-2 border-gray-300 group-hover:border-blue-500 transition-colors"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{session.topic}</p>
                  <p className="text-xs text-gray-500">{session.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Assessment Trends Mini-chart placeholder */}
        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">PHQ-9 Trend</h3>
          <div className="h-20 bg-white border border-gray-100 rounded-lg flex flex-col items-center justify-center p-2 text-xs text-gray-400">
            [ Trend Chart Placeholder ]
            <span className="mt-1 text-green-600 font-medium">Improving (-4 pts)</span>
          </div>
        </div>

      </div>

      {/* Quick Actions Footer */}
      <div className="p-4 bg-white border-t border-gray-200 grid grid-cols-2 gap-2">
        <Button variant="outline" className="text-xs py-1.5">Full Profile</Button>
        <Button variant="outline" className="text-xs py-1.5">Follow-up</Button>
      </div>

    </aside>
  );
};
