"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ChevronDown, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

/**
 * Type definition for a category object
 */
type CategoryType = {
  id: string;
  name: string;
};

/**
 * Props for the OpportunityFilter component
 */
type FilterProps = {
  categories: CategoryType[];  // Array of categories to display in the filter
};

/**
 * OpportunityFilter - Client Component
 * 
 * Responsible for:
 * 1. Providing UI controls for filtering opportunities
 * 2. Managing filter state (status, category, sort order)
 * 3. Updating the URL search parameters when filters change
 * 4. Providing a reset button to clear all filters
 * 
 * This component renders a sidebar with dropdown selects for each filter option.
 * When a filter is changed, it updates the URL, which triggers a refetch in the parent component.
 */
export function OpportunityFilter({ categories }: FilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  
  // Initialize state from URL search parameters
  const [status, setStatus] = useState<string>(searchParams.get("status") || "");
  const [category, setCategory] = useState<string>(searchParams.get("category") || "");
  const [sort, setSort] = useState<string>(searchParams.get("sort") || "latest");
  
  // Get loading state from React Query
  const isFetching = queryClient.isFetching({ queryKey: ['opportunities'] }) > 0;

  /**
   * Effect to update URL when filter values change
   * This triggers a refetch in the parent component without a full page reload
   */
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Update status parameter
    if (status) {
      params.set("status", status);
    } else {
      params.delete("status");
    }
    
    // Update category parameter
    if (category) {
      params.set("category", category);
    } else {
      params.delete("category");
    }
    
    // Update sort parameter (only if not default)
    if (sort && sort !== "latest") {
      params.set("sort", sort);
    } else {
      params.delete("sort");
    }
    
    // Update URL with new parameters
    router.push(`${pathname}?${params.toString()}`);
  }, [status, category, sort, router, pathname, searchParams]);

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Filters</h3>
        {isFetching && (
          <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
        )}
      </div>
      
      <div className="space-y-4">
        {/* Status Filter Dropdown */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <div className="relative">
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="input appearance-none pr-10 w-full"
              disabled={isFetching}
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="OPENING_SOON">Opening Soon</option>
              <option value="CLOSING_SOON">Closing Soon</option>
              <option value="CLOSED">Closed</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 pointer-events-none text-gray-400" />
          </div>
        </div>
        
        {/* Category Filter Dropdown */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <div className="relative">
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input appearance-none pr-10 w-full"
              disabled={isFetching}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 pointer-events-none text-gray-400" />
          </div>
        </div>
        
        {/* Sort Order Dropdown */}
        <div>
          <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">
            Sort By
          </label>
          <div className="relative">
            <select
              id="sort"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="input appearance-none pr-10 w-full"
              disabled={isFetching}
            >
              <option value="latest">Latest</option>
              <option value="deadline">Deadline (Soonest)</option>
              <option value="popular">Most Popular</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 pointer-events-none text-gray-400" />
          </div>
        </div>
        
        {/* Reset Button - Clears all filters */}
        <button
          onClick={() => {
            setStatus("");
            setCategory("");
            setSort("latest");
          }}
          className="btn btn-outline w-full mt-2"
          disabled={isFetching}
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
}