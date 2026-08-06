import React from 'react';

/**
 * Grid component - SoulThread Design System
 */
export const Grid = ({ className = '', children, ...props }) => {
  return (
    <div className={`grid ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Grid;
