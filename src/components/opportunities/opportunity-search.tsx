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

  // Get loading state from React Query (optional: adjust queryKey if needed)
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

      // Reset page to 1 when search query changes
      params.set("page", "1"); 

      // Update the URL with the new search parameters
      // Using replace to avoid polluting browser history with every keystroke
      router.replace(`${pathname}?${params.toString()}`); 

      // Provide brief visual feedback that search is happening
      // Consider linking this duration to throttle time or fetch completion
      setTimeout(() => setIsSearching(false), 300); // Slightly longer timeout
    }, 300, { leading: false, trailing: true }), // Executes on trailing edge after pause
    [pathname, router, searchParams] // Added router to dependency array
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
   * Synchronize local state if URL search param changes externally
   */
  useEffect(() => {
    setSearchQuery(searchParams.get("q") || "");
  }, [searchParams]);


  /**
   * Handle search input changes
   * Updates local state and triggers the throttled search
   */
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    throttledSearch(query);
  };

  /**
   * Allow submitting search via Enter key (optional but good UX)
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      // Immediately trigger the search and cancel any pending throttled calls
      throttledSearch.flush(); 
    }
  };


  return (
    // Container div controlling overall width responsiveness
    <div className="relative w-full xl:w-80"> 
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          {/* Search icon with color change based on searching or fetching state */}
          <Search className={`h-5 w-5 transition-colors duration-200 ${isSearching || isFetching ? "text-blue-500 animate-pulse" : "text-gray-400"}`} /> 
        </div>
        <input
          value={searchQuery}
          onChange={handleSearchChange}
          onKeyDown={handleKeyDown} // Added KeyDown handler
          placeholder="Search by title..." // More specific placeholder
          // Input styling with responsive width and focus expansion
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl shadow-sm transition-all duration-300 focus:ring-1 focus:ring-blue-200 focus:border-blue-300 focus:outline-none lg:w-56 xl:focus:w-72" 
          name="search"
          type="search"
          aria-label="Search opportunities" // Accessibility improvement
        />
      </div>
    </div>
  );
}