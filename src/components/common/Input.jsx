import React, { forwardRef } from 'react';

/**
 * Common Input component using SoulThread Vanilla CSS tokens.
 */
export const Input = forwardRef(({ 
  label, 
  error, 
  className = '', 
  id,
  type = 'text',
  ...props 
}, ref) => {
  const inputId = id || Math.random().toString(36).substring(7);
  
  return (
    <div className={`input-group ${className}`} style={{ marginBottom: '16px', width: '100%' }}>
      {label && (
        <label 
          htmlFor={inputId} 
          style={{ 
            display: 'block', 
            fontSize: '14px', 
            fontWeight: 600, 
            color: 'var(--color-text-secondary, #3D5550)', 
            marginBottom: '6px' 
          }}
        >
          {label}
        </label>
      )}
      <input 
        id={inputId}
        ref={ref}
        type={type}
        className="input" 
        style={{
          borderColor: error ? 'var(--st-error, #ef4444)' : undefined
        }}
        {...props} 
      />
      {error && (
        <span 
          style={{ 
            color: 'var(--st-error, #ef4444)', 
            fontSize: '12px', 
            marginTop: '4px', 
            display: 'block' 
          }}
        >
          {error}
        </span>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
