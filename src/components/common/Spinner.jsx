import React from 'react';

/**
 * Spinner component - SoulThread Design System
 */
export const Spinner = ({ className = '', children, ...props }) => {
  return (
    <div className={`spinner ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Spinner;
