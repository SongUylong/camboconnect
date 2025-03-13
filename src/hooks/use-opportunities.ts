import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

interface Opportunity {
  id: string;
  title: string;
  description: string;
  deadline: string;
  organization: {
    id: string;
    name: string;
    logo: string | null;
  };
  category: {
    id: string;
    name: string;
  };
  visitCount: number;
  isPopular: boolean;
  isNew: boolean;
  isBookmarked: boolean;
}

interface OpportunitiesResponse {
  opportunities: Opportunity[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

// Query keys
export const opportunityKeys = {
  all: ['opportunities'] as const,
  byOrganization: (organizationId: string) => ['opportunities', organizationId] as const,
  byCategory: (categoryId: string) => ['opportunities', 'category', categoryId] as const,
  byStatus: (status: string) => ['opportunities', 'status', status] as const,
};

// API functions
const opportunitiesApi = {
  getOpportunities: async (params: URLSearchParams) => {
    const { data } = await apiClient.get<OpportunitiesResponse>(`/api/opportunities?${params.toString()}`);
    return data;
  },

  getOrganizationOpportunities: async (organizationId: string, params: URLSearchParams) => {
    const { data } = await apiClient.get<OpportunitiesResponse>(
      `/api/organizations/${organizationId}/opportunities?${params.toString()}`
    );
    return data;
  },

  getOpportunity: async (id: string) => {
    const { data } = await apiClient.get<Opportunity>(`/api/opportunities/${id}`);
    return data;
  },

  bookmarkOpportunity: async (id: string) => {
    const { data } = await apiClient.post(`/api/opportunities/${id}/bookmark`);
    return data;
  },

  unbookmarkOpportunity: async (id: string) => {
    const { data } = await apiClient.delete(`/api/opportunities/${id}/bookmark`);
    return data;
  },
};

// React Query hooks
export function useOpportunities(params: URLSearchParams) {
  return useQuery({
    queryKey: [...opportunityKeys.all, params.toString()],
    queryFn: () => opportunitiesApi.getOpportunities(params),
  });
}

export function useOrganizationOpportunities(organizationId: string, params: URLSearchParams) {
  return useQuery({
    queryKey: [...opportunityKeys.byOrganization(organizationId), params.toString()],
    queryFn: () => opportunitiesApi.getOrganizationOpportunities(organizationId, params),
  });
}

export function useOpportunity(id: string) {
  return useQuery({
    queryKey: [...opportunityKeys.all, id],
    queryFn: () => opportunitiesApi.getOpportunity(id),
  });
}

export function useBookmarkOpportunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: opportunitiesApi.bookmarkOpportunity,
    onSuccess: (_, id) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: opportunityKeys.all });
    },
  });
}

export function useUnbookmarkOpportunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: opportunitiesApi.unbookmarkOpportunity,
    onSuccess: (_, id) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: opportunityKeys.all });
    },
  });
} 