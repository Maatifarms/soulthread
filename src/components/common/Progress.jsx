import React from 'react';

/**
 * Progress component - SoulThread Design System
 */
export const Progress = ({ className = '', children, ...props }) => {
  return (
    <div className={`progress ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Progress;
