import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import axios from 'axios';
import { User } from '@prisma/client';

interface Opportunity {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  deadline: string;
  startDate?: string;
  endDate?: string;
  status: 'OPENING_SOON' | 'ACTIVE' | 'CLOSING_SOON' | 'CLOSED';
  eligibility: string;
  applicationProcess: string;
  benefits: string;
  contactInfo: string;
  externalLink?: string;
  organization: {
    id: string;
    name: string;
    logo: string | null;
    website?: string;
  };
  category: {
    id: string;
    name: string;
  };
  visitCount: number;
  isPopular: boolean;
  isNew: boolean;
  isBookmarked: boolean;
  participants?: User[];
  participantsCount?: number;
}

interface OpportunitiesResponse {
  opportunities: Opportunity[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

interface CreateOpportunityData {
  title: string;
  description: string;
  shortDescription: string;
  eligibility: string;
  applicationProcess: string;
  benefits: string;
  contactInfo: string;
  deadline: string;
  categoryId: string;
  organizationId: string;
  status: 'OPENING_SOON' | 'ACTIVE' | 'CLOSING_SOON' | 'CLOSED';
  externalLink?: string;
  startDate?: string;
  endDate?: string;
  isPopular?: boolean;
}

interface UpdateOpportunityData extends Partial<CreateOpportunityData> {}

interface CreateApplicationData {
  opportunityId: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  notes?: string;
  resumeUrl?: string;
}

// Query keys
export const opportunityKeys = {
  all: ['opportunities'] as const,
  byId: (id: string) => ['opportunities', id] as const,
  byOrganization: (organizationId: string) => ['opportunities', 'organization', organizationId] as const,
  byCategory: (categoryId: string) => ['opportunities', 'category', categoryId] as const,
  byStatus: (status: string) => ['opportunities', 'status', status] as const,
};

// API functions
const opportunitiesApi = {
  getOpportunities: async (params: URLSearchParams) => {
    const { data } = await apiClient.get<OpportunitiesResponse>(`/api/opportunities?${params.toString()}`);
    return data;
  },

  getOpportunity: async (id: string) => {
    const { data } = await apiClient.get<Opportunity>(`/api/opportunities/${id}`);
    return data;
  },

  createOpportunity: async (opportunityData: CreateOpportunityData) => {
    const { data } = await apiClient.post<Opportunity>('/api/opportunities', opportunityData);
    return data;
  },

  updateOpportunity: async ({ id, data: updateData }: { id: string; data: UpdateOpportunityData }) => {
    const { data } = await apiClient.patch<Opportunity>(`/api/opportunities/${id}`, updateData);
    return data;
  },

  deleteOpportunity: async (id: string) => {
    await apiClient.delete(`/api/opportunities/${id}`);
  },

  bookmarkOpportunity: async (id: string) => {
    const { data } = await apiClient.post(`/api/opportunities/${id}/bookmark`);
    return data;
  },

  unbookmarkOpportunity: async (id: string) => {
    await apiClient.delete(`/api/opportunities/${id}/bookmark`);
  },
};

// React Query hooks
export function useOpportunities(params: URLSearchParams) {
  return useQuery({
    queryKey: [...opportunityKeys.all, params.toString()],
    queryFn: () => opportunitiesApi.getOpportunities(params),
  });
}

export function useOpportunity(id: string) {
  return useQuery({
    queryKey: opportunityKeys.byId(id),
    queryFn: () => opportunitiesApi.getOpportunity(id),
  });
}

export function useCreateOpportunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: opportunitiesApi.createOpportunity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: opportunityKeys.all });
    },
  });
}

export function useUpdateOpportunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: opportunitiesApi.updateOpportunity,
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: opportunityKeys.all });
      queryClient.invalidateQueries({ queryKey: opportunityKeys.byId(id) });
    },
  });
}

export function useDeleteOpportunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: opportunitiesApi.deleteOpportunity,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: opportunityKeys.all });
      queryClient.invalidateQueries({ queryKey: opportunityKeys.byId(id) });
    },
  });
}

export function useBookmarkOpportunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: opportunitiesApi.bookmarkOpportunity,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: opportunityKeys.all });
      queryClient.invalidateQueries({ queryKey: opportunityKeys.byId(id) });
    },
  });
}

export function useUnbookmarkOpportunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: opportunitiesApi.unbookmarkOpportunity,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: opportunityKeys.all });
      queryClient.invalidateQueries({ queryKey: opportunityKeys.byId(id) });
    },
  });
}

export function useCreateApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateApplicationData) => {
      const response = await axios.post(`/api/opportunities/${data.opportunityId}/apply`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
    },
  });
}

export function useOrganizationOpportunities(organizationId: string, params: URLSearchParams = new URLSearchParams()) {
  params.set('organizationId', organizationId);
  return useQuery({
    queryKey: [...opportunityKeys.byOrganization(organizationId), params.toString()],
    queryFn: () => opportunitiesApi.getOpportunities(params),
  });
} 