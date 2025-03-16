import api from '@/lib/axios';
import { UserProfile } from '@/types/user';

/**
 * Fetches the user's profile data
 * @returns Promise with user profile data
 */
export const getUserProfile = async () => {
  try {
    const { data } = await api.get('/api/profile');
    return data;
  } catch (error) {
    console.error('Error fetching profile:', error);
    throw error;
  }
};

/**
 * Updates the user's profile data
 * @param profileData - The profile data to update
 * @returns Promise with updated profile data
 */
export const updateUserProfile = async (profileData: UserProfile) => {
  try {
    const { data } = await api.put('/api/profile', profileData);
    return data;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

/**
 * Updates the privacy level of a participation
 * @param participationId - The ID of the participation
 * @param privacyLevel - The new privacy level
 * @returns Promise with updated participation data
 */
export const updateParticipationPrivacy = async (
  participationId: string, 
  privacyLevel: 'PUBLIC' | 'FRIENDS_ONLY' | 'ONLY_ME'
) => {
  try {
    const { data } = await api.put(`/api/participations/${participationId}/privacy`, {
      privacyLevel
    });
    return data;
  } catch (error) {
    console.error('Error updating participation privacy:', error);
    throw error;
  }
};

/**
 * Toggles following status for an organization
 * @param organizationId - The ID of the organization
 * @param following - Whether to follow (true) or unfollow (false)
 * @returns Promise with updated following status
 */
export const toggleOrganizationFollow = async (
  organizationId: string,
  following: boolean
) => {
  try {
    const { data } = await api.post(`/api/organizations/${organizationId}/follow`, {
      following
    });
    return data;
  } catch (error) {
    console.error('Error toggling organization follow:', error);
    throw error;
  }
}; 