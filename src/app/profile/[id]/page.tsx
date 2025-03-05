"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { User, Mail, MapPin, Calendar, Briefcase, Book } from "lucide-react";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImage?: string | null;
  bio?: string | null;
  privacyLevel: string;
  isFriend?: boolean;
  hasPendingRequest?: boolean;
}

interface ProfilePageProps {
  params: {
    id: string;
  };
}

export default function ProfilePage({ params }: ProfilePageProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) {
      router.push("/login");
      return;
    }

    fetchProfile();
  }, [session, params.id]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/api/users/${params.id}`);
      if (!response.ok) throw new Error("Failed to fetch profile");
      const data = await response.json();
      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSendFriendRequest = async () => {
    try {
      const response = await fetch("/api/friends/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ receiverId: params.id }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to send friend request");
      }

      setProfile((prev) => prev ? { ...prev, hasPendingRequest: true } : null);
      toast.success("Friend request sent successfully");
    } catch (error) {
      console.error("Error sending friend request:", error);
      toast.error(error instanceof Error ? error.message : "Failed to send friend request");
    }
  };

  const handleRemoveFriend = async () => {
    try {
      const response = await fetch(`/api/friends?friendId=${params.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to remove friend");

      setProfile((prev) => prev ? { ...prev, isFriend: false } : null);
      toast.success("Friend removed successfully");
    } catch (error) {
      console.error("Error removing friend:", error);
      toast.error("Failed to remove friend");
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto py-8 px-4">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!profile) {
    return (
      <MainLayout>
        <div className="container mx-auto py-8 px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Profile not found</h1>
            <p className="mt-2 text-gray-600">The user profile you're looking for doesn't exist.</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4">
        <Card className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Profile Image */}
            <div className="flex-shrink-0">
              <div className="h-32 w-32 rounded-full bg-gray-200 flex items-center justify-center">
                {profile.profileImage ? (
                  <img
                    src={profile.profileImage}
                    alt={`${profile.firstName}'s profile`}
                    className="h-32 w-32 rounded-full object-cover"
                  />
                ) : (
                  <User className="h-16 w-16 text-gray-400" />
                )}
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-grow">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {profile.firstName} {profile.lastName}
                  </h1>
                  <div className="mt-2 flex items-center text-gray-600">
                    <Mail className="h-4 w-4 mr-2" />
                    <span>{profile.email}</span>
                  </div>
                  {profile.bio && (
                    <p className="mt-4 text-gray-600">{profile.bio}</p>
                  )}
                </div>

                {/* Action Buttons */}
                {session?.user?.id !== params.id && (
                  <div className="flex gap-2">
                    {!profile.isFriend && !profile.hasPendingRequest && (
                      <Button onClick={handleSendFriendRequest}>
                        Add Friend
                      </Button>
                    )}
                    {profile.hasPendingRequest && (
                      <Button disabled variant="outline">
                        Request Pending
                      </Button>
                    )}
                    {profile.isFriend && (
                      <Button
                        variant="outline"
                        className="text-red-500 hover:text-red-600"
                        onClick={handleRemoveFriend}
                      >
                        Remove Friend
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Profile Tabs */}
        <div className="mt-8">
          <Tabs defaultValue="about" className="w-full">
            <TabsList>
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="education">Education</TabsTrigger>
              <TabsTrigger value="experience">Experience</TabsTrigger>
              <TabsTrigger value="skills">Skills</TabsTrigger>
            </TabsList>

            <TabsContent value="about" className="mt-6">
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">About</h2>
                <p className="text-gray-600">
                  {profile.bio || "No bio available."}
                </p>
              </Card>
            </TabsContent>

            <TabsContent value="education" className="mt-6">
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Education</h2>
                <p className="text-gray-600">Education details will be displayed here.</p>
              </Card>
            </TabsContent>

            <TabsContent value="experience" className="mt-6">
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Experience</h2>
                <p className="text-gray-600">Experience details will be displayed here.</p>
              </Card>
            </TabsContent>

            <TabsContent value="skills" className="mt-6">
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Skills</h2>
                <p className="text-gray-600">Skills will be displayed here.</p>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
} 