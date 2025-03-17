"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { useOrganizationFollowStatus, useToggleOrganizationFollow } from "@/hooks/use-community";

interface FollowButtonProps {
  organizationId: string;
}

export function FollowButton({ organizationId }: FollowButtonProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Use React Query hooks
  const { 
    data: followStatus,
    isLoading: isLoadingStatus 
  } = useOrganizationFollowStatus(session?.user?.id ? organizationId : null);
  
  const { 
    mutate: toggleFollow,
    isPending: isSubmitting
  } = useToggleOrganizationFollow();

  const isFollowing = followStatus?.following || false;
  const isLoading = isLoadingStatus || isSubmitting;

  const handleFollowClick = async () => {
    if (!session) {
      // Redirect to login with callback URL to return to this page
      const callbackUrl = `/community/${organizationId}`;
      router.push(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
      return;
    }

    // Toggle follow state using React Query mutation
    toggleFollow({ 
      organizationId, 
      following: !isFollowing 
    });
  };

  if (isLoading && status !== 'unauthenticated') {
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
      onClick={handleFollowClick}
      className={`btn ${
        isFollowing ? "bg-blue-50 text-blue-600 border-blue-600" : "btn-outline"
      }`}
      aria-label={isFollowing ? "Unfollow organization" : "Follow organization"}
    >
      <Bell
        className={`h-5 w-5 mr-2 ${isFollowing ? "fill-blue-600" : ""}`}
      />
      {isFollowing ? "Following" : "Follow"}
    </button>
  );
}