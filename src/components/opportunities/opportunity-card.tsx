// src/components/OpportunityCard.tsx (or your relevant path)

"use client";

import { Bookmark, Eye, ExternalLink } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
// import { useState } from "react"; // No longer needed if not using local state for hover
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useBookmarkStore } from "@/store/bookmarkStore";
import { useApplicationStore } from "@/store/applicationStore";
import { useBookmarkMutation } from "@/hooks/use-opportunities";
import { BorderTrail } from  "@/components/ui/border-trail"; // Adjust the import path as needed

/**
 * Props for the OpportunityCard component
 * Defines the structure of an opportunity and optional display variant
 */
type OpportunityCardProps = {
  opportunity: {
    id: string;
    title: string;
    shortDescription: string;
    deadline: Date;
    status: "OPENING_SOON" | "ACTIVE" | "CLOSING_SOON" | "CLOSED";
    visitCount: number;
    isPopular: boolean;
    isNew: boolean;
    organization: {
      id: string;
      name: string;
      logo?: string | null;
    };
    category: {
      id: string;
      name: string;
    };
    isBookmarked?: boolean; // isBookmarked prop might be sourced differently now (via Zustand/Query)
  };
  variant?: "default" | "compact"; // Controls the display style of the card
};

/**
 * OpportunityCard - Client Component
 *
 * Responsible for:
 * 1. Displaying an individual opportunity in a card format with hover effect.
 * 2. Handling bookmark toggling functionality using React Query mutation.
 * 3. Tracking visit counts (data provided via props).
 * 4. Displaying status badges and deadline information.
 * 5. Supporting different display variants (default/compact).
 * 6. Showing a border trail effect on hover.
 */
