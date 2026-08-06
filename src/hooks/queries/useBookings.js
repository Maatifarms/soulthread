import { useQuery } from '@tanstack/react-query';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

/**
 * Example React Query Hook using Firestore directly for READs.
 * (Writes should still go through the API Client).
 */
export const useBookings = (guideId, dateRange) => {
  return useQuery({
    queryKey: ['bookings', guideId, dateRange],
    queryFn: async () => {
      const db = getFirestore();
      // Normally dateRange would filter, for this stub we fetch active
      const q = query(
        collection(db, 'bookings'),
        where('guideId', '==', guideId),
        where('status', 'in', ['requested', 'confirmed'])
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
    enabled: !!guideId // Only run if guideId is present
  });
};
