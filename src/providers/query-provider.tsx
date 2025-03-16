'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

interface QueryProviderProps {
  children: ReactNode;
}

/**
 * Creates a QueryClient with optimized settings for performance
 * - Increased staleTime to reduce unnecessary refetches
 * - Limited retry attempts for failed queries
 * - Increased cache time to keep data available longer
 */
const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        retry: 1, // Only retry failed queries once
        refetchOnWindowFocus: false, // Don't refetch when window regains focus
        gcTime: 5 * 60 * 1000, // Keep unused data in cache for 5 minutes
      },
    },
  });
};

// Create a singleton QueryClient instance
const queryClient = createQueryClient();

/**
 * Provider component that makes React Query available throughout the application
 * Uses a singleton QueryClient to maintain consistent cache across component remounts
 */
export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Add React Query DevTools in development mode if needed */}
      {/* {process.env.NODE_ENV === 'development' && <ReactQueryDevtools />} */}
    </QueryClientProvider>
  );
} 