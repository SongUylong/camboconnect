"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "next-auth";
import { useState } from "react";

interface UserAvatarProps {
  user: Pick<User, "name" | "image">;
  className?: string;
}

export function UserAvatar({ user, className }: UserAvatarProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <Avatar className={className}>
      {!imageError && user.image ? (
        <AvatarImage
          src={user.image}
          alt={user.name || "User"}
          referrerPolicy="no-referrer"
          onError={() => setImageError(true)}
        />
      ) : (
        <AvatarFallback>
          {user.name ? user.name[0].toUpperCase() : "U"}
        </AvatarFallback>
      )}
    </Avatar>
  );
} 