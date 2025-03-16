"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useBookmarkStore } from "@/store/bookmarkStore";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

/**
 * Fetches user bookmarks from the API
 */
const fetchUserBookmarks = async () => {
  const response = await fetch('/api/profile/bookmarks');
  if (!response.ok) {
    throw new Error(`Failed to fetch bookmarks: ${response.statusText}`);
  }
  return response.json();
};

/**
 * Component that initializes the bookmark state from the server
 * Uses React Query for data fetching and caching
 */
export function BookmarkStateInitializer() {
  const { data: session, status } = useSession();
  const { setInitialBookmarks } = useBookmarkStore();
  const pathname = usePathname();

  // Only fetch bookmarks if the user is authenticated
  const enabled = status === "authenticated" && !!session?.user;
  
  // Use React Query to fetch and cache bookmarks
  const { data: bookmarks, error } = useQuery({
    queryKey: ['bookmarks', session?.user?.id],
    queryFn: fetchUserBookmarks,
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  // Initialize bookmark store when data is available
  useEffect(() => {
    if (bookmarks) {
      // Extract opportunity IDs from bookmarks
      const bookmarkIds = bookmarks.map((bookmark: any) => bookmark.id);
      
      // Update the global store
      setInitialBookmarks(bookmarkIds);
    }
  }, [bookmarks, setInitialBookmarks]);

  // Handle errors
  useEffect(() => {
    if (error) {
      console.error('Error initializing bookmark state:', error);
      
      // Only show toast for non-404 errors
      if (!(error instanceof Error && error.message.includes('404'))) {
        toast.error('Failed to load your bookmarks. Please refresh the page.');
      }
    }
  }, [error]);

  return null;
} 