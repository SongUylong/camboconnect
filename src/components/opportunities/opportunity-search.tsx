"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import throttle from "lodash/throttle";
import { useQueryClient } from "@tanstack/react-query";

/**
 * OpportunitySearch - Client Component
 * 
 * Responsible for:
 * 1. Providing a search input for text-based filtering of opportunities
 * 2. Throttling search requests to prevent excessive API calls
 * 3. Updating the URL search parameters when the search query changes
 * 4. Providing visual feedback during search operations
 * 
 * This component renders a search input with a search icon that changes color
 * during active searches to provide visual feedback to the user.
 */
export function OpportunitySearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  
  // Initialize search query from URL parameters
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  // Track when a search is in progress for visual feedback
  const [isSearching, setIsSearching] = useState(false);
  
  // Get loading state from React Query
  const isFetching = queryClient.isFetching({ queryKey: ['opportunities'] }) > 0;

  /**
   * Create a throttled search function to limit the frequency of URL updates
   * This prevents excessive re-renders and API calls when the user is typing quickly
   */
  const throttledSearch = useCallback(
    throttle((query: string) => {
      setIsSearching(true);
      const params = new URLSearchParams(searchParams.toString());
      
      // Update or remove the search query parameter
      if (query) {
        params.set("q", query);
      } else {
        params.delete("q");
      }
      
      // Update the URL with the new search parameters
      router.push(`${pathname}?${params.toString()}`);
      
      // Provide brief visual feedback that search is happening
      setTimeout(() => setIsSearching(false), 200);
    }, 200, { leading: true, trailing: true }), // Execute on first call and last call within the window
    [pathname, searchParams]
  );

  /**
   * Cleanup the throttled function on component unmount
   * This prevents memory leaks and unexpected behavior
   */
  useEffect(() => {
    return () => {
      throttledSearch.cancel();
    };
  }, [throttledSearch]);

  /**
   * Handle search input changes
   * Updates local state and triggers the throttled search
   */
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    throttledSearch(query);
  };

  return (
    <div className="relative w-full md:w-80">
      {/* Search input field - removed disabled attribute to allow typing during search */}
      <input
        type="text"
        value={searchQuery}
        onChange={handleSearchChange}
        placeholder="Search opportunities..."
        className="input w-full pl-10 pr-4 py-2"
        aria-label="Search opportunities"
      />
      
      {/* Search icon - changes color during active search or fetching */}
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <Search className={`h-5 w-5 ${isSearching || isFetching ? "text-blue-500" : "text-gray-400"}`} />
      </div>
    </div>
  );
} 