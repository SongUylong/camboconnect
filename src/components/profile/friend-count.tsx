"use client";

import { useState, useEffect } from "react";
import { useFriendStore } from "@/store/use-friend-store";

interface FriendCountProps {
  initialCount: number;
}

export function FriendCount({ initialCount }: FriendCountProps) {
  const { friendIds } = useFriendStore();
  const [count, setCount] = useState(initialCount);

  // Update the count when the friend store changes
  useEffect(() => {
    // If the friendIds set is initialized (not empty), use its size
    // Otherwise, keep using the initialCount from the server
    if (friendIds.size > 0) {
      setCount(friendIds.size);
    }
  }, [friendIds, initialCount]);

  return (
    <div className="flex flex-col items-center">
      <span className="font-medium text-gray-900">{count}</span>
      <span className="text-gray-500">Friends</span>
    </div>
  );
} 