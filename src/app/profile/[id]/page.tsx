"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { User, Mail, MapPin, Calendar, Briefcase, Book, Users } from "lucide-react";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useFriendStore } from "@/store/use-friend-store";
import { FriendActions } from "@/components/friend-actions";
import Image from "next/image";
import { UserParticipationsList } from "@/components/profile/user-participations-list";

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
  participations?: Array<{
    id: string;
    year: number;
    isPublic: boolean;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      profileImage: string | null;
      privacyLevel: string;
    };
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
  const [participations, setParticipations] = useState([]);
  
  const { setInitialState } = useFriendStore();

  useEffect(() => {
    if (status === "authenticated") {
      fetchProfile();
      fetchParticipations();
    }
  }, [status, params.id]);

  useEffect(() => {
    if (profile) {
      setInitialState(
        profile.isFriend ? [profile.id] : [],
        profile.hasPendingRequest ? [profile.id] : []
      );
    }
  }, [profile, setInitialState]);

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

  const fetchParticipations = async () => {
    try {
      const response = await fetch(`/api/users/${params.id}/participations`);
      if (!response.ok) throw new Error("Failed to fetch participations");
      const data = await response.json();
      setParticipations(data.participations);
    } catch (error) {
      console.error("Error fetching participations:", error);
    }
  };

  // Helper function to get profile image URL
  const getProfileImageUrl = (profileImage: string | null) => {
    if (!profileImage) return null;
    if (profileImage.startsWith('http')) return profileImage;
    return `${process.env.NEXT_PUBLIC_API_URL}${profileImage}`;
  };

  if (status === "loading" || loading) {
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

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
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
        {/* Profile Header */}
        <Card className="p-6 mb-8">
          <div className="flex flex-col md:flex-row items-start gap-6">
            {/* Profile Image */}
            <div className="flex-shrink-0">
              <div className="relative h-32 w-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {profile.profileImage ? (
                  <Image
                    src={getProfileImageUrl(profile.profileImage) || '/default-avatar.png'}
                    alt={`${profile.firstName}'s profile`}
                    fill
                    className="object-cover"
                    sizes="128px"
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
                  {profile.email && (
                    <div className="mt-2 flex items-center text-gray-600">
                      <Mail className="h-4 w-4 mr-2" />
                      <span>{profile.email}</span>
                    </div>
                  )}
                  {profile.bio && (
                    <p className="mt-4 text-gray-600 max-w-2xl">{profile.bio}</p>
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

        {/* Profile Content */}
        <Tabs defaultValue="about" className="space-y-6">
          <TabsList className="bg-white border-b border-gray-200 w-full justify-start rounded-none p-0 h-auto">
            <TabsTrigger value="about" className="data-[state=active]:border-primary border-b-2 border-transparent">About</TabsTrigger>
            <TabsTrigger value="education" className="data-[state=active]:border-primary border-b-2 border-transparent">Education</TabsTrigger>
            <TabsTrigger value="experience" className="data-[state=active]:border-primary border-b-2 border-transparent">Experience</TabsTrigger>
            <TabsTrigger value="skills" className="data-[state=active]:border-primary border-b-2 border-transparent">Skills</TabsTrigger>
            <TabsTrigger value="participations" className="data-[state=active]:border-primary border-b-2 border-transparent">
              <Users className="h-4 w-4 mr-2" />
              Participations
            </TabsTrigger>
          </TabsList>

          <TabsContent value="about">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">About</h2>
              <p className="text-gray-600">
                {profile.bio || "No bio available."}
              </p>
            </Card>
          </TabsContent>

          <TabsContent value="education">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Education</h2>
              {profile.education.length > 0 ? (
                <div className="space-y-6">
                  {profile.education.map((edu) => (
                    <div key={edu.id} className="flex gap-4 pb-6 border-b last:border-0">
                      <div className="flex-shrink-0">
                        <Book className="h-6 w-6 text-gray-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{edu.school}</h3>
                        <p className="text-sm text-gray-600">{edu.degree} in {edu.field}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(edu.startDate).getFullYear()} - 
                          {edu.endDate ? new Date(edu.endDate).getFullYear() : 'Present'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No education information available.</p>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="experience">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Experience</h2>
              {profile.experience.length > 0 ? (
                <div className="space-y-6">
                  {profile.experience.map((exp) => (
                    <div key={exp.id} className="flex gap-4 pb-6 border-b last:border-0">
                      <div className="flex-shrink-0">
                        <Briefcase className="h-6 w-6 text-gray-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{exp.title}</h3>
                        <p className="text-sm text-gray-600">{exp.company} • {exp.location}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(exp.startDate).getFullYear()} - 
                          {exp.endDate ? new Date(exp.endDate).getFullYear() : 'Present'}
                        </p>
                        <p className="mt-2 text-sm text-gray-600">{exp.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No experience information available.</p>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="skills">
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

          <TabsContent value="participations">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Participation History</h2>
              <UserParticipationsList participations={participations} />
            </Card>
          </TabsContent>
        </Tabs>

        {/* Social Links */}
        {profile.socialLinks.length > 0 && (
          <Card className="mt-6 p-6">
            <h2 className="text-lg font-semibold mb-4">Social Links</h2>
            <div className="flex gap-4">
              {profile.socialLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-2"
                >
                  {link.platform}
                </a>
              ))}
            </div>
          </Card>
        )}
      </div>
    </MainLayout>
  );
} 