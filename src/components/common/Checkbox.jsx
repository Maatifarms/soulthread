import React from 'react';

/**
 * Checkbox component - SoulThread Design System
 */
export const Checkbox = ({ className = '', children, ...props }) => {
  return (
    <div className={`checkbox ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Checkbox;
