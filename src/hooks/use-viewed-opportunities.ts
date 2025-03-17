import { useQuery } from '@tanstack/react-query';
import { ViewedOpportunity } from '@/components/profile/viewed-opportunities-list';
import { getViewedOpportunities } from '@/api/profile';

interface ViewedOpportunitiesResponse {
  opportunities: ViewedOpportunity[];
  totalCount: number;
  pageCount: number;
}

/**
 * Hook for fetching viewed opportunities with React Query
 * 
 * @param limit - Number of items per page
 * @param page - Current page number
 * @returns Query result with viewed opportunities data, loading state, and error
 */
export function useViewedOpportunities(limit: number = 10, page: number = 1) {
  return useQuery({
    queryKey: ['viewedOpportunities', { limit, page }],
    queryFn: () => getViewedOpportunities(limit, page),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
} 