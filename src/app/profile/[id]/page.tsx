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
import { useFriendStore } from "@/store/use-friend-store";
import { FriendActions } from "@/components/friend-actions";

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  profileImage?: string | null;
  bio?: string | null;
  privacyLevel: string;
  isFriend?: boolean;
  hasPendingRequest?: boolean;
  education: Array<{
    id: string;
    school: string;
    degree: string;
    field: string;
    startDate: string;
    endDate?: string | null;
  }>;
  experience: Array<{
    id: string;
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate?: string | null;
    description: string;
  }>;
  skills: Array<{
    id: string;
    name: string;
  }>;
  socialLinks: Array<{
    id: string;
    platform: string;
    url: string;
  }>;
}

interface ProfilePageProps {
  params: {
    id: string;
  };
}

export default function ProfilePage({ params }: ProfilePageProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  const { 
    friendIds, 
    pendingRequestIds, 
    addFriend, 
    removeFriend, 
    addPendingRequest, 
    setInitialState 
  } = useFriendStore();

  useEffect(() => {
    // Only fetch profile if we have a session
    if (status === "authenticated") {
      fetchProfile();
    }
  }, [status, params.id]);

  useEffect(() => {
    if (profile) {
      // Initialize friend store with profile data
      setInitialState(
        profile.isFriend ? [profile.id] : [],
        profile.hasPendingRequest ? [profile.id] : []
      );
    }
  }, [profile, setInitialState]);

  // Show loading state while checking session
  if (status === "loading") {
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

  // Only redirect if we're sure there's no session
  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

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
                    referrerPolicy="no-referrer"
                    crossOrigin="anonymous"
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
                  <FriendActions userId={params.id} />
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
                {profile.education.length > 0 ? (
                  <div className="space-y-6">
                    {profile.education.map((edu) => (
                      <div key={edu.id} className="border-b pb-4 last:border-0 last:pb-0">
                        <h3 className="font-medium text-gray-900">{edu.school}</h3>
                        <p className="text-sm text-gray-600">{edu.degree} in {edu.field}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(edu.startDate).getFullYear()} - 
                          {edu.endDate ? new Date(edu.endDate).getFullYear() : 'Present'}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No education information available.</p>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="experience" className="mt-6">
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Experience</h2>
                {profile.experience.length > 0 ? (
                  <div className="space-y-6">
                    {profile.experience.map((exp) => (
                      <div key={exp.id} className="border-b pb-4 last:border-0 last:pb-0">
                        <h3 className="font-medium text-gray-900">{exp.title}</h3>
                        <p className="text-sm text-gray-600">{exp.company} • {exp.location}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(exp.startDate).getFullYear()} - 
                          {exp.endDate ? new Date(exp.endDate).getFullYear() : 'Present'}
                        </p>
                        <p className="mt-2 text-sm text-gray-600">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No experience information available.</p>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="skills" className="mt-6">
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Skills</h2>
                {profile.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill) => (
                      <span
                        key={skill.id}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {skill.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No skills listed.</p>
                )}
              </Card>
            </TabsContent>

            {/* Add Social Links section */}
            {profile.socialLinks.length > 0 && (
              <div className="mt-4 flex gap-4">
                {profile.socialLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    {link.platform}
                  </a>
                ))}
              </div>
            )}
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
} 