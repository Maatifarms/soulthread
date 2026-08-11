import React from 'react';

// Two different prop names have been used for "which color" across the app's
// call sites — `status` (a couple of guide-workspace files) and `variant` (the
// majority, including every patient-app caller). They were never actually two
// features, just naming drift; this component now accepts either. `variant`
// wins if both are somehow passed, since it's the more common call site.
// `className` is also now actually applied — previously accepted but silently
// dropped, which broke every caller relying on it for layout (w-fit, flex,
// gap) or custom colors.
const VARIANT_STYLES = {
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  danger: 'bg-red-100 text-red-800',
  neutral: 'bg-gray-100 text-gray-800',
  brand: 'bg-blue-100 text-blue-800',
  secondary: 'bg-gray-100 text-gray-700',
  outline: 'bg-white text-gray-700 border border-gray-300'
};

export const Badge = ({ children, status, variant, className = '' }) => {
  const key = variant || status || 'neutral';
  const colorClasses = VARIANT_STYLES[key] || VARIANT_STYLES.neutral;

  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colorClasses} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
