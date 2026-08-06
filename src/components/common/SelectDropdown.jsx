import React from 'react';

/**
 * SelectDropdown component - SoulThread Design System
 */
export const SelectDropdown = ({ className = '', children, ...props }) => {
  return (
    <div className={`selectdropdown ${className}`} {...props}>
      {children}
    </div>
  );
};

export default SelectDropdown;
