"use client";

import { Bookmark, Eye, ExternalLink } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useBookmarkStore } from "@/store/bookmarkStore";
import { useApplicationStore } from "@/store/applicationStore";

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
    isBookmarked?: boolean;
  };
  variant?: "default" | "compact";
};

export function OpportunityCard({ opportunity, variant = "default" }: OpportunityCardProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const { isBookmarked, addBookmark, removeBookmark } = useBookmarkStore();
  const { isApplied, appliedOpportunities } = useApplicationStore();

  // Debug log when component mounts or updates
  useEffect(() => {
    console.log('OpportunityCard rendered for:', opportunity.id);
    console.log('Current applied opportunities:', appliedOpportunities);
    console.log('Is this opportunity applied?', isApplied(opportunity.id));
  }, [opportunity.id, appliedOpportunities, isApplied]);

  const revalidatePaths = async () => {
    try {
      // Revalidate all related paths
      await Promise.all([
        fetch('/api/revalidate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: '/opportunities' })
        }),
        fetch('/api/revalidate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: '/profile/bookmarks' })
        }),
        fetch('/api/revalidate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: `/opportunities/${opportunity.id}` })
        })
      ]);
    } catch (error) {
      console.error("Failed to revalidate paths:", error);
    }
  };

  // Status badge style based on status
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

  // Status text based on status
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

  const handleBookmarkClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session) {
      router.push("/login");
      return;
    }

    try {
      const newBookmarkState = !isBookmarked(opportunity.id);
      
      // API call to update bookmark status
      const response = await fetch(`/api/opportunities/${opportunity.id}/bookmark`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookmarked: newBookmarkState }),
      });

      if (!response.ok) {
        throw new Error('Failed to update bookmark');
      }

      // Update global state
      if (newBookmarkState) {
        addBookmark(opportunity.id);
      } else {
        removeBookmark(opportunity.id);
      }
      
      // Force router refresh to update server state
      router.refresh();
    } catch (error) {
      console.error("Failed to update bookmark:", error);
    }
  };

  const hasApplied = isApplied(opportunity.id);
  console.log(`Opportunity ${opportunity.id} applied status:`, hasApplied);

  if (variant === "compact") {
    return (
      <Link
        href={`/opportunities/${opportunity.id}`}
        className="block bg-white hover:bg-gray-50 transition-colors duration-200 border-b border-gray-200 last:border-b-0"
      >
        <div className="p-4">
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`badge ${getStatusBadgeClass(opportunity.status)}`}>
                  {getStatusText(opportunity.status)}
                </span>
                {opportunity.isNew && (
                  <span className="badge badge-primary">New</span>
                )}
                {opportunity.isPopular && (
                  <span className="badge badge-secondary">Popular</span>
                )}
                {hasApplied && (
                  <span className="badge badge-warning">Applied</span>
                )}
              </div>
              <h3 className="text-base font-medium text-gray-900 truncate">{opportunity.title}</h3>
              <div className="mt-1 flex items-center text-sm text-gray-500 gap-2">
                <span>{opportunity.organization.name}</span>
                <span>•</span>
                <span>{opportunity.category.name}</span>
                <span>•</span>
                <span>Deadline: {format(new Date(opportunity.deadline), "PPP")}</span>
              </div>
            </div>
            <div className="flex items-center gap-4 ml-4">
              <div className="flex items-center text-sm text-gray-500">
                <Eye className="h-4 w-4 mr-1" />
                <span>{opportunity.visitCount}</span>
              </div>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleBookmarkClick(e);
                }}
                className={`text-gray-400 hover:text-blue-600 focus:outline-none ${
                  isBookmarked(opportunity.id) ? 'text-blue-600' : ''
                }`}
                aria-label={isBookmarked(opportunity.id) ? "Remove bookmark" : "Add bookmark"}
              >
                <Bookmark
                  className={`h-5 w-5 ${
                    isBookmarked(opportunity.id) ? "fill-blue-600 text-blue-600" : ""
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/opportunities/${opportunity.id}`}
      className="card hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col h-full"
    >
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex justify-between items-start">
          <div>
            <span className={`badge ${getStatusBadgeClass(opportunity.status)}`}>
              {getStatusText(opportunity.status)}
            </span>
            {opportunity.isNew && (
              <span className="badge badge-primary ml-2">New</span>
            )}
            {opportunity.isPopular && (
              <span className="badge badge-secondary ml-2">Popular</span>
            )}
            {hasApplied && (
              <span className="badge badge-warning ml-2">Applied</span>
            )}
          </div>
          <button
            onClick={handleBookmarkClick}
            className={`text-gray-400 hover:text-blue-600 focus:outline-none ${
              isBookmarked(opportunity.id) ? 'text-blue-600' : ''
            }`}
            aria-label={isBookmarked(opportunity.id) ? "Remove bookmark" : "Add bookmark"}
          >
            <Bookmark
              className={`h-5 w-5 ${
                isBookmarked(opportunity.id) ? "fill-blue-600 text-blue-600" : ""
              }`}
            />
          </button>
        </div>

        <h3 className="mt-3 text-lg font-semibold text-gray-900">{opportunity.title}</h3>

        <div className="mt-2 text-sm text-gray-500">
          <div className="font-medium">{opportunity.organization.name}</div>
          <div className="mt-1">
            Category: <span className="font-medium">{opportunity.category.name}</span>
          </div>
          <div className="mt-1">
            Deadline:{" "}
            <span className="font-medium">{format(new Date(opportunity.deadline), "PPP")}</span>
          </div>
        </div>

        <p className="mt-4 text-sm text-gray-600 flex-grow">{opportunity.shortDescription}</p>

        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-500">
            <Eye className="h-4 w-4 mr-1" />
            <span>{opportunity.visitCount} views</span>
          </div>
          
          <div className="flex items-center">
            <span className="text-blue-600 text-sm font-medium">View Details</span>
            <ExternalLink className="h-4 w-4 ml-1 text-blue-600" />
          </div>
        </div>
      </div>
    </Link>
  );
}