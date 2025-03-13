import { useIsFetching, QueryFilters, useQueryClient } from "@tanstack/react-query";
import { useNavigation } from "@/providers/navigation-provider";
import { useEffect, useState, useRef } from "react";

interface UseLoadingOptions extends QueryFilters {
  initialData?: unknown;
}

/**
 * Custom hook that provides a unified way to check if data is being loaded
 * Combines React Query's isFetching state with the navigation context
 * Prevents loading indicator from showing when data is already cached
 * 
 * @param options Optional options including filters and initialData
 * @returns Boolean indicating if data is being loaded
 */
export function useLoading(options?: UseLoadingOptions) {
  const { isNavigating, startLoading, stopLoading } = useNavigation();
  const queryClient = useQueryClient();
  const [shouldShowLoading, setShouldShowLoading] = useState(false);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Extract filters and initialData from options
  const filters = options ? { queryKey: options.queryKey } : undefined;
  const initialData = options?.initialData;
  
  // If filters are provided, check if queries matching those filters are fetching
  // Otherwise, check if any query is fetching
  const isFetching = filters?.queryKey
    ? useIsFetching(filters) > 0 
    : useIsFetching() > 0;
  
  // Check if we have data in the cache for this query
  const hasData = (() => {
    // If we have initialData, we don't need to show loading
    if (initialData) return true;
    
    if (!filters?.queryKey) return true; // If no queryKey, assume we have data
    
    // Check if we have data in the cache for this query
    const data = queryClient.getQueryData(filters.queryKey);
    return !!data;
  })();
  
  // Add a delay before showing the loading indicator
  useEffect(() => {
    // If we're not fetching or we have data, don't show loading
    if (!isFetching || hasData) {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
      setShouldShowLoading(false);
      return;
    }
    
    // Set a timeout to show the loading indicator after a delay
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }
    
    loadingTimeoutRef.current = setTimeout(() => {
      // Double-check that we're still fetching and don't have data
      const currentData = queryClient.getQueryData(filters?.queryKey || []);
      if (isFetching && !currentData && !initialData) {
        setShouldShowLoading(true);
      }
    }, 300); // 300ms delay before showing loading
    
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
    };
  }, [isFetching, hasData, filters, queryClient, initialData]);

  return {
    isLoading: isNavigating || shouldShowLoading,
    startLoading,
    stopLoading
  };
} 