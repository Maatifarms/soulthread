import { useAuthStore } from '../store/useAuthStore';

/**
 * Centralized hook to verify if the current user possesses a required role.
 */
export const usePermissions = () => {
  const { role, isAuthenticated, isAuthInitialized } = useAuthStore();

  const hasRole = (requiredRole) => {
    if (!isAuthenticated) return false;
    if (role === 'admin') return true; // Admin bypass
    return role === requiredRole;
  };

  return { hasRole, isLoading: !isAuthInitialized };
};
