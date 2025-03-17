import api from '@/lib/axios';

/**
 * Types for community API responses
 */
export interface Organization {
  id: string;
  name: string;
  description: string;
  logo?: string | null;
  website?: string | null;
  followerCount: number;
  opportunityCount: number;
  history?: string | null;
  termsOfService?: string | null;
}

export interface Category {
  id: string;
  name: string;
  count: number;
}

export interface Opportunity {
  id: string;
  title: string;
  shortDescription: string;
  deadline: string | Date;
  status: "OPENING_SOON" | "ACTIVE" | "CLOSING_SOON" | "CLOSED";
  visitCount: number;
  isPopular: boolean;
  isNew: boolean;
  isBookmarked?: boolean;
  organization: {
    id: string;
    name: string;
    logo: string | null;
  };
  category: {
    id: string;
    name: string;
  };
}

/**
 * Error class for community API errors
 */
export class CommunityAPIError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = 'CommunityAPIError';
  }
}

/**
 * Fetches organizations with optional search query
 * @param query - Search query
 * @returns Promise with organizations
 * @throws CommunityAPIError
 */
export const searchOrganizations = async (query?: string): Promise<Organization[]> => {
  try {
    const params = new URLSearchParams();
    if (query) {
      params.set('q', query);
    }
    
    const { data } = await api.get<Organization[]>(`/api/organizations/search?${params.toString()}`);
    
    if (!Array.isArray(data)) {
      throw new CommunityAPIError('Invalid response format from API');
    }
    
    return data;
  } catch (error: any) {
    console.error('Error searching organizations:', error);
    throw new CommunityAPIError(
      error.response?.data?.message || 'Failed to search organizations',
      error.response?.status
    );
  }
};

/**
 * Fetches opportunities for a specific organization
 * @param organizationId - ID of the organization
 * @param filters - Optional filters for status and category
 * @returns Promise with opportunities
 * @throws CommunityAPIError
 */
export const getOrganizationOpportunities = async (
  organizationId: string,
  filters?: { status?: string; category?: string }
): Promise<Opportunity[]> => {
  try {
    const queryParams = new URLSearchParams();
    if (filters?.status) {
      queryParams.set("status", filters.status);
    }
    if (filters?.category) {
      queryParams.set("category", filters.category);
    }
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    const { data } = await api.get<Opportunity[]>(`/api/organizations/${organizationId}/opportunities${queryString}`);
    
    if (!Array.isArray(data)) {
      throw new CommunityAPIError('Invalid response format from API');
    }
    
    return data.map(opportunity => ({
      ...opportunity,
      deadline: new Date(opportunity.deadline)
    }));
  } catch (error: any) {
    console.error('Error fetching organization opportunities:', error);
    throw new CommunityAPIError(
      error.response?.data?.message || 'Failed to fetch organization opportunities',
      error.response?.status
    );
  }
};

/**
 * Fetches categories for a specific organization
 * @param organizationId - ID of the organization
 * @returns Promise with categories
 * @throws CommunityAPIError
 */
export const getOrganizationCategories = async (organizationId: string): Promise<Category[]> => {
  try {
    const { data } = await api.get<Category[]>(`/api/organizations/${organizationId}/opportunities?getCategories=true`);
    
    if (!Array.isArray(data)) {
      throw new CommunityAPIError('Invalid response format from API');
    }
    
    return data;
  } catch (error: any) {
    console.error('Error fetching organization categories:', error);
    throw new CommunityAPIError(
      error.response?.data?.message || 'Failed to fetch organization categories',
      error.response?.status
    );
  }
};

/**
 * Checks if the current user is following an organization
 * @param organizationId - ID of the organization
 * @returns Promise with follow status
 * @throws CommunityAPIError
 */
export const getOrganizationFollowStatus = async (organizationId: string): Promise<{ following: boolean }> => {
  try {
    const { data } = await api.get<{ following: boolean }>(`/api/organizations/${organizationId}/follow/status`);
    
    if (typeof data?.following !== 'boolean') {
      throw new CommunityAPIError('Invalid response format from API');
    }
    
    return data;
  } catch (error: any) {
    console.error('Error checking organization follow status:', error);
    throw new CommunityAPIError(
      error.response?.data?.message || 'Failed to check organization follow status',
      error.response?.status
    );
  }
};

/**
 * Toggles following status for an organization
 * @param organizationId - ID of the organization
 * @param following - Whether to follow (true) or unfollow (false)
 * @returns Promise with follow status
 * @throws CommunityAPIError
 */
export const toggleOrganizationFollow = async (
  organizationId: string,
  following: boolean
): Promise<{ following: boolean; message: string }> => {
  try {
    const { data } = await api.post<{ following: boolean; message: string }>(
      `/api/organizations/${organizationId}/follow`,
      { following }
    );
    
    if (typeof data?.following !== 'boolean' || typeof data?.message !== 'string') {
      throw new CommunityAPIError('Invalid response format from API');
    }
    
    return data;
  } catch (error: any) {
    console.error('Error toggling organization follow:', error);
    throw new CommunityAPIError(
      error.response?.data?.message || 'Failed to update follow status',
      error.response?.status
    );
  }
}; 