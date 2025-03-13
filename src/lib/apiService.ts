import apiClient from './api-client';
import type { Opportunity, Organization, Category, OpportunityResponse } from '@/types';
import axios from 'axios';

export const apiService = {
  // Opportunity related API calls
  getOpportunities: async (params: URLSearchParams): Promise<OpportunityResponse> => {
    const { data } = await axios.get<OpportunityResponse>(`/api/opportunities?${params.toString()}`);
    return data;
  },

  getOpportunity: async (id: string) => {
    const { data } = await apiClient.get<Opportunity>(`/api/opportunities/${id}`);
    return data;
  },

  bookmarkOpportunity: async (id: string) => {
    const { data } = await apiClient.post<Opportunity>(`/api/opportunities/${id}/bookmark`);
    return data;
  },

  unbookmarkOpportunity: async (id: string) => {
    const { data } = await apiClient.delete<Opportunity>(`/api/opportunities/${id}/bookmark`);
    return data;
  },

  // Organization related API calls
  getOrganizations: async (params: URLSearchParams) => {
    const { data } = await apiClient.get<{ organizations: Organization[]; totalCount: number }>(
      `/api/organizations?${params.toString()}`
    );
    return data;
  },

  getOrganization: async (id: string) => {
    const { data } = await apiClient.get<Organization>(`/api/organizations/${id}`);
    return data;
  },

  getOrganizationOpportunities: async (organizationId: string, params: URLSearchParams) => {
    const { data } = await apiClient.get<{ opportunities: Opportunity[]; totalCount: number }>(
      `/api/organizations/${organizationId}/opportunities?${params.toString()}`
    );
    return data;
  },

  // Category related API calls
  getCategories: async () => {
    const { data } = await apiClient.get<Category[]>('/api/categories');
    return data;
  },

  getCategory: async (id: string) => {
    const { data } = await apiClient.get<Category>(`/api/categories/${id}`);
    return data;
  },
}; 