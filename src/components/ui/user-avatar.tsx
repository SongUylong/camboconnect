"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "next-auth";
import { useState } from "react";
import { GoogleImage } from "./google-image";

interface UserAvatarProps {
  user: Pick<User, "name" | "image">;
  className?: string;
}

export function UserAvatar({ user, className }: UserAvatarProps) {
  const [imageError, setImageError] = useState(false);
  
  // For Google images, use a direct img tag with referrerPolicy
  if (user.image?.includes('googleusercontent.com') && !imageError) {
    return (
      <div className={`relative overflow-hidden rounded-full ${className}`}>
        <GoogleImage 
          src={user.image}
          alt={user.name || "User"}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  // For other images, use the Avatar component
  return (
    <Avatar className={className}>
      {!imageError && user.image ? (
        <AvatarImage
          src={user.image}
          alt={user.name || "User"}
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