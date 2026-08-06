import React from 'react';
import { useAutosave } from '../hooks/useAutosave';
import { StructuredNoteSections } from './StructuredNoteSections';
import { ClinicalService } from '../../services/ClinicalService';

export const LiveNotesEditor = ({ sessionId }) => {
  // We use object state to represent the structured notes
  const initialData = { observations: '', interventions: '', followup: '' };
  
  // Custom hook handles debouncing and offline queues
  const { content, updateContent, status } = useAutosave(sessionId, initialData, async (id, data) => {
    // Real API Save
    await ClinicalService.updatePrivateNote(id, JSON.stringify(data));
  });

  const renderStatus = () => {
    switch (status) {
      case 'saving': return <span className="text-gray-400">Saving...</span>;
      case 'saved': return <span className="text-green-600 flex items-center"><svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> Saved securely</span>;
      case 'offline_draft': return <span className="text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded text-xs border border-yellow-200">Offline Draft. Will sync when reconnected.</span>;
      case 'error': return <span className="text-red-600">Failed to save. Retrying...</span>;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Editor Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100 bg-gray-50/50">
        <div className="flex space-x-6">
          <button className="text-sm font-semibold text-black border-b-2 border-black pb-3 -mb-3">Private Clinical Notes</button>
          <button className="text-sm font-medium text-gray-400 hover:text-gray-600 pb-3 -mb-3">Shared Summary</button>
        </div>
        <div className="text-xs font-medium">
          {renderStatus()}
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        <StructuredNoteSections content={content} onChange={updateContent} />
      </div>

      {/* Editor Footer / Formatting bar placeholder */}
      <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between text-gray-400 bg-gray-50/50">
        <div className="flex space-x-4">
          <button className="hover:text-gray-600 font-bold">B</button>
          <button className="hover:text-gray-600 italic">I</button>
          <button className="hover:text-gray-600 underline">U</button>
          <div className="w-px h-5 bg-gray-200"></div>
          <button className="hover:text-gray-600 flex items-center text-xs">
            <span className="mr-1">⚡</span> Insert Template
          </button>
        </div>
        <button className="text-xs bg-black text-white px-3 py-1.5 rounded-md hover:bg-gray-800 font-medium">
          Sign & Lock Note
        </button>
      </div>

    </div>
  );
};
