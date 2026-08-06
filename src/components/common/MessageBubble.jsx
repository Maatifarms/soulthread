import React from 'react';

/**
 * MessageBubble component - SoulThread Design System
 */
export const MessageBubble = ({ className = '', children, ...props }) => {
  return (
    <div className={`messagebubble ${className}`} {...props}>
      {children}
    </div>
  );
};

export default MessageBubble;
