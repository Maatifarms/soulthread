import React from 'react';

/**
 * Common Button component using SoulThread Vanilla CSS tokens.
 * Variants: primary, secondary, ghost
 */
export const Button = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  isLoading = false,
  disabled = false,
  onClick,
  type = 'button',
  ...props 
}) => {
  return (
    <button 
      type={type}
      className={`btn btn-${variant} ${className}`}
      disabled={disabled || isLoading}
      onClick={onClick}
      style={{ 
        opacity: disabled || isLoading ? 0.6 : 1, 
        cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
        pointerEvents: disabled || isLoading ? 'none' : 'auto'
      }}
      {...props}
    >
      {isLoading ? (
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
          <span 
            style={{ 
              width: '16px', 
              height: '16px', 
              border: '2px solid transparent', 
              borderTopColor: 'currentColor', 
              borderRadius: '50%', 
              animation: 'spin 1s linear infinite' 
            }} 
          />
          Loading...
        </span>
      ) : children}
    </button>
  );
};

export default Button;
