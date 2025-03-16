import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getOpportunities, toggleBookmark, incrementViewCount, OpportunitySearchParams } from '@/api/opportunities';
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
    staleTime: 30 * 1000, // 30 seconds
    // Add retry on error
    retry: 1,
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