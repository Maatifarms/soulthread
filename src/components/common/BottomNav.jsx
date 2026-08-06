import React from 'react';

/**
 * BottomNav component - SoulThread Design System
 */
export const BottomNav = ({ className = '', children, ...props }) => {
  return (
    <div className={`bottomnav ${className}`} {...props}>
      {children}
    </div>
  );
};

export default BottomNav;
