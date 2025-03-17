"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import throttle from "lodash/throttle";
import { useOrganizationSearch } from "@/hooks/use-community";
import { Organization } from "@/api/community";

interface CommunitySearchProps {
  onSearchResults?: (organizations: Organization[]) => void;
}

export function CommunitySearch({ onSearchResults }: CommunitySearchProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  
  // Use React Query hook with enabled:false initially so we control when it runs
  const { 
    data: searchResults, 
    isLoading: isSearching,
    refetch
  } = useOrganizationSearch(searchQuery || undefined);
  
  // Create a throttled search function
  const throttledSearch = useCallback(
    throttle(async (query: string) => {
      const params = new URLSearchParams(searchParams.toString());
      const currentLayout = params.get("layout") || "grid"; // Preserve current layout
      
      if (query) {
        params.set("q", query);
      } else {
        params.delete("q");
      }
      
      // Ensure layout is always set
      params.set("layout", currentLayout);
      
      // Update URL without refresh
      router.push(`${pathname}?${params.toString()}`, { scroll: false });

      // Execute the search and pass results to parent
      refetch().then(result => {
        if (result.data && onSearchResults) {
          onSearchResults(result.data);
        }
      }).catch(error => {
        console.error("Search failed:", error);
      });
    }, 200, { leading: true, trailing: true }), // Execute on first and last call within the window
    [pathname, searchParams, onSearchResults, refetch]
  );

  // Cleanup the throttled function on unmount
  useEffect(() => {
    return () => {
      throttledSearch.cancel();
    };
  }, [throttledSearch]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    throttledSearch(query);
  };

  return (
    <div className="relative w-full md:w-80">
      <input
        type="text"
        value={searchQuery}
        onChange={handleSearchChange}
        placeholder="Search organizations..."
        className="input w-full pl-10 pr-4 py-2"
        aria-label="Search organizations"
      />
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <Search className={`h-5 w-5 ${isSearching ? "text-blue-500" : "text-gray-400"}`} />
      </div>
    </div>
  );
} 