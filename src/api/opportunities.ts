import api from '@/lib/axios';

/**
 * Interface for opportunity search parameters
 */
export interface OpportunitySearchParams {
  category?: string;
  status?: string;
  sort?: string;
  q?: string;
  page?: number;
}

/**
 * Interface for opportunity data returned from API
 */
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
 * Interface for API response
 */
export interface OpportunitiesResponse {
  opportunities: Opportunity[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

/**
 * Fetches opportunities with filtering, sorting, and pagination
 * 
 * @param params - Search parameters for filtering and pagination
 * @returns Promise with opportunities data and pagination info
 */
export const getOpportunities = async (params: OpportunitySearchParams): Promise<OpportunitiesResponse> => {
  try {
    // Convert params object to URLSearchParams
    const searchParams = new URLSearchParams();
    
    if (params.category) searchParams.append('category', params.category);
    if (params.status) searchParams.append('status', params.status);
    if (params.sort) searchParams.append('sort', params.sort);
    if (params.q) searchParams.append('q', params.q);
    if (params.page) searchParams.append('page', params.page.toString());
    
    // Add a timestamp to prevent caching issues
    searchParams.append('_t', Date.now().toString());
    
    const { data } = await api.get<OpportunitiesResponse>(`/api/opportunities?${searchParams.toString()}`);
    
    // Validate the response data
    if (!data || !Array.isArray(data.opportunities)) {
      console.error('Invalid response format:', data);
      throw new Error('Invalid response format from API');
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching opportunities:', error);
    throw error;
  }
};

/**
 * Toggles bookmark status for an opportunity
 * 
 * @param id - Opportunity ID
 * @param bookmarked - Whether to bookmark (true) or unbookmark (false)
 * @returns Promise with updated bookmark status
 */
export const toggleBookmark = async (id: string, bookmarked: boolean): Promise<{ bookmarked: boolean; message: string }> => {
  try {
    const { data } = await api.post(`/api/opportunities/${id}/bookmark`, { bookmarked });
    return data;
  } catch (error) {
    console.error('Error toggling bookmark:', error);
    throw error;
  }
};

/**
 * Increments view count for an opportunity
 * 
 * @param id - Opportunity ID
 * @returns Promise with success message
 */
export const incrementViewCount = async (id: string): Promise<{ message: string }> => {
  try {
    const { data } = await api.post(`/api/opportunities/${id}/increment-view`);
    return data;
  } catch (error) {
    console.error('Error incrementing view count:', error);
    throw error;
  }
}; 