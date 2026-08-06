import React from 'react';

export const Badge = ({ children, status = 'neutral' }) => {
  const styles = {
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    neutral: 'bg-gray-100 text-gray-800',
    brand: 'bg-blue-100 text-blue-800' // Assuming blue/purple brand color
  };

  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>
      {children}
    </span>
  );
};
