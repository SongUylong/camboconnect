"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { User, Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import Image from "next/image";

interface SentFriendRequest {
  id: string;
  receiver: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    profileImage?: string | null;
  };
  status: "PENDING" | "ACCEPTED" | "DECLINED" | "CANCELED";
  createdAt: string;
}

interface FriendSentListProps {
  searchQuery: string;
}

export function FriendSentList({ searchQuery }: FriendSentListProps) {
  const [sentRequests, setSentRequests] = useState<SentFriendRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSentRequests();
  }, []);

  const fetchSentRequests = async () => {
    try {
      const response = await fetch("/api/friends/requests/sent");
      if (!response.ok) throw new Error("Failed to fetch sent friend requests");
      const data = await response.json();
      setSentRequests(data.sentRequests);
    } catch (error) {
      console.error("Error fetching sent friend requests:", error);
      toast.error("Failed to load sent friend requests");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    try {
      const response = await fetch(`/api/friends/requests/${requestId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to cancel friend request");

      // Update local state
      setSentRequests((prevRequests) =>
        prevRequests.filter((request) => request.id !== requestId)
      );
      toast.success("Friend request canceled");
    } catch (error) {
      console.error("Error canceling friend request:", error);
      toast.error("Failed to cancel friend request");
    }
  };

  // Filter requests based on search query
  const filteredRequests = sentRequests.filter((request) =>
    `${request.receiver.firstName} ${request.receiver.lastName}`
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

  if (sentRequests.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No sent requests</h3>
        <p className="mt-1 text-sm text-gray-500">
          You haven't sent any friend requests that are still pending.
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
              {request.receiver.profileImage ? (
                <Image
                  src={request.receiver.profileImage}
                  alt={`${request.receiver.firstName}'s profile`}
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
                href={`/profile/${request.receiver.id}`}
                className="text-sm font-medium text-gray-900 hover:text-blue-600 truncate block"
              >
                {request.receiver.firstName} {request.receiver.lastName}
              </Link>
              <p className="text-sm text-gray-500 truncate">{request.receiver.email}</p>
              <p className="text-xs text-gray-400 mt-1">
                Sent {new Date(request.createdAt).toLocaleDateString()}
              </p>
              <div className="mt-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  <Clock className="mr-1 h-3 w-3" />
                  Pending
                </span>
              </div>
            </div>
            <div>
              <Button
                variant="ghost"
                size="icon"
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={() => handleCancelRequest(request.id)}
                title="Cancel request"
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