import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Loading from '../common/Loading';

/**
 * Route guard for flows that need a real account (e.g. booking a session) —
 * guest checkout isn't supported (a booking tied to no account can't be read
 * back by anyone but an admin, per Firestore rules). Sends the visitor to log
 * in/sign up first, then back to where they were headed.
 */
export const RequireAuth = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loading />;

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location, authPrompt: 'Please log in or create a free account to book a session.' }} replace />;
  }

  return children;
};
