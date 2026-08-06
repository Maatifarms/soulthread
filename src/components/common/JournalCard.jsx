import React from 'react';

/**
 * JournalCard component - SoulThread Design System
 */
export const JournalCard = ({ className = '', children, ...props }) => {
  return (
    <div className={`journalcard ${className}`} {...props}>
      {children}
    </div>
  );
};

export default JournalCard;
