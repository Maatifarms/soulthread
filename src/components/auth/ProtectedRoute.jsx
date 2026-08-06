import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { usePermissions } from '../../hooks/usePermissions';

/**
 * Route guard preventing unauthorized access to specific modules (e.g., Guide Workspace).
 */
export const ProtectedRoute = ({ children, requiredRole }) => {
  const { hasRole, isLoading } = usePermissions();
  const location = useLocation();

  if (isLoading) {
    return <div className="flex h-screen w-full items-center justify-center">Loading Secure Workspace...</div>;
  }

  if (!hasRole(requiredRole)) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};
