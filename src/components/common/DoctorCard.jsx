import React from 'react';

/**
 * DoctorCard component - SoulThread Design System
 */
export const DoctorCard = ({ className = '', children, ...props }) => {
  return (
    <div className={`doctorcard ${className}`} {...props}>
      {children}
    </div>
  );
};

export default DoctorCard;
