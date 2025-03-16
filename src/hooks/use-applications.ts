import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getApplications, 
  getUnconfirmedApplications, 
  getApplicationStatus,
  updateApplicationStatus,
  createParticipation
} from '@/api/applications';
import { toast } from 'sonner';
import { useApplicationStore } from '@/store/applicationStore';
import { useRouter } from 'next/navigation';

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
 * Hook for fetching unconfirmed applications with React Query
 * @returns Query result with unconfirmed applications data, loading state, and error
 */
export function useUnconfirmedApplications() {
  return useQuery({
    queryKey: ['applications', 'unconfirmed'],
    queryFn: getUnconfirmedApplications,
    staleTime: 60 * 1000, // 1 minute
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook for fetching application status for a specific opportunity with React Query
 * @param opportunityId - The ID of the opportunity
 * @returns Query result with application status data, loading state, and error
 */
export function useApplicationStatus(opportunityId: string) {
  return useQuery({
    queryKey: ['application', 'status', opportunityId],
    queryFn: () => getApplicationStatus(opportunityId),
    staleTime: 60 * 1000, // 1 minute
    refetchOnWindowFocus: false,
    // Don't refetch on mount to prevent unnecessary API calls
    refetchOnMount: false,
    // Only run this query if we have an opportunityId
    enabled: !!opportunityId,
  });
}

/**
 * Hook for updating application status with React Query
 * @returns Mutation function and state for updating application status
 */
export function useUpdateApplicationStatus() {
  const queryClient = useQueryClient();
  const { setApplied } = useApplicationStore();
  const router = useRouter();
  
  return useMutation({
    mutationFn: ({ 
      opportunityId, 
      statusId, 
      isApplied, 
      isConfirm 
    }: { 
      opportunityId: string; 
      statusId: string; 
      isApplied: boolean; 
      isConfirm: boolean;
    }) => updateApplicationStatus(opportunityId, statusId, isApplied, isConfirm),
    
    onSuccess: (_, variables) => {
      if (variables.isApplied && variables.isConfirm) {
        setApplied(variables.opportunityId);
        toast.success('Application status updated successfully');
      } else {
        toast.info('Application status updated');
      }
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ 
        queryKey: ['application', 'status', variables.opportunityId] 
      });
      
      router.refresh();
    },
    
    onError: () => {
      toast.error('Failed to update application status');
    }
  });
}

/**
 * Hook for creating participation with React Query
 * @returns Mutation function and state for creating participation
 */
export function useCreateParticipation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      opportunityId, 
      year, 
      privacyLevel 
    }: { 
      opportunityId: string; 
      year: number; 
      privacyLevel: string;
    }) => createParticipation(opportunityId, year, privacyLevel),
    
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['participations'] });
    },
    
    onError: () => {
      toast.error('Failed to create participation record');
    }
  });
} 