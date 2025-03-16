"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { OpportunityCard } from "@/components/opportunities/opportunity-card";
import { Pagination } from "@/components/ui/pagination";
import { useOpportunities } from "@/hooks/use-opportunities";
import { Opportunity } from "@/api/opportunities";

/**
 * Props for the OpportunitiesClient component
 * Receives initial data from the server component
 */
interface OpportunitiesClientProps {
  initialOpportunities: Opportunity[];  // Initial list of opportunities from server
  initialTotalPages: number;            // Total number of pages for pagination
  initialCurrentPage: number;           // Current page number
}

/**
 * OpportunitiesClient - Client Component
 * 
 * Responsible for:
 * 1. Displaying the grid of opportunity cards
 * 2. Handling client-side pagination
 * 3. Fetching updated data when search parameters change using React Query
 * 4. Showing loading states and empty states
 * 
 * This is a client component that receives initial data from the server
 * and then updates itself when filters or pagination changes.
 */
export function OpportunitiesClient({
  initialOpportunities,
  initialTotalPages,
  initialCurrentPage,
}: OpportunitiesClientProps) {
  const searchParams = useSearchParams();
  
  // Parse search parameters for React Query
  const queryParams = {
    category: searchParams.get('category') || undefined,
    status: searchParams.get('status') || undefined,
    sort: searchParams.get('sort') || undefined,
    q: searchParams.get('q') || undefined,
    page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : initialCurrentPage,
  };
  
  // State to track if we're using cached data
  const [usingCachedData, setUsingCachedData] = useState(false);
  
  // Check for cached data on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        // Create cache key from params
        const params = new URLSearchParams();
        if (queryParams.category) params.append('category', queryParams.category);
        if (queryParams.status) params.append('status', queryParams.status);
        if (queryParams.sort) params.append('sort', queryParams.sort);
        if (queryParams.q) params.append('q', queryParams.q);
        if (queryParams.page) params.append('page', queryParams.page.toString());
        
        const cacheKey = params.toString() || 'default';
        const cacheItem = sessionStorage.getItem(`opportunities_${cacheKey}`);
        
        if (cacheItem) {
          const parsed = JSON.parse(cacheItem);
          if (Date.now() - parsed.timestamp < 30 * 1000) {
            setUsingCachedData(true);
          }
        }
      } catch (error) {
        // Silently fail if storage is not available
      }
    }
  }, [queryParams.category, queryParams.status, queryParams.sort, queryParams.q, queryParams.page]);
  
  // Use React Query to fetch opportunities
  const { 
    data, 
    isLoading, 
    isFetching,
    isError,
    error
  } = useOpportunities(queryParams);
  
  // Use the data from React Query or fall back to initial data
  const opportunities = data?.opportunities || initialOpportunities;
  const totalPages = data?.totalPages || initialTotalPages;
  const currentPage = data?.currentPage || initialCurrentPage;
  
  // Only show loading state when we don't have any data yet and we're not using cached data
  // This prevents the loading state from showing when we already have initial data or cached data
  const showLoading = isLoading && !initialOpportunities.length && !usingCachedData;

  /**
   * Error state - shows an error message if the API request fails
   */
  if (isError) {
    return (
      <div className="bg-white rounded-lg border border-red-200 p-8 text-center">
        <h3 className="text-lg font-medium text-red-700">Error loading opportunities</h3>
        <p className="mt-1 text-sm text-gray-500">
          Please try refreshing the page
        </p>
      </div>
    );
  }

  /**
   * Loading state - shows skeleton cards while data is being fetched
   */
  if (showLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
            <div className="h-10 bg-gray-200 rounded w-full mt-4"></div>
          </div>
        ))}
      </div>
    );
  }

  /**
   * Empty state - shows a message when no opportunities match the current filters
   */
  if (opportunities.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <h3 className="text-lg font-medium text-gray-900">No opportunities found</h3>
        <p className="mt-1 text-sm text-gray-500">
          Try adjusting your search or filter criteria
        </p>
      </div>
    );
  }

  /**
   * Main render - displays the grid of opportunity cards and pagination
   */
  return (
    <>
      {/* Grid of opportunity cards - responsive layout with different columns based on screen size */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {opportunities.map((opportunity: Opportunity) => (
          <OpportunityCard 
            key={opportunity.id} 
            opportunity={{
              ...opportunity,
              deadline: new Date(opportunity.deadline),
            }} 
          />
        ))}
      </div>
      
      {/* Pagination component for navigating between pages */}
      <Pagination 
        currentPage={currentPage} 
        totalPages={totalPages} 
      />
    </>
  );
} 