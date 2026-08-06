import { useEffect } from 'react';
import { getFirestore, collection, query, where, onSnapshot } from 'firebase/firestore';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/useAuthStore';

/**
 * Hook to automatically synchronize specific Firestore collections with React Query Cache.
 * This bridges Real-time events into our UI instantly.
 */
export const useFirestoreSync = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user?.uid) return;

    const db = getFirestore();

    // 1. Sync Bookings
    const bookingsQ = query(
      collection(db, 'bookings'),
      where('guideId', '==', user.uid)
    );

    const unsubscribeBookings = onSnapshot(bookingsQ, (snapshot) => {
      // Invalidate the cache to force a background refetch
      // or directly mutate the cache for instant UI updates
      queryClient.invalidateQueries({ queryKey: ['bookings', user.uid] });
      
      // Optionally show a toast if a *new* booking just dropped in
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          // Trigger toast
          // New booking received real-time
        }
      });
    });

    return () => {
      unsubscribeBookings();
    };
  }, [user?.uid, queryClient]);
};
