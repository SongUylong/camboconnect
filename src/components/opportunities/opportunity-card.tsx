"use client";

import { Bookmark, Eye, ExternalLink } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

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
};

export function OpportunityCard({ opportunity }: OpportunityCardProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isBookmarked, setIsBookmarked] = useState(opportunity.isBookmarked || false);

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

    // Toggle bookmark state optimistically
    setIsBookmarked(!isBookmarked);

    // API call to update bookmark status
    try {
      await fetch(`/api/opportunities/${opportunity.id}/bookmark`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookmarked: !isBookmarked }),
      });
      
      // Revalidate the opportunities page
      await fetch('/api/revalidate?path=/opportunities', { method: 'POST' });
      
      // Force a refresh of the current page
      router.refresh();
    } catch (error) {
      // Revert on error
      setIsBookmarked(isBookmarked);
      console.error("Failed to update bookmark:", error);
    }
  };

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
          </div>
          <button
            onClick={handleBookmarkClick}
            className={`text-gray-400 hover:text-blue-600 focus:outline-none ${isBookmarked ? 'text-blue-600' : ''}`}
            aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
          >
            <Bookmark
              className={`h-5 w-5 ${isBookmarked ? "fill-blue-600 text-blue-600" : ""}`}
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