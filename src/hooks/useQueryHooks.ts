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
import { OpportunityResponse } from '@/types';
import { useEffect } from 'react';

/**
 * Hook for fetching opportunities
 * @param params - Query parameters
 * @param options - Additional React Query options
 */
export function useFetchOpportunities(
  params: URLSearchParams,
  options: Omit<UseQueryOptions<OpportunityResponse, AxiosError>, 'queryKey' | 'queryFn'> = {}
) {
  const queryClient = useQueryClient();
  const paramsString = params.toString();
  
  // Check if we already have this data in the cache
  const cachedData = queryClient.getQueryData<OpportunityResponse>(['opportunities', paramsString]);
  
  // Prefetch adjacent pages if we're on a page
  useEffect(() => {
    const currentParams = new URLSearchParams(paramsString);
    const currentPage = parseInt(currentParams.get('page') || '1', 10);
    
    // Prefetch next page
    if (cachedData && currentPage < cachedData.totalPages) {
      const nextParams = new URLSearchParams(paramsString);
      nextParams.set('page', (currentPage + 1).toString());
      queryClient.prefetchQuery({
        queryKey: ['opportunities', nextParams.toString()],
        queryFn: () => apiService.getOpportunities(nextParams),
        staleTime: 5 * 60 * 1000
      });
    }
    
    // Prefetch previous page
    if (cachedData && currentPage > 1) {
      const prevParams = new URLSearchParams(paramsString);
      prevParams.set('page', (currentPage - 1).toString());
      queryClient.prefetchQuery({
        queryKey: ['opportunities', prevParams.toString()],
        queryFn: () => apiService.getOpportunities(prevParams),
        staleTime: 5 * 60 * 1000
      });
    }
  }, [paramsString, cachedData, queryClient]);
  
  return useQuery({
    queryKey: ['opportunities', paramsString],
    queryFn: async () => {
      try {
        console.log("Fetching opportunities with params:", paramsString);
        return await apiService.getOpportunities(params);
      } catch (error) {
        // Enhanced error handling
        if (error instanceof AxiosError && error.response) {
          const status = error.response.status;
          if (status === 404) {
            throw new Error('No opportunities found. Please try different filters.');
          } else if (status === 401) {
            throw new Error('You need to be logged in to view opportunities.');
          } else if (status >= 500) {
            throw new Error('Server error. Please try again later.');
          }
        }
        throw new Error('Failed to fetch opportunities. Please try again.');
      }
    },
    // Retry configuration
    retry: 3, // Retry failed requests 3 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    
    // Caching configuration
    staleTime: 5 * 60 * 1000, // Data stays fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep inactive data in cache for 10 minutes
    
    // Refetch configuration
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchOnReconnect: true, // Refetch when network reconnects
    
    // Prevent showing loading state if we have cached data
    placeholderData: () => {
      // First try to get data for the exact query
      const previousData = queryClient.getQueryData<OpportunityResponse>(['opportunities', paramsString]);
      if (previousData) return previousData;
      
      // If we're changing pages, try to find data with the same filters but different page
      const currentParams = new URLSearchParams(paramsString);
      const currentPage = currentParams.get('page');
      
      if (currentPage) {
        // Extract the base filters (without page)
        const baseParams = new URLSearchParams(paramsString);
        baseParams.delete('page');
        const baseParamsString = baseParams.toString();
        
        // Find all queries that match our base filters
        const queryCache = queryClient.getQueryCache();
        const queries = queryCache.findAll({ 
          queryKey: ['opportunities'],
          exact: false
        }).filter(query => {
          if (!Array.isArray(query.queryKey) || query.queryKey.length < 2) return false;
          
          const queryKeyString = query.queryKey[1] as string;
          const queryParamsWithoutPage = new URLSearchParams(queryKeyString);
          queryParamsWithoutPage.delete('page');
          
          return queryParamsWithoutPage.toString() === baseParamsString;
        });
        
        if (queries.length > 0) {
          // Return the most recent data
          const mostRecentQuery = queries.reduce((prev, current) => {
            return (prev.state.dataUpdatedAt > current.state.dataUpdatedAt) ? prev : current;
          });
          
          return mostRecentQuery.state.data as OpportunityResponse;
        }
      }
      
      // If no related data found, try to find any opportunities data
      const queryCache = queryClient.getQueryCache();
      const queries = queryCache.findAll({ queryKey: ['opportunities'] });
      
      // Return the most recent data if available
      if (queries.length > 0) {
        const mostRecentQuery = queries.reduce((prev, current) => {
          return (prev.state.dataUpdatedAt > current.state.dataUpdatedAt) ? prev : current;
        });
        
        return mostRecentQuery.state.data as OpportunityResponse;
      }
      
      return undefined;
    },
    
    // Only show loading state on initial fetch, not on background updates
    refetchOnMount: cachedData ? false : true,
    
    // Prevent loading state when switching pages
    structuralSharing: (oldData, newData) => {
      if (oldData && !newData) return oldData;
      return newData;
    },
    
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