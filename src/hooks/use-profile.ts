import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserProfile, updateUserProfile, updateParticipationPrivacy, toggleOrganizationFollow, getBookmarkedOpportunities, updateSetupStatus, UserProfile, getUserProfileById, getUserParticipations } from '@/api/profile';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

/**
 * Hook for fetching user profile data with React Query
 * @returns Query result with profile data, loading state, and error
 */
export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: getUserProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook for updating user profile with React Query
 * @returns Mutation function and state for updating profile
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (profileData: UserProfile) => updateUserProfile(profileData),
    onSuccess: () => {
      // Invalidate profile data to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profile updated successfully');
      router.push('/profile');
      // Refresh the page to update server state
      router.refresh();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update profile');
    },
  });
}

/**
 * Hook for updating user setup status with React Query
 * @returns Mutation function for updating setup status
 */
export function useUpdateSetupStatus() {
  const queryClient = useQueryClient();
  const router = useRouter();
  
  return useMutation({
    mutationFn: (isSetup: boolean) => {
      console.log("Calling updateSetupStatus with:", isSetup);
      return updateSetupStatus(isSetup);
    },
    onSuccess: (data) => {
      console.log("Setup status updated successfully:", data);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      // Refresh the page to update server state
      router.refresh();
    },
    onError: (error: any) => {
      console.error('Failed to update setup status:', error);
    },
  });
}

/**
 * Hook for updating participation privacy with React Query
 * @returns Mutation function and state for updating participation privacy
 */
export function useUpdateParticipationPrivacy() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: ({ 
      participationId, 
      privacyLevel 
    }: { 
      participationId: string; 
      privacyLevel: 'PUBLIC' | 'FRIENDS_ONLY' | 'ONLY_ME' 
    }) => updateParticipationPrivacy(participationId, privacyLevel),
    onSuccess: () => {
      // Invalidate profile data to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Privacy level updated');
      // Refresh the page to update server state
      router.refresh();
    },
    onError: () => {
      toast.error('Failed to update privacy level');
    },
  });
}

/**
 * Hook for toggling organization follow status with React Query
 * @returns Mutation function and state for toggling organization follow
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
    onSuccess: () => {
      // Invalidate profile data to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      // Refresh the page to update server state
      router.refresh();
    },
    onError: () => {
      toast.error('Failed to update follow status');
    },
  });
}

/**
 * Hook for fetching bookmarked opportunities with React Query
 * @returns Query result with bookmarked opportunities data, loading state, and error
 */
export function useBookmarks() {
  return useQuery({
    queryKey: ['bookmarks'],
    queryFn: getBookmarkedOpportunities,
    staleTime: 60 * 1000, // 1 minute
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook for fetching a user profile by ID with React Query
 * @param userId - ID of the user to fetch
 * @returns Query result with profile data, loading state, and error
 */
export function useUserProfileById(userId: string) {
  return useQuery({
    queryKey: ['userProfile', userId],
    queryFn: () => getUserProfileById(userId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook for fetching user participations with React Query
 * @param userId - ID of the user
 * @returns Query result with participations data, loading state, and error
 */
export function useUserParticipations(userId: string) {
  return useQuery({
    queryKey: ['userParticipations', userId],
    queryFn: () => getUserParticipations(userId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
} 