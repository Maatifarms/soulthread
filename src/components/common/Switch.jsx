import React from 'react';

/**
 * Switch component - SoulThread Design System
 */
export const Switch = ({ className = '', children, ...props }) => {
  return (
    <div className={`switch ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Switch;
