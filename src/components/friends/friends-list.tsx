"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, UserX } from "lucide-react";
import Image from "next/image";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useFriendStore } from "@/store/use-friend-store";

interface Friend {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImage?: string | null;
  bio?: string;
}

interface FriendsListProps {
  searchQuery: string;
}

export function FriendsList({ searchQuery }: FriendsListProps) {
  const router = useRouter();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const { removeFriend } = useFriendStore();

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    try {
      const response = await fetch("/api/friends");
      if (!response.ok) throw new Error("Failed to fetch friends");
      const data = await response.json();
      setFriends(data.friends);
    } catch (error) {
      console.error("Error fetching friends:", error);
      toast.error("Failed to load friends");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFriend = async (friendId: string) => {
    try {
      const response = await fetch(`/api/friends?friendId=${friendId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to remove friend");

      // Update local state
      setFriends((prevFriends) => prevFriends.filter((friend) => friend.id !== friendId));
      // Update friend store
      removeFriend(friendId);
      toast.success("Friend removed successfully");
    } catch (error) {
      console.error("Error removing friend:", error);
      toast.error("Failed to remove friend");
    }
  };

  // Filter friends based on search query
  const filteredFriends = friends.filter((friend) =>
    `${friend.firstName} ${friend.lastName}`
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

  if (friends.length === 0) {
    return (
      <div className="text-center py-8">
        <User className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No friends yet</h3>
        <p className="mt-1 text-sm text-gray-500">
          Start connecting with other users to build your network.
        </p>
      </div>
    );
  }

  if (filteredFriends.length === 0) {
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
      {filteredFriends.map((friend) => (
        <Card key={friend.id} className="p-6 hover:shadow-md transition-shadow">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                {friend.profileImage ? (
                  <Image
                    src={friend.profileImage}
                    alt={`${friend.firstName}'s profile`}
                    className="h-16 w-16 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                    width={64}
                    height={64}
                  />
                ) : (
                  <User className="h-8 w-8 text-gray-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <Link
                  href={`/profile/${friend.id}`}
                  className="text-lg font-semibold text-gray-900 hover:text-blue-600 truncate block"
                >
                  {friend.firstName} {friend.lastName}
                </Link>
                <p className="text-sm text-gray-500 truncate">{friend.email}</p>
              </div>
            </div>
            
            {friend.bio && (
              <p className="text-sm text-gray-600 line-clamp-2">{friend.bio}</p>
            )}

            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
              <Link
                href={`/profile/${friend.id}`}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                View Profile
              </Link>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-red-500"
                  >
                    <UserX className="h-5 w-5" />
                    <span className="sr-only">Remove friend</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remove Friend</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to remove {friend.firstName} {friend.lastName} from your friends list? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-red-500 hover:bg-red-600"
                      onClick={() => handleRemoveFriend(friend.id)}
                    >
                      Remove
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
} 