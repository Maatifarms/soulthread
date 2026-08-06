import React from 'react';

/**
 * SidebarItem component - SoulThread Design System
 */
export const SidebarItem = ({ className = '', children, ...props }) => {
  return (
    <div className={`sidebaritem ${className}`} {...props}>
      {children}
    </div>
  );
};

export default SidebarItem;
