"use client";

import { Bookmark } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useBookmarkStore } from "@/store/bookmarkStore";

interface BookmarkButtonProps {
  opportunityId: string;
}

export function BookmarkButton({ opportunityId }: BookmarkButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { isBookmarked, addBookmark, removeBookmark } = useBookmarkStore();

  const handleBookmarkClick = async () => {
    if (!session) {
      router.push("/login");
      return;
    }

    setIsLoading(true);

    try {
      const newBookmarkState = !isBookmarked(opportunityId);
      
      // Send API request to toggle bookmark
      const response = await fetch(`/api/opportunities/${opportunityId}/bookmark`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookmarked: newBookmarkState }),
      });

      if (!response.ok) {
        throw new Error('Failed to update bookmark');
      }

      // Update global state
      if (newBookmarkState) {
        addBookmark(opportunityId);
      } else {
        removeBookmark(opportunityId);
      }
      
      // Force router refresh to update server state
      router.refresh();
    } catch (error) {
      console.error("Failed to update bookmark:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <button
        className="btn btn-outline opacity-75"
        disabled
      >
        <span className="animate-pulse">Loading...</span>
      </button>
    );
  }

  const bookmarked = isBookmarked(opportunityId);

  return (
    <button
      onClick={handleBookmarkClick}
      className={`btn ${
        bookmarked ? "bg-blue-50 text-blue-600 border-blue-600 p-2" : "btn-outline"
      }`}
      aria-label={bookmarked ? "Remove bookmark" : "Add bookmark"}
    >
      <Bookmark
        className={`h-5 w-5 mr-2 ${bookmarked ? "fill-blue-600" : ""}`}
      />
      {bookmarked ? "Bookmarked" : "Bookmark"}
    </button>
  );
}