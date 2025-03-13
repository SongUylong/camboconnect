'use client';

import { createContext, useContext, useState, useRef, useCallback, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { NavigationProgress } from "@/components/ui/navigation-progress";
import { useIsFetching, useQueryClient } from "@tanstack/react-query";

interface NavigationContextType {
  isNavigating: boolean;
  startLoading: () => void;
  stopLoading: () => void;
}

const NavigationContext = createContext<NavigationContextType>({
  isNavigating: false,
  startLoading: () => {},
  stopLoading: () => {},
});

export const useNavigation = () => useContext(NavigationContext);

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [manualLoading, setManualLoading] = useState(false);
  const manualLoadingCount = useRef(0);
  const [showLoading, setShowLoading] = useState(false);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const queryClient = useQueryClient();
  
  // Use React Query's isFetching to determine if any queries are currently fetching
  const isFetching = useIsFetching() > 0;
  
  // Add a delay before showing the loading indicator to prevent flashing
  useEffect(() => {
    // If we're not fetching or manually loading, hide the loading indicator immediately
    if (!isFetching && !manualLoading) {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
      setShowLoading(false);
      return;
    }
    
    // Check if we have any active queries that are fetching but don't have data
    const hasQueriesWithoutData = Array.from(queryClient.getQueryCache().findAll())
      .some(query => {
        // Only consider queries that are fetching
        if (!query.getObserversCount()) return false; // Skip inactive queries
        
        // Check if the query is fetching
        const state = query.state;
        const isFetching = state.fetchStatus === 'fetching';
        
        // If the query has data, don't show loading
        return isFetching && !state.data;
      });
    
    // If we're manually loading or we have queries without data, show loading after delay
    if (manualLoading || hasQueriesWithoutData) {
      // Clear any existing timeout
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      
      // Set a timeout to show the loading indicator after a delay
      // Increased delay to prevent flashing for quick operations
      loadingTimeoutRef.current = setTimeout(() => {
        setShowLoading(true);
      }, 400); // 400ms delay before showing loading
    } else {
      // If all fetching queries have data, don't show loading
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
      setShowLoading(false);
    }
    
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
    };
  }, [isFetching, manualLoading, queryClient]);
  
  // Combine React Query fetching state with manual loading state
  const isNavigating = showLoading;

  // For manual loading control (e.g., operations not tracked by React Query)
  const startLoading = useCallback(() => {
    manualLoadingCount.current += 1;
    setManualLoading(true);
  }, []);

  const stopLoading = useCallback(() => {
    manualLoadingCount.current = Math.max(0, manualLoadingCount.current - 1);
    
    if (manualLoadingCount.current === 0) {
      setManualLoading(false);
    }
  }, []);

  return (
    <NavigationContext.Provider value={{ isNavigating, startLoading, stopLoading }}>
      <NavigationProgress isLoading={isNavigating} />
      {children}
    </NavigationContext.Provider>
  );
} 