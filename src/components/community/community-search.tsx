"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import throttle from "lodash/throttle";

interface CommunitySearchProps {
  onSearchResults?: (organizations: any[]) => void;
}

export function CommunitySearch({ onSearchResults }: CommunitySearchProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [isSearching, setIsSearching] = useState(false);

  // Create a throttled search function
  const throttledSearch = useCallback(
    throttle(async (query: string) => {
      setIsSearching(true);
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

      // Fetch results directly
      try {
        const response = await fetch(`/api/organizations/search?${params.toString()}`);
        if (response.ok) {
          const data = await response.json();
          if (onSearchResults) {
            onSearchResults(data);
          }
        }
      } catch (error) {
        console.error("Search failed:", error);
      }

      setIsSearching(false);
    }, 200, { leading: true, trailing: true }), // Execute on first and last call within the window
    [pathname, searchParams, onSearchResults]
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