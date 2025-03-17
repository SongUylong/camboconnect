import api from '@/lib/axios';

/**
 * Interface for user profile data
 */
export interface UserProfile {
  id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImage?: string | null;
  bio?: string | null;
  isSetup?: boolean; // Add isSetup field
  education?: Array<{
    id?: string;
    school: string;
    degree: string;
    field: string;
    startDate: string | Date;
    endDate?: string | Date | null;
  }>;
  experience?: Array<{
    id?: string;
    title: string;
    company: string;
    location: string;
    startDate: string | Date;
    endDate?: string | Date | null;
    description: string;
  }>;
  skills?: string[];
  links?: Record<string, string>;
}

/**
 * Fetches the current user's profile
 * @returns Promise with user profile data
 */
export const getUserProfile = async (): Promise<UserProfile> => {
  try {
    const { data } = await api.get('/api/profile');
    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

/**
 * Updates the current user's profile
 * @param profileData - Profile data to update
 * @returns Promise with updated user profile
 */
export const updateUserProfile = async (profileData: UserProfile): Promise<{ user: UserProfile; message: string }> => {
  try {
    const { data } = await api.put('/api/profile', profileData);
    return data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

/**
 * Updates the isSetup status for the current user
 * @param isSetup - New isSetup value
 * @returns Promise with updated user profile
 */
export const updateSetupStatus = async (isSetup: boolean): Promise<{ user: UserProfile; message: string }> => {
  try {
    console.log("API: Updating setup status to:", isSetup);
    const { data } = await api.put('/api/profile', { isSetup });
    console.log("API: Setup status updated successfully:", data);
    return data;
  } catch (error) {
    console.error('Error updating setup status:', error);
    throw error;
  }
};

/**
 * Updates privacy level for a participation
 * @param participationId - ID of the participation
 * @param privacyLevel - New privacy level
 * @returns Promise with updated participation
 */
export const updateParticipationPrivacy = async (participationId: string, privacyLevel: string): Promise<any> => {
  try {
    const { data } = await api.put(`/api/profile/participations/${participationId}/privacy`, { privacyLevel });
    return data;
  } catch (error) {
    console.error('Error updating participation privacy:', error);
    throw error;
  }
};

/**
 * Toggles following status for an organization
 * @param organizationId - ID of the organization
 * @param following - Whether to follow (true) or unfollow (false)
 * @returns Promise with updated follow status
 */
export const toggleOrganizationFollow = async (organizationId: string, following: boolean): Promise<any> => {
  try {
    const { data } = await api.post(`/api/organizations/${organizationId}/follow`, { following });
    return data;
  } catch (error) {
    console.error('Error toggling organization follow:', error);
    throw error;
  }
};

/**
 * Fetches bookmarked opportunities for the current user
 * @returns Promise with bookmarked opportunities
 */
export const getBookmarkedOpportunities = async (): Promise<any> => {
  try {
    const { data } = await api.get('/api/profile/bookmarks');
    return data;
  } catch (error) {
    console.error('Error fetching bookmarked opportunities:', error);
    throw error;
  }
}; 