import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2, // Retry failed requests twice
      staleTime: 1000 * 60 * 5, // Data is fresh for 5 minutes
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      // In production, we'd add offline cache persistence here
    },
    mutations: {
      retry: 1
    }
  }
});
