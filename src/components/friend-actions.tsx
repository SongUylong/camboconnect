import { Button } from "@/components/ui/button";
import { useFriendStore } from "@/store/use-friend-store";
import { toast } from "sonner";

interface FriendActionsProps {
  userId: string;
  className?: string;
}

export function FriendActions({ userId, className = "" }: FriendActionsProps) {
  const { 
    friendIds, 
    pendingRequestIds, 
    addFriend, 
    removeFriend, 
    addPendingRequest 
  } = useFriendStore();

  const handleSendFriendRequest = async () => {
    try {
      const response = await fetch("/api/friends/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ receiverId: userId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to send friend request");
      }

      addPendingRequest(userId);
      toast.success("Friend request sent successfully");
    } catch (error) {
      console.error("Error sending friend request:", error);
      toast.error(error instanceof Error ? error.message : "Failed to send friend request");
    }
  };

  const handleRemoveFriend = async () => {
    try {
      const response = await fetch(`/api/friends?friendId=${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to remove friend");
      }

      removeFriend(userId);
      toast.success("Friend removed successfully");
    } catch (error) {
      console.error("Error removing friend:", error);
      toast.error("Failed to remove friend");
    }
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      {!friendIds.has(userId) && !pendingRequestIds.has(userId) && (
        <Button onClick={handleSendFriendRequest}>
          Add Friend
        </Button>
      )}
      {pendingRequestIds.has(userId) && (
        <Button disabled variant="outline">
          Request Pending
        </Button>
      )}
      {friendIds.has(userId) && (
        <Button
          variant="outline"
          className="text-red-500 hover:text-red-600"
          onClick={handleRemoveFriend}
        >
          Remove Friend
        </Button>
      )}
    </div>
  );
} 