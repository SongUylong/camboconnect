'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';

/**
 * React Query Provider Component
 * 
 * Initializes and provides the React Query client to the application.
 * Uses staleTime of 1 minute by default for query caching.
 */
export function ReactQueryProvider({ children }: { children: ReactNode }) {
  // Create a new QueryClient instance for each session
  // This prevents sharing cache between users
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
            retry: 1, // Only retry failed queries once
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* We would add React Query DevTools here in development mode */}
      {/* But we'll skip it for now to keep things simple */}
    </QueryClientProvider>
  );
} 