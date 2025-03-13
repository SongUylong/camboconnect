'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { OpportunityCard } from "@/components/opportunities/opportunity-card";
import { OpportunityFilter } from "@/components/opportunities/opportunity-filter";
import { Input } from "@/components/ui/input";
import { useRouter, useSearchParams } from "next/navigation";
import { Category, Opportunity, OpportunityResponse, OpportunityStatus } from "@/types";
import { useFetchOpportunities } from "@/hooks/useQueryHooks";
import { Search, AlertCircle, Loader2, RefreshCcw, ChevronLeft, ChevronRight } from "lucide-react";
import { useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/lib/apiService';
import { useLoading } from '@/hooks/use-loading';

interface OpportunitiesClientProps {
  initialCategories: Category[];
}

export function OpportunitiesClient({ initialCategories }: OpportunitiesClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const isFirstRender = useRef(true);
  
  // Local state for filters
  const [searchQuery, setSearchQuery] = useState("");
  const [localCategory, setLocalCategory] = useState("");
  const [localStatus, setLocalStatus] = useState("");
  
  // State to track active filters for the query
  const [activeParams, setActiveParams] = useState<URLSearchParams>(new URLSearchParams());
  
  // Get current filter values from URL on initial load
  useEffect(() => {
    if (isFirstRender.current) {
      const currentCategory = searchParams.get("category") || "";
      const currentStatus = searchParams.get("status") || "";
      const currentQuery = searchParams.get("q") || "";
      
      // Initialize local state from URL
      setLocalCategory(currentCategory);
      setLocalStatus(currentStatus);
      setSearchQuery(currentQuery);
      
      // Initialize active params
      const initialParams = new URLSearchParams();
      if (currentCategory) initialParams.set("category", currentCategory);
      if (currentStatus) initialParams.set("status", currentStatus);
      if (currentQuery) initialParams.set("q", currentQuery);
      initialParams.set("page", searchParams.get("page") || "1");
      
      setActiveParams(initialParams);
      isFirstRender.current = false;
    }
  }, [searchParams]);

  // Create a string representation of the active params for the query key
  const queryKey = activeParams.toString();

  // Fetch opportunities data using the active params
  const { 
    data: opportunitiesData, 
    isLoading: isQueryLoading,
    isFetching: isQueryFetching,
    isError,
    error,
    refetch,
    isInitialLoading: isQueryInitialLoading
  } = useFetchOpportunities(activeParams);
  
  // Use our custom loading hook to integrate with the global loading indicator
  // We use the opportunities query key to only track loading for this specific query
  // Pass the opportunitiesData to prevent loading flash when we already have data
  const { isLoading } = useLoading({ 
    queryKey: ['opportunities', activeParams.toString()],
    initialData: opportunitiesData
  });
  
  // For local component state, we still need these variables
  const isInitialLoading = isQueryInitialLoading;
  const isFetching = isQueryFetching;

  // Update URL without navigation (AJAX-style)
  const updateUrlWithoutNavigation = useCallback((params: URLSearchParams) => {
    const url = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({ path: url }, '', url);
  }, []);

  // Create a function to filter opportunities based on criteria
  const filterOpportunities = useCallback((
    opportunities: any[], 
    category: string, 
    status: string, 
    query: string
  ) => {
    return opportunities.filter((opp) => {
      // Category filter
      const matchesCategory = !category || 
        opp.categoryId === category || 
        (opp.category && opp.category.id === category);
      
      // Status filter
      const matchesStatus = !status || opp.status === status;
      
      // Search filter
      const matchesSearch = !query || 
        opp.title.toLowerCase().includes(query.toLowerCase()) ||
        opp.shortDescription.toLowerCase().includes(query.toLowerCase());
      
      return matchesCategory && matchesStatus && matchesSearch;
    });
  }, []);

  // Handle filter changes
  const handleFilterChange = useCallback((type: string, value: string) => {
    // Update local state
    if (type === "category") {
      setLocalCategory(value);
    } else if (type === "status") {
      setLocalStatus(value);
    }
    
    // Create new params for the URL and active query
    const newParams = new URLSearchParams(activeParams.toString());
    
    if (value) {
      newParams.set(type, value);
    } else {
      newParams.delete(type);
    }
    
    // Reset page when filters change
    newParams.set("page", "1");
    
    // Update URL without navigation
    updateUrlWithoutNavigation(newParams);
    
    // Apply optimistic UI if we have current data
    if (opportunitiesData?.opportunities) {
      const newCategory = type === "category" ? value : localCategory;
      const newStatus = type === "status" ? value : localStatus;
      
      // Filter the current data optimistically
      const filteredOpportunities = filterOpportunities(
        opportunitiesData.opportunities,
        newCategory,
        newStatus,
        searchQuery
      );
      
      // Create optimistic data
      const optimisticData: OpportunityResponse = {
        ...opportunitiesData,
        opportunities: filteredOpportunities,
        totalCount: filteredOpportunities.length,
        totalPages: Math.ceil(filteredOpportunities.length / opportunitiesData.limit),
        currentPage: 1
      };
      
      // Update the cache with optimistic data
      queryClient.setQueryData(['opportunities', newParams.toString()], optimisticData);
    }
    
    // Update active params to trigger a new fetch
    setActiveParams(newParams);
    
    // Force a refetch with the new params
    setTimeout(() => {
      refetch();
    }, 0);
    
  }, [activeParams, opportunitiesData, localCategory, localStatus, searchQuery, updateUrlWithoutNavigation, queryClient, filterOpportunities, refetch]);

  // Handle search
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    
    // Create new params for the URL and active query
    const newParams = new URLSearchParams(activeParams.toString());
    
    if (query) {
      newParams.set("q", query);
    } else {
      newParams.delete("q");
    }
    
    // Reset page when search changes
    newParams.set("page", "1");
    
    // Update URL without navigation
    updateUrlWithoutNavigation(newParams);
    
    // Apply optimistic UI if we have current data
    if (opportunitiesData?.opportunities) {
      // Filter the current data optimistically
      const filteredOpportunities = filterOpportunities(
        opportunitiesData.opportunities,
        localCategory,
        localStatus,
        query
      );
      
      // Create optimistic data
      const optimisticData: OpportunityResponse = {
        ...opportunitiesData,
        opportunities: filteredOpportunities,
        totalCount: filteredOpportunities.length,
        totalPages: Math.ceil(filteredOpportunities.length / opportunitiesData.limit),
        currentPage: 1
      };
      
      // Update the cache with optimistic data
      queryClient.setQueryData(['opportunities', newParams.toString()], optimisticData);
    }
    
    // Update active params to trigger a new fetch
    setActiveParams(newParams);
    
    // Force a refetch with the new params
    setTimeout(() => {
      refetch();
    }, 0);
    
  }, [activeParams, opportunitiesData, localCategory, localStatus, updateUrlWithoutNavigation, queryClient, filterOpportunities, refetch]);

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    // Don't do anything if we're already on this page
    if (opportunitiesData?.currentPage === page) return;
    
    // Create new params for the URL and active query
    const newParams = new URLSearchParams(activeParams.toString());
    newParams.set("page", page.toString());
    
    // Check if the page data is already in the cache
    const isPageCached = () => {
      return !!queryClient.getQueryData(['opportunities', newParams.toString()]);
    };
    
    // Update URL without navigation
    updateUrlWithoutNavigation(newParams);
    
    // Update active params to trigger a new fetch
    setActiveParams(newParams);
    
    // Only prefetch if the page isn't already cached
    if (!isPageCached()) {
      // Prefetch the next and previous pages for smoother navigation
      const prefetchAdjacentPages = () => {
        // Prefetch next page if not the last page
        if (page < (opportunitiesData?.totalPages || 1)) {
          const nextParams = new URLSearchParams(newParams.toString());
          nextParams.set("page", (page + 1).toString());
          queryClient.prefetchQuery({
            queryKey: ['opportunities', nextParams.toString()],
            queryFn: () => apiService.getOpportunities(nextParams)
          });
        }
        
        // Prefetch previous page if not the first page
        if (page > 1) {
          const prevParams = new URLSearchParams(newParams.toString());
          prevParams.set("page", (page - 1).toString());
          queryClient.prefetchQuery({
            queryKey: ['opportunities', prevParams.toString()],
            queryFn: () => apiService.getOpportunities(prevParams)
          });
        }
      };
      
      // Prefetch adjacent pages after a short delay
      setTimeout(prefetchAdjacentPages, 300);
    }
  }, [activeParams, updateUrlWithoutNavigation, opportunitiesData?.totalPages, opportunitiesData?.currentPage, queryClient]);

  // Ensure the data has all required properties for OpportunityCard
  const prepareOpportunityForCard = (opp: any): Opportunity => {
    return {
      ...opp,
      // Ensure these properties exist
      organization: opp.organization || { 
        id: opp.organizationId || '', 
        name: '', 
        logo: null 
      },
      category: opp.category || { 
        id: opp.categoryId || '', 
        name: '' 
      },
      // Add any other required fields that might be missing
      eligibility: opp.eligibility || '',
      applicationProcess: opp.applicationProcess || '',
      benefits: opp.benefits || '',
      contactInfo: opp.contactInfo || '',
      shortDescription: opp.shortDescription || opp.description?.substring(0, 150) + '...' || '',
      deadline: opp.deadline instanceof Date ? opp.deadline : new Date(opp.deadline),
      visitCount: opp.visitCount || 0,
      isPopular: opp.isPopular || false,
      isNew: opp.isNew || false,
      isBookmarked: opp.isBookmarked || false,
      status: opp.status as OpportunityStatus
    };
  };

  // Reset filters
  const handleResetFilters = useCallback(() => {
    // Reset local state
    setLocalCategory("");
    setLocalStatus("");
    setSearchQuery("");
    
    // Create empty params
    const newParams = new URLSearchParams();
    newParams.set("page", "1");
    
    // Update URL without navigation
    updateUrlWithoutNavigation(newParams);
    
    // Update active params to trigger a new fetch
    setActiveParams(newParams);
    
    // Force a refetch with the new params
    setTimeout(() => {
      refetch();
    }, 0);
    
  }, [updateUrlWithoutNavigation, refetch]);

  // Log for debugging
  useEffect(() => {
    console.log("Active params changed:", activeParams.toString());
  }, [activeParams]);

  // Loading state component
  const LoadingState = () => (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className="h-8 w-8 animate-spin text-gray-400 mb-4" />
      <p className="text-gray-600">Loading opportunities...</p>
    </div>
  );

  // Error state component
  const ErrorState = ({ error, onRetry }: { error: Error | null, onRetry: () => void }) => (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-lg w-full">
        <div className="flex items-center mb-4">
          <AlertCircle className="h-6 w-6 text-red-500 mr-2" />
          <h3 className="text-lg font-medium text-red-800">Error Loading Opportunities</h3>
        </div>
        <p className="text-red-700 mb-4">{error?.message || 'An unexpected error occurred. Please try again.'}</p>
        <button
          onClick={onRetry}
          className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          <RefreshCcw className="h-4 w-4 mr-2" />
          Try Again
        </button>
      </div>
    </div>
  );

  // Pagination component
  const Pagination = ({ currentPage, totalPages }: { currentPage: number; totalPages: number }) => {
    const pages = [];
    const maxPagesToShow = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    // Check if a page is already cached
    const isPageCached = (page: number) => {
      const pageParams = new URLSearchParams(activeParams.toString());
      pageParams.set("page", page.toString());
      return !!queryClient.getQueryData(['opportunities', pageParams.toString()]);
    };
    
    return (
      <div className="flex justify-center mt-8">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || isFetching}
            className={`p-2 rounded-md ${
              currentPage === 1 || isFetching
                ? 'text-gray-400 cursor-not-allowed'
                : isPageCached(currentPage - 1)
                ? 'text-gray-700 hover:bg-gray-100 bg-gray-50'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            title={isPageCached(currentPage - 1) ? "Cached" : ""}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          
          {startPage > 1 && (
            <>
              <button
                onClick={() => handlePageChange(1)}
                disabled={isFetching}
                className={`px-3 py-1 rounded-md ${
                  isFetching 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : isPageCached(1)
                    ? 'text-gray-700 hover:bg-gray-100 bg-gray-50'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                title={isPageCached(1) ? "Cached" : ""}
              >
                1
              </button>
              {startPage > 2 && <span className="text-gray-500">...</span>}
            </>
          )}
          
          {pages.map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              disabled={page === currentPage || isFetching}
              className={`px-3 py-1 rounded-md ${
                page === currentPage
                  ? 'bg-blue-600 text-white'
                  : isFetching
                  ? 'text-gray-400 cursor-not-allowed'
                  : isPageCached(page)
                  ? 'text-gray-700 hover:bg-gray-100 bg-gray-50'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              title={isPageCached(page) ? "Cached" : ""}
            >
              {page}
            </button>
          ))}
          
          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <span className="text-gray-500">...</span>}
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={isFetching}
                className={`px-3 py-1 rounded-md ${
                  isFetching 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : isPageCached(totalPages)
                    ? 'text-gray-700 hover:bg-gray-100 bg-gray-50'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                title={isPageCached(totalPages) ? "Cached" : ""}
              >
                {totalPages}
              </button>
            </>
          )}
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || isFetching}
            className={`p-2 rounded-md ${
              currentPage === totalPages || isFetching
                ? 'text-gray-400 cursor-not-allowed'
                : isPageCached(currentPage + 1)
                ? 'text-gray-700 hover:bg-gray-100 bg-gray-50'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            title={isPageCached(currentPage + 1) ? "Cached" : ""}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    );
  };

  // Show error state if there's an error and no data
  if (isError && !opportunitiesData) {
    return <ErrorState error={error as Error} onRetry={refetch} />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters */}
        <div className="lg:col-span-1">
          <OpportunityFilter
            categories={initialCategories}
            onFilterChange={handleFilterChange}
            selectedCategory={localCategory}
            selectedStatus={localStatus}
            onReset={handleResetFilters}
          />
        </div>

        {/* Opportunities List */}
        <div className="lg:col-span-3">
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search opportunities..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Results */}
          <div className="transition-opacity duration-300">
            {/* Initial loading state - show skeleton instead of full page loader */}
            {isInitialLoading && (
              <div className="space-y-6">
                {[...Array(5)].map((_, index) => (
                  <div key={index} className="bg-white rounded-lg shadow p-6 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="flex justify-between mt-4">
                      <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Results count and current page info - only show when we have data */}
            {opportunitiesData && !isInitialLoading && (
              <div className="flex justify-between items-center mb-6">
                <p className="text-sm text-gray-600">
                  Showing {opportunitiesData.opportunities.length} of {opportunitiesData.totalCount} opportunities
                </p>
                {opportunitiesData.totalPages > 1 && (
                  <p className="text-sm text-gray-600">
                    Page {opportunitiesData.currentPage} of {opportunitiesData.totalPages}
                  </p>
                )}
              </div>
            )}

            {/* No results message - only show when we have data and it's empty */}
            {opportunitiesData?.opportunities.length === 0 && !isInitialLoading ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">No opportunities found matching your criteria.</p>
                <p className="text-gray-400 mt-2">Try adjusting your filters or search terms.</p>
                <button 
                  onClick={handleResetFilters}
                  className="mt-4 px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
                >
                  Reset all filters
                </button>
              </div>
            ) : (
              // Only show opportunity cards when we have data and we're not in initial loading
              !isInitialLoading && opportunitiesData && (
                <>
                  {/* Opportunity cards */}
                  <div className="space-y-6">
                    {opportunitiesData.opportunities.map((opportunity) => (
                      <OpportunityCard
                        key={opportunity.id}
                        opportunity={prepareOpportunityForCard(opportunity)}
                        variant="default"
                      />
                    ))}
                  </div>
                  
                  {/* Pagination */}
                  {opportunitiesData.totalPages > 1 && (
                    <Pagination 
                      currentPage={opportunitiesData.currentPage} 
                      totalPages={opportunitiesData.totalPages} 
                    />
                  )}
                </>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 