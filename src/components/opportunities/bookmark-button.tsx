"use client";

import { Bookmark } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface BookmarkButtonProps {
  opportunityId: string;
}

export function BookmarkButton({ opportunityId }: BookmarkButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if opportunity is bookmarked by this user
    if (session?.user?.id) {
      setIsLoading(true);
      // Fetch bookmark status from API
      fetch(`/api/opportunities/${opportunityId}/bookmark/status`)
        .then(res => res.json())
        .then(data => {
          setIsBookmarked(data.isBookmarked);
          setIsLoading(false);
        })
        .catch(error => {
          console.error("Failed to fetch bookmark status:", error);
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [session, opportunityId]);

  const handleBookmarkClick = async () => {
    if (!session) {
      router.push("/login");
      return;
    }

    // Toggle bookmark state optimistically
    setIsBookmarked(!isBookmarked);

    // Send API request to toggle bookmark
    try {
      await fetch(`/api/opportunities/${opportunityId}/bookmark`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookmarked: !isBookmarked }),
      });
      
      // Revalidate the opportunities page
      await fetch('/api/revalidate?path=/opportunities', { method: 'POST' });
      
      // Navigate to the current page to force a refresh
      router.refresh();
    } catch (error) {
      // Revert on error
      setIsBookmarked(isBookmarked);
      console.error("Failed to update bookmark:", error);
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

  return (
    <button
      onClick={handleBookmarkClick}
      className={`btn ${
        isBookmarked ? "bg-blue-50 text-blue-600 border-blue-600" : "btn-outline"
      }`}
      aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
    >
      <Bookmark
        className={`h-5 w-5 mr-2 ${isBookmarked ? "fill-blue-600" : ""}`}
      />
      {isBookmarked ? "Bookmarked" : "Bookmark"}
    </button>
  );
}