"use client";

import { User } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { FriendActions } from "@/components/friend-actions";
import { useFriendStore } from "@/store/use-friend-store";

type Participation = {
  id: string;
  year: number;
  isPublic: boolean;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    profileImage: string | null;
    privacyLevel: string;
  };
};

interface PreviousParticipantsProps {
  participations: Participation[];
}

export function PreviousParticipants({ participations }: PreviousParticipantsProps) {
  const { data: session } = useSession();
  const { setInitialState } = useFriendStore();

  useEffect(() => {
    // Initialize friend store with participants data
    // You'll need to fetch the friendship status for these users from your API
    const initializeFriendStore = async () => {
      try {
        const response = await fetch("/api/friends");
        if (!response.ok) throw new Error("Failed to fetch friends");
        const data = await response.json();
        
        const friendIds = data.friends.map((friend: any) => friend.id);
        const pendingRequestsResponse = await fetch("/api/friends/requests");
        if (!pendingRequestsResponse.ok) throw new Error("Failed to fetch pending requests");
        const pendingData = await pendingRequestsResponse.json();
        
        const pendingRequestIds = pendingData.requests.map((request: any) => request.sender.id);
        
        setInitialState(friendIds, pendingRequestIds);
      } catch (error) {
        console.error("Error initializing friend store:", error);
      }
    };

    if (session?.user) {
      initializeFriendStore();
    }
  }, [session, setInitialState]);

  if (participations.length === 0) {
    return (
      <div className="text-center py-8">
        <User className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No participants yet</h3>
        <p className="mt-1 text-sm text-gray-500">
          Be the first to participate in this opportunity.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {participations.map((participation) => (
        <div
          key={participation.id}
          className="bg-white rounded-lg border border-gray-200 p-4 flex items-start space-x-4"
        >
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
              {participation.user.profileImage ? (
                <img
                  src={participation.user.profileImage}
                  alt={`${participation.user.firstName}'s profile`}
                  className="h-10 w-10 rounded-full object-cover"
                  referrerPolicy="no-referrer"
                  crossOrigin="anonymous"
                />
              ) : (
                <User className="h-5 w-5 text-gray-500" />
              )}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <Link
              href={`/profile/${participation.user.id}`}
              className="text-sm font-medium text-gray-900 hover:text-blue-600 truncate block"
            >
              {participation.user.firstName} {participation.user.lastName}
            </Link>
            <p className="text-sm text-gray-500">Participated in {participation.year}</p>
            {session?.user?.id !== participation.user.id && (
              <div className="mt-2">
                <FriendActions userId={participation.user.id} />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}