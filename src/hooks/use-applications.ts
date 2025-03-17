import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getApplications, 
  getUnconfirmedApplications, 
  getApplicationStatus,
  updateApplicationStatus,
  createParticipation,
  Application
} from '@/api/applications';
import { toast } from 'sonner';
import { useApplicationStore } from '@/store/applicationStore';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

/**
 * Hook for fetching all applications with React Query
 * @returns Query result with applications data, loading state, and error
 */
export function useApplications() {
  return useQuery({
    queryKey: ['applications'],
    queryFn: getApplications,
    staleTime: 60 * 1000, // 1 minute
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook for fetching unconfirmed applications
 * 
 * @returns Query result with unconfirmed applications
 */
export function useUnconfirmedApplications() {
  const { data: session } = useSession();
  
  return useQuery({
    queryKey: ['unconfirmedApplications'],
    queryFn: getUnconfirmedApplications,
    // Don't run the query automatically on mount
    enabled: false,
    // Don't refetch on window focus
    refetchOnWindowFocus: false,
    // Refetch every 5 minutes
    staleTime: 5 * 60 * 1000,
    // Retry failed requests
    retry: 2,
    // Ensure we get fresh data
    refetchOnMount: false,
    // Ensure we don't cache stale data for long
    gcTime: 0,
  });
}

/**
 * Hook for fetching application status for a specific opportunity with React Query
 * @param opportunityId - The ID of the opportunity
 * @returns Query result with application status data, loading state, and error
 */
export function useApplicationStatus(opportunityId: string) {
  const { data: session } = useSession();
  
  return useQuery({
    queryKey: ['application', 'status', opportunityId],
    queryFn: () => getApplicationStatus(opportunityId),
    staleTime: 60 * 1000, // 1 minute
    refetchOnWindowFocus: false,
    // Don't refetch on mount to prevent unnecessary API calls
    refetchOnMount: true,
    // Only run this query if we have an opportunityId and user is logged in
    enabled: !!opportunityId && !!session?.user?.id,
    retry: 1,
  });
}

/**
 * Hook for updating application status
 * 
 * @returns Mutation function for updating application status
 */
export function useUpdateApplicationStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      opportunityId, 
      status 
    }: { 
      opportunityId: string; 
      status: { statusId: string; isApplied: boolean; isConfirm: boolean } 
    }) => updateApplicationStatus(opportunityId, status),
    onSuccess: (_, variables) => {
      const { opportunityId } = variables;
      
      // Invalidate unconfirmed applications query
      queryClient.invalidateQueries({ queryKey: ['unconfirmedApplications'] });
      // Invalidate applications query
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      // Invalidate the specific application status query
      queryClient.invalidateQueries({ queryKey: ['application', 'status', opportunityId] });
      
      console.log("Application status updated successfully for:", opportunityId);
    },
    onError: (error, variables) => {
      console.error("Failed to update application status:", error, "for opportunity:", variables.opportunityId);
    }
  });
}

/**
 * Hook for creating participation record
 * 
 * @returns Mutation function for creating participation
 */
export function useCreateParticipation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      opportunityId, 
      participation 
    }: { 
      opportunityId: string; 
      participation: { year: number; privacyLevel: string } 
    }) => createParticipation(opportunityId, participation),
    onSuccess: () => {
      // Invalidate participations query
      queryClient.invalidateQueries({ queryKey: ['participations'] });
      // Invalidate profile query
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    }
  });
} 