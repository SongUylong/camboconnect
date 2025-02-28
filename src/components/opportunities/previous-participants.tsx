"use client";

import { User, UserPlus } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
  const router = useRouter();
  const [friendRequests, setFriendRequests] = useState<Record<string, boolean>>({});

  if (participations.length === 0) {
    return (
      <div className="bg-gray-50 p-4 rounded-md text-center">
        <p className="text-gray-500">No previous participants found.</p>
      </div>
    );
  }

  const sendFriendRequest = async (userId: string) => {
    if (!session) {
      router.push("/login");
      return;
    }

    // Optimistically update UI
    setFriendRequests({ ...friendRequests, [userId]: true });

    try {
      // In a real app, send API request
      // await fetch('/api/friends/request', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ receiverId: userId }),
      // });
    } catch (error) {
      // Revert on error
      setFriendRequests({ ...friendRequests, [userId]: false });
      console.error("Failed to send friend request:", error);
    }
  };

  return (
    <div className="border border-gray-200 rounded-md overflow-hidden">
      <ul className="divide-y divide-gray-200">
        {participations.map((participation) => (
          <li key={participation.id} className="p-4 hover:bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  {participation.user.profileImage ? (
                    <img
                      src={participation.user.profileImage}
                      alt={`${participation.user.firstName} ${participation.user.lastName}`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-6 w-6 text-gray-500" />
                  )}
                </div>
                <div className="ml-3">
                  <Link
                    href={`/profile/${participation.user.id}`}
                    className="text-sm font-medium text-gray-900 hover:text-blue-600"
                  >
                    {participation.user.firstName} {participation.user.lastName}
                  </Link>
                  <p className="text-sm text-gray-500">Participated in {participation.year}</p>
                </div>
              </div>
              
              {session && session.user.id !== participation.user.id && (
                <button
                  onClick={() => sendFriendRequest(participation.user.id)}
                  disabled={!!friendRequests[participation.user.id]}
                  className={`btn btn-sm ${
                    friendRequests[participation.user.id]
                      ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                      : "btn-outline"
                  }`}
                >
                  <UserPlus className="h-4 w-4 mr-1" />
                  {friendRequests[participation.user.id] ? "Friend Request Sent" : "Add Friend"}
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}