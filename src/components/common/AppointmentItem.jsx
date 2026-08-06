import React from 'react';

/**
 * AppointmentItem component - SoulThread Design System
 */
export const AppointmentItem = ({ className = '', children, ...props }) => {
  return (
    <div className={`appointmentitem ${className}`} {...props}>
      {children}
    </div>
  );
};

export default AppointmentItem;
