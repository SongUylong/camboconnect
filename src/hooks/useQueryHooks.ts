// lib/hooks/useQueryHooks.ts
'use client';

import { 
  useQuery, 
  useMutation, 
  useQueryClient, 
  UseQueryOptions, 
  UseMutationOptions,
  QueryKey
} from '@tanstack/react-query';
import {apiService} from '@/lib/apiService';
import { AxiosError } from 'axios';

/**
 * Hook for fetching opportunities
 * @param params - Query parameters
 * @param options - Additional React Query options
 */
export function useFetchOpportunities(
  params: URLSearchParams,
  options: Omit<UseQueryOptions<{ opportunities: any[]; totalCount: number }, AxiosError>, 'queryKey' | 'queryFn'> = {}
) {
  return useQuery({
    queryKey: ['opportunities', params.toString()],
    queryFn: () => apiService.getOpportunities(params),
    ...options,
  });
}

/**
 * Hook for fetching a single opportunity
 * @param id - Opportunity ID
 * @param options - Additional React Query options
 */
export function useFetchOpportunity(
  id: string,
  options: Omit<UseQueryOptions<any, AxiosError>, 'queryKey' | 'queryFn'> = {}
) {
  return useQuery({
    queryKey: ['opportunity', id],
    queryFn: () => apiService.getOpportunity(id),
    ...options,
  });
}

/**
 * Hook for bookmarking an opportunity
 * @param onSuccess - Callback on successful mutation
 * @param invalidateQueries - Query keys to invalidate after mutation
 */
export function useBookmarkOpportunity(
  onSuccess?: (data: any) => void,
  invalidateQueries: QueryKey[] = []
) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiService.bookmarkOpportunity(id),
    onSuccess: (data) => {
      invalidateQueries.forEach(query => {
        queryClient.invalidateQueries({ queryKey: query });
      });
      
      if (onSuccess) {
        onSuccess(data);
      }
    },
  });
}

/**
 * Hook for unbookmarking an opportunity
 * @param onSuccess - Callback on successful mutation
 * @param invalidateQueries - Query keys to invalidate after mutation
 */
export function useUnbookmarkOpportunity(
  onSuccess?: (data: any) => void,
  invalidateQueries: QueryKey[] = []
) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiService.unbookmarkOpportunity(id),
    onSuccess: (data) => {
      invalidateQueries.forEach(query => {
        queryClient.invalidateQueries({ queryKey: query });
      });
      
      if (onSuccess) {
        onSuccess(data);
      }
    },
  });
}

/**
 * Hook for fetching organization opportunities
 * @param organizationId - Organization ID
 * @param params - Query parameters
 * @param options - Additional React Query options
 */
export function useFetchOrganizationOpportunities(
  organizationId: string,
  params: URLSearchParams,
  options: Omit<UseQueryOptions<{ opportunities: any[]; totalCount: number }, AxiosError>, 'queryKey' | 'queryFn'> = {}
) {
  return useQuery({
    queryKey: ['organization-opportunities', organizationId, params.toString()],
    queryFn: () => apiService.getOrganizationOpportunities(organizationId, params),
    ...options,
  });
}

/**
 * Hook for fetching categories
 * @param options - Additional React Query options
 */
export function useFetchCategories(
  options: Omit<UseQueryOptions<any[], AxiosError>, 'queryKey' | 'queryFn'> = {}
) {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => apiService.getCategories(),
    ...options,
  });
}

/**
 * Hook for fetching a single category
 * @param id - Category ID
 * @param options - Additional React Query options
 */
export function useFetchCategory(
  id: string,
  options: Omit<UseQueryOptions<any, AxiosError>, 'queryKey' | 'queryFn'> = {}
) {
  return useQuery({
    queryKey: ['category', id],
    queryFn: () => apiService.getCategory(id),
    ...options,
  });
}