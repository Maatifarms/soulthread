import React from 'react';

/**
 * Common Card component using SoulThread Vanilla CSS tokens.
 */
export const Card = ({ 
  children, 
  className = '', 
  glass = false, 
  premium = false, 
  ...props 
}) => {
  let cardClass = 'card';
  if (glass) cardClass = 'card-glass';
  if (premium) cardClass = 'premium-card';

  return (
    <div className={`${cardClass} ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Card;
