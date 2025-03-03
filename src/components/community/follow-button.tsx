"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Bell } from "lucide-react";

interface FollowButtonProps {
  organizationId: string;
}

export function FollowButton({ organizationId }: FollowButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if organization is followed by this user
    if (session?.user?.id) {
      setIsLoading(true);
      fetch(`/api/organizations/${organizationId}/follow/status`)
        .then(res => res.json())
        .then(data => {
          setIsFollowing(data.following);
          setIsLoading(false);
        })
        .catch(error => {
          console.error("Failed to fetch follow status:", error);
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [session, organizationId]);

  const handleFollowClick = async () => {
    if (!session) {
      router.push("/login");
      return;
    }

    // Toggle follow state optimistically
    setIsFollowing(!isFollowing);

    try {
      const response = await fetch(`/api/organizations/${organizationId}/follow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ following: !isFollowing }),
      });

      if (!response.ok) {
        // Revert on error
        setIsFollowing(isFollowing);
        throw new Error('Failed to update follow status');
      }

      // Refresh the page to update counts and states
      router.refresh();
    } catch (error) {
      // Revert on error
      setIsFollowing(isFollowing);
      console.error("Failed to update follow status:", error);
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