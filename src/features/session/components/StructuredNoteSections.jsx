import React from 'react';

export const StructuredNoteSections = ({ content, onChange }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Chief Complaint & Observations</h3>
        <textarea
          className="w-full h-32 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none text-gray-900 leading-relaxed"
          placeholder="Patient presents with..."
          value={content.observations || ''}
          onChange={(e) => onChange({ ...content, observations: e.target.value })}
        />
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Interventions & Techniques</h3>
        <textarea
          className="w-full h-32 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none text-gray-900 leading-relaxed"
          placeholder="Practiced CBT framing, discussed panic cycle..."
          value={content.interventions || ''}
          onChange={(e) => onChange({ ...content, interventions: e.target.value })}
        />
      </div>
      
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Follow-up Plan (Private)</h3>
        <div className="relative">
          <textarea
            className="w-full h-24 p-3 border border-gray-200 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none text-gray-900 leading-relaxed"
            placeholder="Next session focus..."
            value={content.followup || ''}
            onChange={(e) => onChange({ ...content, followup: e.target.value })}
          />
          <span className="absolute top-3 right-3 text-[10px] uppercase font-bold text-gray-400">Private</span>
        </div>
      </div>
    </div>
  );
};
