import api from '@/lib/axios';

/**
 * Fetches all applications for the current user
 * @returns Promise with applications data
 */
export const getApplications = async () => {
  try {
    const { data } = await api.get('/api/applications');
    return data.applications;
  } catch (error) {
    console.error('Error fetching applications:', error);
    throw error;
  }
};

/**
 * Fetches unconfirmed applications for the current user
 * @returns Promise with unconfirmed applications data
 */
export const getUnconfirmedApplications = async () => {
  try {
    const { data } = await api.get('/api/applications/unconfirmed');
    return data.applications;
  } catch (error) {
    console.error('Error fetching unconfirmed applications:', error);
    throw error;
  }
};

/**
 * Fetches application status for a specific opportunity
 * @param opportunityId - The ID of the opportunity
 * @returns Promise with application status data
 */
export const getApplicationStatus = async (opportunityId: string) => {
  try {
    const { data } = await api.get(`/api/opportunities/${opportunityId}/application-status`);
    return data.status;
  } catch (error) {
    console.error('Error fetching application status:', error);
    throw error;
  }
};

/**
 * Updates application status for a specific opportunity
 * @param opportunityId - The ID of the opportunity
 * @param statusId - The status ID
 * @param isApplied - Whether the user has applied
 * @param isConfirm - Whether the application is confirmed
 * @returns Promise with updated application data
 */
export const updateApplicationStatus = async (
  opportunityId: string,
  statusId: string,
  isApplied: boolean,
  isConfirm: boolean
) => {
  try {
    const { data } = await api.post(`/api/opportunities/${opportunityId}/apply`, {
      statusId,
      isApplied,
      isConfirm
    });
    return data;
  } catch (error) {
    console.error('Error updating application status:', error);
    throw error;
  }
};

/**
 * Creates a participation record for a specific opportunity
 * @param opportunityId - The ID of the opportunity
 * @param year - The year of participation
 * @param privacyLevel - The privacy level of the participation
 * @returns Promise with created participation data
 */
export const createParticipation = async (
  opportunityId: string,
  year: number,
  privacyLevel: string
) => {
  try {
    const { data } = await api.post(`/api/opportunities/${opportunityId}/participation`, {
      year,
      privacyLevel
    });
    return data;
  } catch (error) {
    console.error('Error creating participation:', error);
    throw error;
  }
}; 