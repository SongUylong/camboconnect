"use client";

import { UserProfile } from "@/types/user";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Mail, Phone, Link as LinkIcon } from "lucide-react";
import { UserAvatar } from "@/components/ui/user-avatar";

interface ProfileHeaderProps {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
    phone?: string;
    location?: string;
  };
  profile: UserProfile;
  isOwnProfile?: boolean;
  onEditProfile?: () => void;
  onConnect?: () => void;
  onMessage?: () => void;
}

export function ProfileHeader({
  user,
  profile,
  isOwnProfile = false,
  onEditProfile,
  onConnect,
  onMessage,
}: ProfileHeaderProps) {
  return (
    <Card className="p-6">
      <div className="flex items-start gap-6">
        <UserAvatar user={user} className="w-24 h-24" />
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold">{user.name}</h1>
              {user.location && (
                <div className="flex items-center gap-1 text-muted-foreground mt-1">
                  <MapPin className="w-4 h-4" />
                  <span>{user.location}</span>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              {isOwnProfile ? (
                <Button onClick={onEditProfile} variant="outline">
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button onClick={onConnect} variant="outline">
                    Connect
                  </Button>
                  <Button onClick={onMessage}>Message</Button>
                </>
              )}
            </div>
          </div>

          {profile.bio && (
            <p className="mt-4 text-muted-foreground">{profile.bio}</p>
          )}

          {profile.skills?.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 grid grid-cols-2 gap-4">
            {user.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <a href={`mailto:${user.email}`} className="hover:underline">
                  {user.email}
                </a>
              </div>
            )}
            {user.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <a href={`tel:${user.phone}`} className="hover:underline">
                  {user.phone}
                </a>
              </div>
            )}
            {profile.links && Object.entries(profile.links).map(([key, value]) => (
              value && (
                <div key={key} className="flex items-center gap-2 text-sm">
                  <LinkIcon className="w-4 h-4 text-muted-foreground" />
                  <a
                    href={value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </a>
                </div>
              )
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
