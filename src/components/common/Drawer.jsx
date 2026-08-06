import React from 'react';

/**
 * Drawer component - SoulThread Design System
 */
export const Drawer = ({ className = '', children, ...props }) => {
  return (
    <div className={`drawer ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Drawer;