export function OpportunityCard({ opportunity, variant = "default" }: OpportunityCardProps) {
  const { data: session } = useSession();
  const router = useRouter();
  // Get bookmark status directly from the store
  const { isBookmarked } = useBookmarkStore();
  const { isApplied } = useApplicationStore();

  // Use the bookmark mutation from React Query
  const bookmarkMutation = useBookmarkMutation();

  /**
   * Helper function to determine the CSS class for status badges
   */
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "OPENING_SOON":
        return "badge-secondary";
      case "ACTIVE":
        return "badge-success";
      case "CLOSING_SOON":
        return "badge-warning";
      case "CLOSED":
        return "badge-danger";
      default:
        return "badge-secondary";
    }
  };

  /**
   * Helper function to convert status codes to human-readable text
   */
  const getStatusText = (status: string) => {
    switch (status) {
      case "OPENING_SOON":
        return "Opening Soon";
      case "ACTIVE":
        return "Active";
      case "CLOSING_SOON":
        return "Closing Soon";
      case "CLOSED":
        return "Closed";
      default:
        return status;
    }
  };

  /**
   * Handler for bookmark button clicks
   */
  const handleBookmarkClick = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent link navigation
    e.stopPropagation(); // Prevent triggering card hover/click events if nested

    if (!session) {
      // Redirect to login with callback URL
      const callbackUrl = `/opportunities/${opportunity.id}`;
      router.push(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
      return;
    }

    try {
      const currentlyBookmarked = isBookmarked(opportunity.id);
      // Mutate using React Query
      bookmarkMutation.mutate({
        id: opportunity.id,
        bookmarked: !currentlyBookmarked, // Toggle the state
      });
    } catch (error) {
      console.error("Failed to toggle bookmark:", error);
      // Optionally: Add user feedback like a toast notification
    }
  };

  const hasApplied = isApplied(opportunity.id);
  const currentBookmarkStatus = isBookmarked(opportunity.id); // Get current status for rendering

  // --- Compact Variant ---
  if (variant === "compact") {
    return (
      <Link
        href={`/opportunities/${opportunity.id}`}
        // Add 'group' for hover detection and 'relative' for positioning context
        className="group relative block bg-white hover:bg-gray-50 transition-colors duration-200 border-b border-gray-200 last:border-b-0 overflow-hidden dark:bg-zinc-900 dark:border-zinc-700 dark:hover:bg-zinc-800"
      >
        <BorderTrail
          // Control visibility with opacity based on parent hover
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-blue-500" // Example: Make trail blue
          // Pass other props if needed
          size={80} // Example: Adjust size
          // transition={{ duration: 3, ease: "easeInOut" }} // Example: Override transition
          style={
            {
              // You could add box-shadow *to the moving element* if desired
              // boxShadow: '0 0 10px 5px rgba(0, 150, 255, 0.7)'
            }
          }
        />
        {/* Content Wrapper: Needs relative and z-index to be above the trail */}
        <div className="relative z-10 p-4">
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap"> {/* Added flex-wrap */}
                <span className={`badge ${getStatusBadgeClass(opportunity.status)}`}>
                  {getStatusText(opportunity.status)}
                </span>
                {opportunity.isNew && <span className="badge badge-primary">New</span>}
                {opportunity.isPopular && <span className="badge badge-secondary">Popular</span>}
                {hasApplied && <span className="badge badge-warning">Applied</span>}
              </div>
              <h3 className="text-base font-medium text-gray-900 truncate dark:text-gray-100">{opportunity.title}</h3>
              <div className="mt-1 flex items-center text-sm text-gray-500 gap-x-2 gap-y-1 flex-wrap dark:text-gray-400"> {/* Added flex-wrap and adjusted gaps */}
                <span>{opportunity.organization.name}</span>
                <span className="hidden sm:inline">•</span>
                <span className="block sm:inline">{opportunity.category.name}</span>
                <span className="hidden sm:inline">•</span>
                <span className="block sm:inline">Deadline: {format(new Date(opportunity.deadline), "PP")}</span> {/* Use PP for shorter date */}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-4 ml-2 sm:ml-4 flex-shrink-0"> {/* Added flex-shrink-0 */}
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <Eye className="h-4 w-4 mr-1 flex-shrink-0" /> {/* Added flex-shrink-0 */}
                <span>{opportunity.visitCount}</span>
              </div>
              <button
                onClick={handleBookmarkClick}
                className={`text-gray-400 hover:text-blue-600 focus:outline-none dark:text-gray-500 dark:hover:text-blue-500 ${currentBookmarkStatus ? 'text-blue-600 dark:text-blue-500' : ''
                  }`}
                aria-label={currentBookmarkStatus ? "Remove bookmark" : "Add bookmark"}
              >
                <Bookmark
                  className={`h-5 w-5 transition-colors ${currentBookmarkStatus ? "fill-blue-600 text-blue-600 dark:fill-blue-500 dark:text-blue-500" : "text-gray-400 dark:text-gray-500"
                    }`}
                  fill={currentBookmarkStatus ? 'currentColor' : 'none'} // Use currentColor for fill when active
                />
              </button>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // --- Default Variant ---
  return (
    <Link
      href={`/opportunities/${opportunity.id}`}
      // Add 'group' for hover detection and 'relative' for positioning context
      // Added dark mode background/border
      className="group relative card hover:shadow-lg transition-shadow duration-300 overflow-hidden flex flex-col h-full bg-white dark:bg-zinc-900 border border-transparent dark:border-zinc-800"
    >
      {/* BorderTrail Component: Invisible by default, visible on group hover */}
      <BorderTrail
        className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" // pointer-events-none so it doesn't interfere with clicks
        // Use the style from your example or adjust as needed
        style={{
          boxShadow:
            '0px 0px 60px 30px rgb(255 255 255 / 20%), 0 0 100px 60px rgb(0 0 0 / 20%), 0 0 140px 90px rgb(0 0 0 / 20%)',
        }}
        size={100} // Use size from example or adjust
      />

      {/* Content Wrapper: Needs relative and z-index to be above the trail */}
      <div className="relative z-10 p-6 flex flex-col flex-grow">
        <div className="flex justify-between items-start gap-4"> {/* Added gap */}
          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <span className={`badge ${getStatusBadgeClass(opportunity.status)}`}>
              {getStatusText(opportunity.status)}
            </span>
            {opportunity.isNew && <span className="badge badge-primary">New</span>}
            {opportunity.isPopular && <span className="badge badge-secondary">Popular</span>}
            {hasApplied && <span className="badge badge-warning">Applied</span>}
          </div>
          {/* Bookmark Button */}
          <button
            onClick={handleBookmarkClick}
            className={`flex-shrink-0 text-gray-400 hover:text-blue-600 focus:outline-none dark:text-gray-500 dark:hover:text-blue-500 ${currentBookmarkStatus ? 'text-blue-600 dark:text-blue-500' : ''
              }`}
            aria-label={currentBookmarkStatus ? "Remove bookmark" : "Add bookmark"}
          >
            <Bookmark
              className={`h-5 w-5 transition-colors ${currentBookmarkStatus ? "fill-blue-600 text-blue-600 dark:fill-blue-500 dark:text-blue-500" : "text-gray-400 dark:text-gray-500"
                }`}
              fill={currentBookmarkStatus ? 'currentColor' : 'none'} // Use currentColor for fill when active
            />
          </button>
        </div>

        <h3 className="mt-3 text-lg font-semibold text-gray-900 dark:text-gray-100">{opportunity.title}</h3>

        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 space-y-1"> {/* Added space-y */}
          <div className="font-medium text-gray-700 dark:text-gray-300">{opportunity.organization.name}</div>
          <div>
            Category: <span className="font-medium">{opportunity.category.name}</span>
          </div>
          <div>
            Deadline:{" "}
            <span className="font-medium">{format(new Date(opportunity.deadline), "PPP")}</span>
          </div>
        </div>

        {/* Use line-clamp to limit description lines */}
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-300 flex-grow line-clamp-3">
          {opportunity.shortDescription}
        </p>

        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <Eye className="h-4 w-4 mr-1.5" /> {/* Adjusted margin */}
            <span>{opportunity.visitCount} views</span>
          </div>

          <div className="flex items-center text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline"> {/* Added hover effect */}
            <span>View Details</span>
            <ExternalLink className="h-4 w-4 ml-1" />
          </div>
        </div>
      </div>
    </Link>
  );
}
