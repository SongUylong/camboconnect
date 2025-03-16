import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getOpportunities, toggleBookmark, incrementViewCount, OpportunitySearchParams, clearOpportunitiesCache } from '@/api/opportunities';
import { useRouter } from 'next/navigation';

/**
 * Hook for fetching opportunities with React Query
 * 
 * @param params - Search parameters for filtering and pagination
 * @returns Query result with opportunities data, loading state, and error
 */
export function useOpportunities(params: OpportunitySearchParams) {
  return useQuery({
    queryKey: ['opportunities', params],
    queryFn: () => getOpportunities(params),
    // Use the previous data while loading new data
    placeholderData: (previousData) => previousData,
    // Disable automatic refetching on mount to prevent unnecessary API calls
    // when we already have server-rendered data
    refetchOnMount: false,
    // Add a stale time to prevent unnecessary refetches
    staleTime: 60 * 1000, // 60 seconds
    // Disable refetching on window focus
    refetchOnWindowFocus: false,
    // Add retry on error
    retry: 1,
    // Keep data in cache longer
    gcTime: 5 * 60 * 1000, // 5 minutes
    // Use our cached data if available
    initialData: () => {
      // Only run in browser
      if (typeof window === 'undefined') return undefined;
      
      try {
        // Create cache key from params
        const searchParams = new URLSearchParams();
        if (params.category) searchParams.append('category', params.category);
        if (params.status) searchParams.append('status', params.status);
        if (params.sort) searchParams.append('sort', params.sort);
        if (params.q) searchParams.append('q', params.q);
        if (params.page) searchParams.append('page', params.page.toString());
        
        const cacheKey = searchParams.toString() || 'default';
        const cacheItem = sessionStorage.getItem(`opportunities_${cacheKey}`);
        
        if (cacheItem) {
          const parsed = JSON.parse(cacheItem);
          if (Date.now() - parsed.timestamp < 30 * 1000) {
            return parsed.data;
          }
        }
      } catch (error) {
        // Silently fail if storage is not available
      }
      
      return undefined;
    }
  });
}

/**
 * Hook for toggling bookmark status with React Query
 * 
 * @returns Mutation function and state for toggling bookmarks
 */
export function useBookmarkMutation() {
  const queryClient = useQueryClient();
  const router = useRouter();
  
  return useMutation({
    mutationFn: ({ id, bookmarked }: { id: string; bookmarked: boolean }) => 
      toggleBookmark(id, bookmarked),
    
    // Optimistically update the UI
    onMutate: async ({ id, bookmarked }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['opportunities'] });
      
      // Snapshot the previous value
      const previousOpportunities = queryClient.getQueryData(['opportunities']);
      
      // Optimistically update to the new value
      queryClient.setQueriesData({ queryKey: ['opportunities'] }, (old: any) => {
        if (!old) return old;
        
        return {
          ...old,
          opportunities: old.opportunities.map((opp: any) => 
            opp.id === id ? { ...opp, isBookmarked: bookmarked } : opp
          ),
        };
      });
      
      return { previousOpportunities };
    },
    
    // If the mutation fails, roll back to the previous value
    onError: (err, variables, context) => {
      if (context?.previousOpportunities) {
        queryClient.setQueryData(['opportunities'], context.previousOpportunities);
      }
    },
    
    // After success or error, invalidate related queries
    onSettled: () => {
      // Clear our custom cache
      clearOpportunitiesCache();
      // Invalidate React Query cache
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
      router.refresh(); // Refresh the page to update server state
    },
  });
}

/**
 * Hook for incrementing view count with React Query
 * 
 * @returns Mutation function for incrementing view count
 */
export function useIncrementViewCount() {
  return useMutation({
    mutationFn: (id: string) => incrementViewCount(id),
  });
} 