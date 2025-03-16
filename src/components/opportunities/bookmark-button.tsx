"use client";

import { Bookmark } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useBookmarkStore } from "@/store/bookmarkStore";
import { useBookmarkMutation } from "@/hooks/use-opportunities";

interface BookmarkButtonProps {
  opportunityId: string;
}

export function BookmarkButton({ opportunityId }: BookmarkButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const { isBookmarked, isPendingBookmark } = useBookmarkStore();
  const bookmarkMutation = useBookmarkMutation();

  const handleBookmarkClick = async () => {
    if (!session) {
      router.push("/login");
      return;
    }

    const newBookmarkState = !isBookmarked(opportunityId);
    
    // Use React Query mutation to update bookmark status
    // The mutation will handle all state updates and loading states
    bookmarkMutation.mutate({ 
      id: opportunityId, 
      bookmarked: newBookmarkState 
    });
  };

  // Check if this bookmark operation is pending
  const isLoading = isPendingBookmark(opportunityId);
  const bookmarked = isBookmarked(opportunityId);

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