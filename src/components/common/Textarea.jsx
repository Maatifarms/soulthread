import React from 'react';

/**
 * Textarea component - SoulThread Design System
 */
export const Textarea = ({ className = '', children, ...props }) => {
  return (
    <div className={`textarea ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Textarea;
