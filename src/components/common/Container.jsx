import React from 'react';

/**
 * Container component - SoulThread Design System
 */
export const Container = ({ className = '', children, ...props }) => {
  return (
    <div className={`container ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Container;
