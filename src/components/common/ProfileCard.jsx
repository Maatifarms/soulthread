import React from 'react';

/**
 * ProfileCard component - SoulThread Design System
 */
export const ProfileCard = ({ className = '', children, ...props }) => {
  return (
    <div className={`profilecard ${className}`} {...props}>
      {children}
    </div>
  );
};

export default ProfileCard;
