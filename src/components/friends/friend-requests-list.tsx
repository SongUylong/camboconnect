"use client";

import { useFriendRequests, useAcceptFriendRequest, useDeclineFriendRequest } from '@/hooks/use-friends';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface FriendRequest {
  id: string;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    profileImage?: string | null;
  };
  status: "PENDING" | "ACCEPTED" | "DECLINED";
  createdAt: string;
}

interface FriendRequestsListProps {
  searchQuery: string;
}

export function FriendRequestsList({ searchQuery }: FriendRequestsListProps) {
  const { data: requests, isLoading } = useFriendRequests();
  const acceptRequest = useAcceptFriendRequest();
  const declineRequest = useDeclineFriendRequest();

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await acceptRequest.mutateAsync(requestId);
      toast.success('Friend request accepted');
    } catch (error) {
      console.error('Error accepting friend request:', error);
      toast.error('Failed to accept friend request');
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    try {
      await declineRequest.mutateAsync(requestId);
      toast.success('Friend request declined');
    } catch (error) {
      console.error('Error declining friend request:', error);
      toast.error('Failed to decline friend request');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!requests?.length) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No pending friend requests</p>
      </div>
    );
  }

  const filteredRequests = requests.filter((request) =>
    `${request.sender.firstName} ${request.sender.lastName}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {filteredRequests.map((request) => (
        <div
          key={request.id}
          className="flex items-center justify-between p-4 bg-white rounded-lg shadow"
        >
          <div className="flex items-center space-x-3">
            <img
              src={request.sender.profileImage || '/default-avatar.png'}
              alt={`${request.sender.firstName} ${request.sender.lastName}`}
              className="w-10 h-10 rounded-full"
            />
            <div>
              <p className="font-medium">
                {request.sender.firstName} {request.sender.lastName}
              </p>
              <p className="text-sm text-gray-500">{request.sender.email}</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handleAcceptRequest(request.id)}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={acceptRequest.isPending}
            >
              {acceptRequest.isPending ? 'Accepting...' : 'Accept'}
            </button>
            <button
              onClick={() => handleDeclineRequest(request.id)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              disabled={declineRequest.isPending}
            >
              {declineRequest.isPending ? 'Declining...' : 'Decline'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
} 