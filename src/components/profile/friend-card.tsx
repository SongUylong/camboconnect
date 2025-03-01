"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";
import { UserAvatar } from "@/components/ui/user-avatar";

interface FriendCardProps {
  friend: {
    id: string;
    name: string;
    image?: string;
    location?: string;
    role?: string;
    company?: string;
    connectionDate: Date;
  };
  onViewProfile: (id: string) => void;
  onMessage: (id: string) => void;
  onRemoveConnection: (id: string) => void;
}

export function FriendCard({
  friend,
  onViewProfile,
  onMessage,
  onRemoveConnection,
}: FriendCardProps) {
  return (
    <Card className="p-4">
      <div className="flex items-start gap-4">
        <UserAvatar user={friend} className="w-12 h-12" />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-medium truncate">{friend.name}</h3>
              {friend.role && friend.company && (
                <p className="text-sm text-muted-foreground truncate">
                  {friend.role} at {friend.company}
                </p>
              )}
              {friend.location && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">{friend.location}</span>
                </div>
              )}
            </div>
            <Badge variant="secondary" className="shrink-0">
              Connected {new Date(friend.connectionDate).toLocaleDateString()}
            </Badge>
          </div>
          <div className="flex gap-2 mt-4">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onViewProfile(friend.id)}
            >
              View Profile
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onMessage(friend.id)}
            >
              Message
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onRemoveConnection(friend.id)}
            >
              Remove
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
