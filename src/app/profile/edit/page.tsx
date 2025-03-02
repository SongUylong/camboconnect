"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProfileForm } from "@/components/forms/profile-form";
import { toast } from "sonner";
import { UserProfile } from "@/types/user";
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function EditProfilePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/profile");
      
      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }
      
      const data = await response.json();
      
      // Map the API response to the UserProfile format
      const profileData: UserProfile = {
        bio: data.bio || "",
        // Map skill entries to array of strings
        skills: data.skillEntries?.map((skill: any) => skill.name) || [],
        // Map education entries to Education array
        education: data.educationEntries?.map((edu: any) => ({
          id: edu.id,
          school: edu.school,
          degree: edu.degree,
          field: edu.field,
          startDate: edu.startDate,
          endDate: edu.endDate
        })) || [],
        // Map experience entries to Experience array
        experience: data.experienceEntries?.map((exp: any) => ({
          id: exp.id,
          title: exp.title,
          company: exp.company,
          location: exp.location,
          startDate: exp.startDate,
          endDate: exp.endDate,
          description: exp.description || ""
        })) || [],
        // Map social links to SocialLinks object
        links: data.socialLinks?.reduce((acc: any, link: any) => {
          acc[link.platform.toLowerCase()] = link.url;
          return acc;
        }, {}) || {}
      };
      
      setProfile(profileData);
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: UserProfile) => {
    try {
      setSubmitting(true);
      
      // Send the complete data to the API
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || "Failed to update profile");
      }
      
      toast.success("Profile updated successfully");
      router.push("/profile");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update profile");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex justify-center w-full py-8 px-4">
      <div className="w-full max-w-3xl">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/profile")}
            className="h-10 w-10 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back to profile</span>
          </Button>
          <h1 className="text-3xl font-bold text-gray-800">Edit Profile</h1>
        </div>
        
        {profile ? (
          <ProfileForm 
            profile={profile} 
            onSubmit={handleSubmit} 
            isSubmitting={submitting} 
          />
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
            <p className="text-gray-600 mb-4">Failed to load profile data. Please try again later.</p>
            <Button 
              onClick={fetchProfile}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Retry
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
