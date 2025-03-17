import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getOpportunities, toggleBookmark, incrementViewCount, OpportunitySearchParams, clearOpportunitiesCache, checkViewStatus, getOrganizationOpportunities } from '@/api/opportunities';
import { useRouter } from 'next/navigation';
import { useBookmarkStore } from '@/store/bookmarkStore';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';

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
 * Integrates with Zustand store for global state management
 * 
 * @returns Mutation function and state for toggling bookmarks
 */
export function useBookmarkMutation() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const bookmarkStore = useBookmarkStore();
  const { data: session } = useSession();
  
  return useMutation({
    mutationFn: ({ id, bookmarked }: { id: string; bookmarked: boolean }) => {
      // Check if user is authenticated before making the API call
      if (!session?.user) {
        // Return a rejected promise to trigger the onError handler
        return Promise.reject(new Error('Authentication required'));
      }
      return toggleBookmark(id, bookmarked);
    },
    
    // Optimistically update the UI
    onMutate: async ({ id, bookmarked }) => {
      // If not authenticated, don't proceed with optimistic update
      if (!session?.user) {
        return { previousOpportunities: null };
      }
      
      // Add to pending bookmarks to show loading state
      bookmarkStore.addPendingBookmark(id);
      
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['opportunities'] });
      
      // Snapshot the previous value
      const previousOpportunities = queryClient.getQueryData(['opportunities']);
      
      // Update Zustand store (optimistically)
      if (bookmarked) {
        bookmarkStore.addBookmark(id);
      } else {
        bookmarkStore.removeBookmark(id);
      }
      
      // Optimistically update React Query cache
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
      const { id, bookmarked } = variables;
      
      // Handle authentication error
      if (err.message === 'Authentication required') {
        // Redirect to login with callback URL
        const callbackUrl = `/opportunities/${id}`;
        router.push(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
        return;
      }
      
      // Remove from pending bookmarks
      bookmarkStore.removePendingBookmark(id);
      
      // Revert the Zustand store update
      if (bookmarked) {
        bookmarkStore.removeBookmark(id);
      } else {
        bookmarkStore.addBookmark(id);
      }
      
      // Revert React Query cache
      if (context?.previousOpportunities) {
        queryClient.setQueryData(['opportunities'], context.previousOpportunities);
      }
      
      // Show error toast
      toast.error('Failed to update bookmark. Please try again.');
      console.error('Error toggling bookmark:', err);
    },
    
    // After success, update state and invalidate queries
    onSuccess: (data, variables) => {
      const { id } = variables;
      
      // Show success toast
      toast.success(data.message);
    },
    
    // After success or error, clean up
    onSettled: (data, error, variables) => {
      // If authentication error, don't proceed with cleanup
      if (error && error.message === 'Authentication required') {
        return;
      }
      
      const { id } = variables;
      
      // Remove from pending bookmarks
      bookmarkStore.removePendingBookmark(id);
      
      // Clear our custom cache
      clearOpportunitiesCache();
      
      // Invalidate React Query cache
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
      
      // Refresh the page to update server state
      router.refresh();
    },
  });
}

/**
 * Hook for incrementing view count with React Query
 * 
 * @returns Mutation function for incrementing view count
 */
export function useIncrementViewCount() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => incrementViewCount(id),
    onSuccess: (_, id) => {
      // Invalidate the view status query to ensure it's updated
      queryClient.invalidateQueries({ queryKey: ['opportunityView', id] });
    },
    // Limit retries to prevent excessive API calls
    retry: 1,
    // Add a delay between retries
    retryDelay: 3000,
  });
}

/**
 * Hook for checking if user has viewed an opportunity
 * 
 * @param opportunityId - ID of the opportunity to check
 * @returns Query result with view status
 */
export function useCheckViewStatus(opportunityId: string) {
  return useQuery({
    queryKey: ['opportunityView', opportunityId],
    queryFn: () => checkViewStatus(opportunityId),
    // Only run if we have an opportunity ID and user is authenticated
    enabled: !!opportunityId,
    // Don't refetch on window focus
    refetchOnWindowFocus: false,
    // Cache for 30 minutes since view status doesn't change often
    staleTime: 30 * 60 * 1000,
    // Retry failed requests
    retry: 1,
    // Don't refetch on mount
    refetchOnMount: false,
  });
}

/**
 * Hook for fetching organization opportunities with React Query
 * 
 * @param organizationId - ID of the organization
 * @param params - Filter parameters
 * @returns Query result with opportunities data, loading state, and error
 */
export function useOrganizationOpportunities(
  organizationId: string,
  params?: { category?: string; status?: string }
) {
  return useQuery({
    queryKey: ['organizationOpportunities', organizationId, params],
    queryFn: () => getOrganizationOpportunities(organizationId, params),
    staleTime: 60 * 1000, // 60 seconds
    refetchOnWindowFocus: false,
  });
} 