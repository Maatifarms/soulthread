import React from 'react';

/**
 * NoInternetState component - SoulThread Design System
 */
export const NoInternetState = ({ className = '', children, ...props }) => {
  return (
    <div className={`nointernetstate ${className}`} {...props}>
      {children}
    </div>
  );
};

export default NoInternetState;
