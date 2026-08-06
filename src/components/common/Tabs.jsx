import React from 'react';

/**
 * Tabs component - SoulThread Design System
 */
export const Tabs = ({ className = '', children, ...props }) => {
  return (
    <div className={`tabs ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Tabs;
