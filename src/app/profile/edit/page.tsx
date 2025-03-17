"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProfileForm } from "@/components/forms/profile-form";
import { toast } from "sonner";
import { UserProfile } from "@/types/user";
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useProfile, useUpdateProfile } from "@/hooks/use-profile";

// Type for the API response
interface ProfileApiResponse {
  id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImage?: string | null;
  bio?: string | null;
  isSetup?: boolean;
  skillEntries?: Array<{ id: string; name: string }>;
  educationEntries?: Array<{
    id: string;
    school: string;
    degree: string;
    field: string;
    startDate: string | Date;
    endDate?: string | Date | null;
  }>;
  experienceEntries?: Array<{
    id: string;
    title: string;
    company: string;
    location: string;
    startDate: string | Date;
    endDate?: string | Date | null;
    description: string;
  }>;
  socialLinks?: Array<{
    id: string;
    platform: string;
    url: string;
  }>;
}

export default function EditProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  
  // Use React Query hooks
  const { data, isLoading, error } = useProfile<ProfileApiResponse>();
  const { mutate: updateProfile, isPending: submitting } = useUpdateProfile();

  useEffect(() => {
    if (data && !profile) {
      console.log('Raw API response:', data);
      // Map the API response to the UserProfile format
      const profileData: UserProfile = {
        bio: data.bio || "",
        // Map skill entries to array of strings
        skills: data.skillEntries?.map((skill: { name: string }) => skill.name) || [],
        // Map education entries to Education array
        education: data.educationEntries?.map((edu: {
          id: string;
          school: string;
          degree: string;
          field: string;
          startDate: string | Date;
          endDate?: string | Date | null;
        }) => ({
          id: edu.id,
          school: edu.school,
          degree: edu.degree,
          field: edu.field,
          startDate: edu.startDate,
          endDate: edu.endDate
        })) || [],
        // Map experience entries to Experience array
        experience: data.experienceEntries?.map((exp: {
          id: string;
          title: string;
          company: string;
          location: string;
          startDate: string | Date;
          endDate?: string | Date | null;
          description: string;
        }) => ({
          id: exp.id,
          title: exp.title,
          company: exp.company,
          location: exp.location,
          startDate: exp.startDate,
          endDate: exp.endDate,
          description: exp.description || ""
        })) || [],
        // Map social links to SocialLinks object
        links: data.socialLinks?.reduce((acc: Record<string, string>, link: { platform: string; url: string }) => {
          acc[link.platform.toLowerCase()] = link.url;
          return acc;
        }, {}) || {}
      };
      console.log('Mapped profile data:', profileData);
      
      setProfile(profileData);
    }
  }, [data, profile]);

  // Show error if profile fetch fails
  useEffect(() => {
    if (error) {
      toast.error("Failed to load profile data");
    }
  }, [error]);

  const handleSubmit = async (data: UserProfile) => {
    // Use React Query mutation to update profile
    updateProfile(data);
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Profile
        </Button>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Profile</h1>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
            <span className="ml-2 text-gray-600">Loading profile data...</span>
          </div>
        ) : profile ? (
          <ProfileForm 
            profile={profile} 
            onSubmit={handleSubmit} 
            isSubmitting={submitting}
          />
        ) : (
          <div className="text-center py-8 text-gray-500">
            Failed to load profile data. Please try again.
          </div>
        )}
      </div>
    </div>
  );
}
