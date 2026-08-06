import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { TodaysWorkspace } from '../features/workspace/TodaysWorkspace';
import { SessionWorkspace } from '../features/session/SessionWorkspace';

export const GuideRoutes = () => {
  return (
    <Routes>
      {/* 
        All Guide routes are protected, ensuring only users with the 'guide' 
        role can access them.
      */}
      <Route path="/" element={
        <ProtectedRoute requiredRole="guide">
          <TodaysWorkspace />
        </ProtectedRoute>
      } />
      
      <Route path="/session/:sessionId" element={
        <ProtectedRoute requiredRole="guide">
          <SessionWorkspace />
        </ProtectedRoute>
      } />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
