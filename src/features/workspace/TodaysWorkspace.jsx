import React from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { WorkspaceHeader } from './components/WorkspaceHeader';
import { CommandBar } from './components/CommandBar';
import { ActionCards } from './components/ActionCards';
import { ScheduleTimeline } from './components/ScheduleTimeline';
import { WorkspaceStats } from './components/WorkspaceStats';
import { RecentActivityFeed } from './components/RecentActivityFeed';
import { useBookings } from '../../hooks/queries/useBookings';
import { ErrorBoundary } from '../../components/common/ErrorBoundary';

/**
 * The Guide's Operational Command Center.
 * Assembles all workspace widgets into a robust Grid layout.
 */
export const TodaysWorkspace = () => {
  const { user } = useAuthStore();
  
  // Real-world integration: Fetching from real API
  const { data: bookings, isLoading: isLoadingSchedule } = useBookings(user?.uid, 'today');
  
  // These would typically be fetched via their own React Query hooks:
  // e.g., const { data: pendingNotes } = usePendingNotes(user?.uid);
  const pendingNotesCount = bookings?.filter(b => b.status === 'completed' && !b.noteSigned).length || 0;
  const pendingFollowupsCount = 0;
  const assessmentsCount = 0;
  
  // Derive stats dynamically from live bookings data
  const completedCount = bookings?.filter(b => b.status === 'completed').length || 0;
  const stats = {
    sessionsToday: bookings?.length || 0,
    completedSessions: completedCount,
    revenueToday: completedCount * 150, // Assuming fixed rate for now
    pendingPayments: bookings?.filter(b => b.status === 'awaiting_payment').length || 0
  };

  // Activity feed would normally be populated by a useActivityFeed hook listening to Firestore
  const activities = [];

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <CommandBar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <WorkspaceHeader />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
          
          {/* Primary Column - 70% */}
          <div className="lg:col-span-8">
            <ErrorBoundary>
              <ActionCards 
                pendingNotesCount={pendingNotesCount}
                pendingFollowupsCount={pendingFollowupsCount}
                assessmentsCount={assessmentsCount}
              />
            </ErrorBoundary>

            <ErrorBoundary>
              <ScheduleTimeline 
                bookings={bookings} 
                isLoading={isLoadingSchedule} 
              />
            </ErrorBoundary>
          </div>

          {/* Secondary Column - 30% */}
          <div className="lg:col-span-4 space-y-8">
            <ErrorBoundary>
              <WorkspaceStats 
                stats={stats} 
                isLoading={isLoadingSchedule} 
              />
            </ErrorBoundary>

            <ErrorBoundary>
              <RecentActivityFeed 
                activities={activities} 
                isLoading={isLoadingSchedule} 
              />
            </ErrorBoundary>
          </div>

        </div>
      </main>
    </div>
  );
};
