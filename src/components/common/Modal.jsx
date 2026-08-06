import React from 'react';

/**
 * Modal component - SoulThread Design System
 */
export const Modal = ({ className = '', children, ...props }) => {
  return (
    <div className={`modal ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Modal;
