import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SessionHeader } from './components/SessionHeader';
import { PatientContextSidebar } from './components/PatientContextSidebar';
import { ClinicalAssistantSidebar } from './components/ClinicalAssistantSidebar';
import { VideoCanvas } from './components/VideoCanvas';
import { LiveNotesEditor } from './components/LiveNotesEditor';
import { ErrorBoundary } from '../../components/common/ErrorBoundary';
import { SessionService } from '../../services/SessionService';
import { useBookings } from '../../hooks/queries/useBookings';
import { useAuthStore } from '../../store/useAuthStore';

/**
 * The Session Workspace.
 * A strict 3-panel layout combining EHR context, Live Video, and real-time Notes.
 * Designed to prevent scrolling and context-switching during a live session.
 */
export const SessionWorkspace = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  // Real world: Fetch specific session details based on sessionId
  // For the vertical slice, we'll try to find it in the bookings query
  const { data: bookings } = useBookings(user?.uid, 'today');
  const sessionDetails = bookings?.find(b => b.id === sessionId) || {
    patientName: 'Jane Doe',
    sessionType: 'CBT Follow-up',
    mode: 'video'
  };
  
  const [elapsed, setElapsed] = useState(0);

  // Simple Session Timer Hook
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleEndSession = async () => {
    try {
      await SessionService.completeSession(sessionId);
      // Wait for the backend Event Bus to fire timeline events, etc.
      // Navigate back to the workspace
      navigate('/');
    } catch (err) {
      console.error('Failed to end session:', err);
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-gray-100 overflow-hidden">
      
      {/* Top Header */}
      <ErrorBoundary>
        <SessionHeader 
          sessionDetails={sessionDetails} 
          elapsedTimer={formatTime(elapsed)} 
          onEndSession={handleEndSession}
        />
      </ErrorBoundary>

      {/* Main 3-Panel Layout */}
      <main className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar (25%) */}
        <div className="hidden lg:block w-1/4 min-w-[300px] h-full">
          <ErrorBoundary>
            <PatientContextSidebar />
          </ErrorBoundary>
        </div>

        {/* Center Canvas (50%) */}
        <div className="flex-1 flex flex-col min-w-0 bg-white border-x border-gray-200 shadow-xl z-10 relative">
          
          {/* Video Region */}
          <div className="p-4 bg-gray-50 border-b border-gray-200 shrink-0">
            <ErrorBoundary>
              <VideoCanvas mode={mockSessionDetails.mode} isConnected={true} />
            </ErrorBoundary>
          </div>

          {/* Notes Region */}
          <div className="flex-1 overflow-hidden">
            <ErrorBoundary>
              <LiveNotesEditor sessionId={sessionId} />
            </ErrorBoundary>
          </div>

        </div>

        {/* Right Sidebar (25%) */}
        <div className="hidden xl:block w-1/4 min-w-[300px] h-full">
          <ErrorBoundary>
            <ClinicalAssistantSidebar patientId={sessionDetails?.patientId || 'mock_patient_id'} />
          </ErrorBoundary>
        </div>

      </main>

    </div>
  );
};
