"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useBookmarkStore } from "@/store/bookmarkStore";
import { usePathname } from "next/navigation";
import { toast } from "sonner";

export function BookmarkStateInitializer() {
  const { data: session, status } = useSession();
  const { setInitialBookmarks } = useBookmarkStore();
  const pathname = usePathname();

  useEffect(() => {
    const initializeBookmarkState = async () => {
      // Only proceed if we have a valid session
      if (status !== "authenticated" || !session?.user) return;

      try {
        // Fetch bookmarks from API
        const response = await fetch('/api/profile/bookmarks');
        if (!response.ok) {
          throw new Error(`Failed to fetch bookmarks: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Initialize the global bookmark store with current bookmarks
        setInitialBookmarks(data.map((bookmark: any) => bookmark.id));
      } catch (error) {
        console.error('Error initializing bookmark state:', error);
        // Only show toast for non-404 errors (404 might happen if the endpoint doesn't exist yet)
        if (!(error instanceof Error && error.message.includes('404'))) {
          toast.error('Failed to load your bookmarks. Please refresh the page.');
        }
      }
    };

    initializeBookmarkState();
  }, [session?.user?.id, status, setInitialBookmarks, pathname]);

  return null;
} 