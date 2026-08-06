import React from 'react';

/**
 * Divider component - SoulThread Design System
 */
export const Divider = ({ className = '', children, ...props }) => {
  return (
    <div className={`divider ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Divider;
