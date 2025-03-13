"use client";

import { Bookmark, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface BookmarkButtonProps {
  opportunityId: string;
  isBookmarked: boolean;
  onBookmark: () => Promise<void>;
  onUnbookmark: () => Promise<void>;
}

export function BookmarkButton({
  opportunityId,
  isBookmarked,
  onBookmark,
  onUnbookmark,
}: BookmarkButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session) {
      router.push("/login");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      if (isBookmarked) {
        await onUnbookmark();
      } else {
        await onBookmark();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update bookmark');
      // Clear error after 3 seconds
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={`relative inline-flex items-center justify-center p-2 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
          isBookmarked
            ? 'text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100'
            : 'text-gray-400 hover:text-gray-500 bg-gray-50 hover:bg-gray-100'
        }`}
        title={isBookmarked ? "Remove from bookmarks" : "Add to bookmarks"}
      >
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Bookmark
            className={`h-5 w-5 ${isBookmarked ? "fill-current" : ""}`}
          />
        )}
      </button>
      
      {/* Error tooltip */}
      {error && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-red-500 text-white text-sm rounded shadow-lg whitespace-nowrap">
          {error}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-red-500"></div>
        </div>
      )}
    </div>
  );
}