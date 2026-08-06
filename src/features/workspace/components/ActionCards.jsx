import React from 'react';

/**
 * Renders actionable "Inbox Zero" style chips.
 * These ONLY render if count > 0, reducing cognitive load.
 */
export const ActionCards = ({ pendingNotesCount = 0, pendingFollowupsCount = 0, assessmentsCount = 0 }) => {
  
  // If there's no actionable work, render nothing to keep UI clean.
  if (pendingNotesCount === 0 && pendingFollowupsCount === 0 && assessmentsCount === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-3 mb-8">
      {pendingNotesCount > 0 && (
        <button className="flex items-center px-4 py-2 bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 rounded-lg transition-colors group">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-yellow-200 text-yellow-800 text-xs font-bold mr-3">
            {pendingNotesCount}
          </span>
          <span className="text-sm font-medium text-yellow-900 group-hover:text-black">Clinical Notes Pending</span>
        </button>
      )}

      {assessmentsCount > 0 && (
        <button className="flex items-center px-4 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors group">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-200 text-blue-800 text-xs font-bold mr-3">
            {assessmentsCount}
          </span>
          <span className="text-sm font-medium text-blue-900 group-hover:text-black">Assessments Awaiting Review</span>
        </button>
      )}

      {pendingFollowupsCount > 0 && (
        <button className="flex items-center px-4 py-2 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors group">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-200 text-purple-800 text-xs font-bold mr-3">
            {pendingFollowupsCount}
          </span>
          <span className="text-sm font-medium text-purple-900 group-hover:text-black">Follow-ups Due</span>
        </button>
      )}
    </div>
  );
};
