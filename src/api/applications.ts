import api from '@/lib/axios';

/**
 * Interface for application data
 */
export interface Application {
  id: string;
  status: string;
  isApplied: boolean;
  opportunity: {
    id: string;
    title: string;
  };
}

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
 * 
 * @returns Promise with unconfirmed applications
 */
export const getUnconfirmedApplications = async (): Promise<{ applications: Application[] }> => {
  try {
    const { data } = await api.get('/api/applications/unconfirmed');
    return data;
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
 * Updates application status
 * 
 * @param opportunityId - Opportunity ID
 * @param status - Application status data
 * @returns Promise with updated application
 */
export const updateApplicationStatus = async (
  opportunityId: string, 
  status: { statusId: string; isApplied: boolean; isConfirm: boolean }
): Promise<any> => {
  try {
    const { data } = await api.post(`/api/opportunities/${opportunityId}/apply`, status);
    return data;
  } catch (error) {
    console.error('Error updating application status:', error);
    throw error;
  }
};

/**
 * Creates a participation record for an opportunity
 * 
 * @param opportunityId - Opportunity ID
 * @param participation - Participation data
 * @returns Promise with created participation
 */
export const createParticipation = async (
  opportunityId: string,
  participation: { year: number; privacyLevel: string }
): Promise<any> => {
  try {
    const { data } = await api.post(`/api/opportunities/${opportunityId}/participation`, participation);
    return data;
  } catch (error) {
    console.error('Error creating participation record:', error);
    throw error;
  }
}; 