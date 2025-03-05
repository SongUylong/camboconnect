"use client";

import { User, Users } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { FriendActions } from "@/components/friend-actions";
import { useFriendStore } from "@/store/use-friend-store";
import Image from "next/image";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { Tooltip } from "@/components/ui/tooltip";

type Participation = {
  id: string;
  year: number;
  privacyLevel: string;
  opportunity?: {
    id: string;
    title: string;
    description: string;
    startDate: string;
    endDate: string | null;
  };
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
  showOpportunity?: boolean;
}

export function PreviousParticipants({ participations, showOpportunity = false }: PreviousParticipantsProps) {
  const { data: session } = useSession();
  const { setInitialState } = useFriendStore();

  useEffect(() => {
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

  const getProfileImageUrl = (profileImage: string | null) => {
    if (!profileImage) return null;
    if (profileImage.startsWith('http')) return profileImage;
    return `${process.env.NEXT_PUBLIC_API_URL}${profileImage}`;
  };

  if (participations.length === 0) {
    return (
      <div className="text-center py-8">
        <User className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No participants yet</h3>
        <p className="mt-1 text-sm text-gray-500">
          {showOpportunity 
            ? "Be the first to participate in this opportunity."
            : "No participation history available."}
        </p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {participations.map((participation) => (
          <div
            key={participation.id}
            className="bg-white rounded-lg border border-gray-200 p-4"
          >
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="relative h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  {participation.user.profileImage ? (
                    <Image
                      src={getProfileImageUrl(participation.user.profileImage) || '/default-avatar.png'}
                      alt={`${participation.user.firstName}'s profile`}
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  ) : (
                    <User className="h-5 w-5 text-gray-500" />
                  )}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  {showOpportunity && (
                    <Link
                      href={`/profile/${participation.user.id}`}
                      className="text-sm font-medium text-gray-900 hover:text-blue-600 truncate block"
                    >
                      {participation.user.firstName} {participation.user.lastName}
                    </Link>
                  )}
                  {participation.privacyLevel === 'FRIENDS_ONLY' && (
                    <Tooltip content="Visible to friends only">
                      <div className="flex items-center cursor-pointer">
                        <Users className="h-4 w-4 text-blue-500" />
                      </div>
                    </Tooltip>
                  )}
                </div>
             
                {showOpportunity ? (
                  <p className="text-sm text-gray-500">Participated in {participation.year}</p>
                ) : (
                  participation.opportunity && (
                    <div className="mt-1">
                      <Link
                        href={`/opportunities/${participation.opportunity.id}`}
                        className="text-sm text-blue-600 hover:text-blue-800 truncate block"
                      >
                        {participation.opportunity.title}
                      </Link>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(participation.opportunity.startDate).getFullYear()}
                        {participation.opportunity.endDate && 
                          ` - ${new Date(participation.opportunity.endDate).getFullYear()}`}
                      </p>
                    </div>
                  )
                )}
                {session?.user?.id !== participation.user.id && (
                  <div className="mt-2">
                    <FriendActions userId={participation.user.id} />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </TooltipProvider>
  );
}