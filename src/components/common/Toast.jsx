import React from 'react';

/**
 * Toast component - SoulThread Design System
 */
export const Toast = ({ className = '', children, ...props }) => {
  return (
    <div className={`toast ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Toast;
