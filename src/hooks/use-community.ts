import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  searchOrganizations, 
  getOrganizationOpportunities, 
  getOrganizationCategories, 
  getOrganizationFollowStatus, 
  toggleOrganizationFollow,
  Organization,
  Opportunity,
  Category,
  CommunityAPIError
} from '@/api/community';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

/**
 * Hook for searching organizations
 * @param query - Search query string
 * @returns Query result with organizations, loading state, and error
 */
export function useOrganizationSearch(query?: string) {
  return useQuery({
    queryKey: ['organizations', 'search', query],
    queryFn: () => searchOrganizations(query),
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      if (error instanceof CommunityAPIError && error.statusCode === 404) {
        return false; // Don't retry on 404
      }
      return failureCount < 3;
    },
  });
}

/**
 * Hook for fetching organization opportunities
 * @param organizationId - ID of the organization
 * @param filters - Optional filters for opportunities
 * @returns Query result with opportunities, loading state, and error
 */
export function useOrganizationOpportunities(
  organizationId: string | null,
  filters?: { status?: string; category?: string }
) {
  return useQuery({
    queryKey: ['organizations', organizationId, 'opportunities', filters],
    queryFn: () => organizationId ? getOrganizationOpportunities(organizationId, filters) : Promise.resolve([]),
    enabled: !!organizationId,
    staleTime: 60 * 1000, // 60 seconds
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      if (error instanceof CommunityAPIError && error.statusCode === 404) {
        return false; // Don't retry on 404
      }
      return failureCount < 3;
    },
  });
}

/**
 * Hook for fetching organization categories
 * @param organizationId - ID of the organization
 * @returns Query result with categories, loading state, and error
 */
export function useOrganizationCategories(organizationId: string | null) {
  return useQuery({
    queryKey: ['organizations', organizationId, 'categories'],
    queryFn: () => organizationId ? getOrganizationCategories(organizationId) : Promise.resolve([]),
    enabled: !!organizationId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      if (error instanceof CommunityAPIError && error.statusCode === 404) {
        return false; // Don't retry on 404
      }
      return failureCount < 3;
    },
  });
}

/**
 * Hook for checking if the user is following an organization
 * @param organizationId - ID of the organization
 * @returns Query result with follow status, loading state, and error
 */
export function useOrganizationFollowStatus(organizationId: string | null) {
  return useQuery({
    queryKey: ['organizations', organizationId, 'followStatus'],
    queryFn: () => organizationId ? getOrganizationFollowStatus(organizationId) : Promise.resolve({ following: false }),
    enabled: !!organizationId,
    staleTime: 60 * 1000, // 60 seconds
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      if (error instanceof CommunityAPIError && error.statusCode === 404) {
        return false; // Don't retry on 404
      }
      return failureCount < 3;
    },
  });
}

/**
 * Hook for toggling organization follow status with React Query
 * @returns Mutation function and state for toggling follow status
 */
export function useToggleOrganizationFollow() {
  const queryClient = useQueryClient();
  const router = useRouter();
  
  return useMutation({
    mutationFn: ({ 
      organizationId, 
      following 
    }: { 
      organizationId: string; 
      following: boolean 
    }) => toggleOrganizationFollow(organizationId, following),
    onMutate: async ({ organizationId, following }) => {
      await queryClient.cancelQueries({ queryKey: ['organizations', organizationId, 'followStatus'] });
      
      const previousStatus = queryClient.getQueryData<{ following: boolean }>(
        ['organizations', organizationId, 'followStatus']
      );
      
      queryClient.setQueryData(['organizations', organizationId, 'followStatus'], { following });
      
      return { previousStatus };
    },
    onSuccess: (data, { organizationId }) => {
      toast.success(data.message);
      router.refresh();
      
      // Update the organization data to reflect new follower count
      queryClient.invalidateQueries({ 
        queryKey: ['organizations'],
        refetchType: 'inactive'
      });
    },
    onError: (error: unknown, { organizationId }, context) => {
      if (context?.previousStatus) {
        queryClient.setQueryData(
          ['organizations', organizationId, 'followStatus'],
          context.previousStatus
        );
      }
      
      const message = error instanceof CommunityAPIError 
        ? error.message 
        : 'Failed to update follow status';
      
      toast.error(message);
    },
    onSettled: (_, __, { organizationId }) => {
      queryClient.invalidateQueries({ 
        queryKey: ['organizations', organizationId, 'followStatus']
      });
    },
  });
} 