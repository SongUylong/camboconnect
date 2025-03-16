"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { User, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import Image from "next/image";

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
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFriendRequests();
  }, []);

  const fetchFriendRequests = async () => {
    try {
      const response = await fetch("/api/friends/requests");
      if (!response.ok) throw new Error("Failed to fetch friend requests");
      const data = await response.json();
      setRequests(data.requests);
    } catch (error) {
      console.error("Error fetching friend requests:", error);
      toast.error("Failed to load friend requests");
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      const response = await fetch(`/api/friends/requests/${requestId}`, {
        method: "POST",
      });

      if (!response.ok) throw new Error("Failed to accept friend request");

      // Update local state
      setRequests((prevRequests) =>
        prevRequests.filter((request) => request.id !== requestId)
      );
      toast.success("Friend request accepted");
    } catch (error) {
      console.error("Error accepting friend request:", error);
      toast.error("Failed to accept friend request");
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    try {
      const response = await fetch(`/api/friends/requests/${requestId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to decline friend request");

      // Update local state
      setRequests((prevRequests) =>
        prevRequests.filter((request) => request.id !== requestId)
      );
      toast.success("Friend request declined");
    } catch (error) {
      console.error("Error declining friend request:", error);
      toast.error("Failed to decline friend request");
    }
  };

  // Filter requests based on search query
  const filteredRequests = requests.filter((request) =>
    `${request.sender.firstName} ${request.sender.lastName}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-8">
        <User className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No friend requests</h3>
        <p className="mt-1 text-sm text-gray-500">
          You don't have any pending friend requests.
        </p>
      </div>
    );
  }

  if (filteredRequests.length === 0) {
    return (
      <div className="text-center py-8">
        <h3 className="text-sm font-medium text-gray-900">No results found</h3>
        <p className="mt-1 text-sm text-gray-500">
          Try adjusting your search query.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredRequests.map((request) => (
        <Card key={request.id} className="p-4">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
              {request.sender.profileImage ? (
                <Image
                  src={request.sender.profileImage}
                  alt={`${request.sender.firstName}'s profile`}
                  className="h-12 w-12 rounded-full object-cover"
                  referrerPolicy="no-referrer"
                  width={48}
                  height={48}
                />
              ) : (
                <User className="h-6 w-6 text-gray-500" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <Link
                href={`/profile/${request.sender.id}`}
                className="text-sm font-medium text-gray-900 hover:text-blue-600 truncate block"
              >
                {request.sender.firstName} {request.sender.lastName}
              </Link>
              <p className="text-sm text-gray-500 truncate">{request.sender.email}</p>
              <p className="text-xs text-gray-400 mt-1">
                Sent {new Date(request.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex flex-col space-y-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-green-500 hover:text-green-600 hover:bg-green-50"
                onClick={() => handleAcceptRequest(request.id)}
              >
                <Check className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={() => handleDeclineRequest(request.id)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
} 