import React from 'react';

/**
 * Tooltip component - SoulThread Design System
 */
export const Tooltip = ({ className = '', children, ...props }) => {
  return (
    <div className={`tooltip ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Tooltip;
