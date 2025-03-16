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
 * Interface for cached response
 */
interface CachedResponse {
  data: OpportunitiesResponse;
  timestamp: number;
}

// Cache TTL (Time To Live)
const CACHE_TTL = 30 * 1000; // 30 seconds

/**
 * Get a cached response from sessionStorage
 */
const getCachedResponse = (cacheKey: string): CachedResponse | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const cacheItem = sessionStorage.getItem(`opportunities_${cacheKey}`);
    if (!cacheItem) return null;
    
    const parsed = JSON.parse(cacheItem) as CachedResponse;
    
    // Check if cache is still valid
    if (Date.now() - parsed.timestamp < CACHE_TTL) {
      return parsed;
    }
    
    // Cache expired, remove it
    sessionStorage.removeItem(`opportunities_${cacheKey}`);
    return null;
  } catch (error) {
    return null;
  }
};

/**
 * Save a response to sessionStorage cache
 */
const setCachedResponse = (cacheKey: string, data: OpportunitiesResponse): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const cacheItem: CachedResponse = {
      data,
      timestamp: Date.now()
    };
    
    sessionStorage.setItem(`opportunities_${cacheKey}`, JSON.stringify(cacheItem));
  } catch (error) {
    // Silently fail if storage is not available
  }
};

/**
 * Fetches opportunities with filtering, sorting, and pagination
 * Uses sessionStorage to cache responses
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
    
    // Create a cache key from the search parameters
    const cacheKey = searchParams.toString() || 'default';
    
    // Check if we have a valid cached response
    const cachedResponse = getCachedResponse(cacheKey);
    
    if (cachedResponse) {
      return cachedResponse.data;
    }
    
    // Make the API request
    const { data } = await api.get<OpportunitiesResponse>(`/api/opportunities?${searchParams.toString()}`);
    
    // Validate the response data
    if (!data || !Array.isArray(data.opportunities)) {
      throw new Error('Invalid response format from API');
    }
    
    // Cache the response
    setCachedResponse(cacheKey, data);
    
    return data;
  } catch (error) {
    console.error('Error fetching opportunities:', error);
    throw error;
  }
};

/**
 * Clears the opportunities cache
 * Call this when you know the data has changed (e.g., after creating a new opportunity)
 */
export const clearOpportunitiesCache = () => {
  if (typeof window === 'undefined') return;
  
  try {
    // Get all keys from sessionStorage
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith('opportunities_')) {
        keysToRemove.push(key);
      }
    }
    
    // Remove all opportunities cache items
    keysToRemove.forEach(key => sessionStorage.removeItem(key));
  } catch (error) {
    // Silently fail if storage is not available
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
    
    // Clear cache after bookmark change
    clearOpportunitiesCache();
    
    return data;
  } catch (error: any) {
    console.error('Error toggling bookmark:', error);
    
    // Enhance error message based on error type
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      if (error.response.status === 401) {
        throw new Error('You must be logged in to bookmark opportunities');
      } else if (error.response.status === 404) {
        throw new Error('Opportunity not found');
      } else if (error.response.data && error.response.data.error) {
        throw new Error(error.response.data.error);
      }
    }
    
    // Generic error
    throw new Error('Failed to update bookmark. Please try again later.');
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

// Add TypeScript declaration for global cache
declare global {
  interface Window {
    __opportunitiesCache?: Map<string, {data: OpportunitiesResponse, timestamp: number}>;
  }
} 