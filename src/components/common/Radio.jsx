import React from 'react';

/**
 * Radio component - SoulThread Design System
 */
export const Radio = ({ className = '', children, ...props }) => {
  return (
    <div className={`radio ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Radio;
