import React from 'react';
import { Button } from '../../common/Button';
import { ClinicalService } from '../../services/ClinicalService';

export const ClinicalAssistantSidebar = ({ patientId }) => {
  const carePlanItems = [
    { id: 1, text: 'Complete Daily Mood Log', completed: true },
    { id: 2, text: 'Read: Cognitive Distortions', completed: false },
    { id: 3, text: 'Breathing Exercise (5 mins)', completed: false }
  ];

  const suggestedResources = [
    { title: 'Grounding Techniques 5-4-3-2-1', type: 'Worksheet' },
    { title: 'Understanding Panic Cycle', type: 'Article' }
  ];

  return (
    <aside className="h-full bg-gray-50 border-l border-gray-200 overflow-y-auto flex flex-col custom-scrollbar">
      
      <div className="p-4 bg-white border-b border-gray-200">
        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center justify-between">
          Clinical Assistant
          <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-semibold">AI Ready</span>
        </h2>
      </div>

      <div className="p-6 flex-1 space-y-8">
        
        {/* Care Plan Checklist */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Care Plan</h3>
            <span className="text-xs font-medium text-gray-500">33%</span>
          </div>
          
          <div className="space-y-3 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            {carePlanItems.map(item => (
              <label key={item.id} className={`flex items-start cursor-pointer group ${item.completed ? 'opacity-50' : ''}`}>
                <div className="relative flex items-center justify-center mt-0.5">
                  <input type="checkbox" className="sr-only" checked={item.completed} readOnly />
                  <div className={`w-4 h-4 rounded border ${item.completed ? 'bg-black border-black text-white' : 'border-gray-300 group-hover:border-black'} flex items-center justify-center transition-colors`}>
                    {item.completed && (
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                    )}
                  </div>
                </div>
                <span className={`ml-3 text-sm ${item.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                  {item.text}
                </span>
              </label>
            ))}
            
            <button 
              className="w-full mt-4 text-xs font-medium text-blue-600 hover:text-blue-800 border border-dashed border-blue-200 rounded p-2 text-center transition-colors"
              onClick={async () => {
                await ClinicalService.assignCarePlan(patientId, [{ type: 'custom_task', text: 'New Task' }]);
              }}
            >
              + Assign New Task
            </button>
          </div>
        </div>

        {/* Pending Assessments */}
        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Assessments</h3>
          <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-orange-900">PHQ-9 Due Today</span>
              <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse"></span>
            </div>
            <p className="text-xs text-orange-700 mb-3">Patient has not submitted yet.</p>
            <Button 
              variant="outline" 
              className="w-full text-xs bg-white border-orange-200 text-orange-800 py-1.5 hover:bg-orange-100"
              onClick={async () => {
                await ClinicalService.assignAssessment(patientId, 'phq-9');
              }}
            >
              Send Reminder
            </Button>
          </div>
        </div>

        {/* Suggested Resources */}
        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Suggested Resources</h3>
          <ul className="space-y-2">
            {suggestedResources.map((res, idx) => (
              <li key={idx} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100 hover:border-gray-300 transition-colors cursor-pointer group">
                <div className="min-w-0 flex-1 mr-3">
                  <p className="text-sm font-medium text-gray-900 truncate">{res.title}</p>
                  <p className="text-xs text-gray-500">{res.type}</p>
                </div>
                <button className="text-gray-400 group-hover:text-blue-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                </button>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </aside>
  );
};
