"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UserProfile, SocialLinks } from "@/types/user";
import { Loader2, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProfileSetupForm } from "@/components/forms/profile-setup-form";
import { useProfile, useUpdateProfile } from "@/hooks/use-profile";

interface APIProfile {
  bio: string | null;
  skillEntries: Array<{ id: string; name: string }>;
  educationEntries: Array<{
    id: string;
    school: string;
    degree: string;
    field: string;
    startDate: string;
    endDate?: string | null;
  }>;
  experienceEntries: Array<{
    id: string;
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate?: string | null;
    description: string;
  }>;
  socialLinks: Array<{
    id: string;
    platform: string;
    url: string;
  }>;
}

export default function ProfileSetupPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  
  // Define the steps for the setup process
  const steps = [
    { id: 'bio', title: 'Bio & Skills' },
    { id: 'education', title: 'Education' },
    { id: 'experience', title: 'Experience' },
    { id: 'links', title: 'Social Links' }
  ];

  // Use React Query hooks
  const { 
    data, 
    isLoading, 
    error 
  } = useProfile();
  
  const { 
    mutate: updateProfile, 
    isPending: submitting 
  } = useUpdateProfile();

  // Map API response to UserProfile format when data is available
  useEffect(() => {
    if (data) {
      // Type assertion for the API response
      const apiData = data as APIProfile;
      
      // Map the API response to the UserProfile format
      const profileData: UserProfile = {
        bio: apiData.bio || "",
        skills: apiData.skillEntries?.map(skill => skill.name) || [],
        education: apiData.educationEntries?.map(edu => ({
          id: edu.id,
          school: edu.school,
          degree: edu.degree,
          field: edu.field,
          startDate: edu.startDate,
          endDate: edu.endDate
        })) || [],
        experience: apiData.experienceEntries?.map(exp => ({
          id: exp.id,
          title: exp.title,
          company: exp.company,
          location: exp.location,
          startDate: exp.startDate,
          endDate: exp.endDate,
          description: exp.description || ""
        })) || [],
        links: apiData.socialLinks?.reduce((acc, link) => {
          const platform = link.platform.toLowerCase();
          if (link.url && ['portfolio', 'linkedin', 'github', 'twitter'].includes(platform)) {
            acc[platform as keyof SocialLinks] = link.url;
          }
          return acc;
        }, {} as SocialLinks) || {}
      };
      
      setProfile(profileData);
    }
  }, [data]);

  // Show error toast if profile fetch fails
  useEffect(() => {
    if (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile data");
    }
  }, [error]);

  const handleSubmit = async (data: UserProfile) => {
    try {
      console.log("Submitting profile data:", JSON.stringify(data, null, 2));
      
      // Ensure we have at least some data
      const hasData = 
        data.bio?.trim() || 
        (data.skills?.length ?? 0) > 0 || 
        (data.education?.length ?? 0) > 0 || 
        (data.experience?.length ?? 0) > 0 || 
        Object.values(data.links || {}).some(link => link && link.trim() !== '');
      
      if (!hasData) {
        console.warn("No data to submit - form is empty");
        toast.warning("Please add some information to your profile before submitting");
        return;
      }
      
      // Ensure we have valid arrays and objects even if they're empty
      const formattedData = {
        bio: data.bio || "",
        skills: Array.isArray(data.skills) ? data.skills : [],
        education: Array.isArray(data.education) ? data.education : [],
        experience: Array.isArray(data.experience) ? data.experience : [],
        links: data.links || {}
      };
      
      console.log("Formatted data for API:", formattedData);
      
      // Convert SocialLinks to Record<string, string> for the API
      const apiData = {
        ...formattedData,
        links: Object.entries(formattedData.links).reduce((acc, [key, value]) => {
          if (value) {
            acc[key] = value;
          }
          return acc;
        }, {} as Record<string, string>)
      };
      
      // Use React Query mutation to update profile
      updateProfile(apiData, {
        onSuccess: () => {
          toast.success("Profile setup completed successfully!");
          
          // Clear the welcome modal flag from localStorage
          localStorage.removeItem('welcomeModalShown');
          
          // Redirect to opportunities page
          router.push("/opportunities");
        },
        onError: (error: any) => {
          console.error("Error updating profile:", error);
          toast.error(error instanceof Error ? error.message : "Failed to update profile");
        }
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update profile");
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Reference to the form submit function
  const [formRef, setFormRef] = useState<{ submitForm: () => void } | null>(null);

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
          <h1 className="text-3xl font-bold text-gray-800">Set Up Your Profile</h1>
        </div>
        
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    index < currentStep 
                      ? 'bg-blue-600 border-blue-600 text-white' 
                      : index === currentStep 
                        ? 'border-blue-600 text-blue-600' 
                        : 'border-gray-300 text-gray-400'
                  }`}
                >
                  {index < currentStep ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <span className={`text-xs mt-2 ${
                  index <= currentStep ? 'text-blue-600 font-medium' : 'text-gray-500'
                }`}>
                  {step.title}
                </span>
              </div>
            ))}
          </div>
          <div className="relative mt-2">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200 rounded-full">
              <div 
                className="h-full bg-blue-600 rounded-full transition-all duration-300 ease-in-out"
                style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        {profile ? (
          <Card className="p-6 shadow-md border border-gray-200 bg-white">
            <ProfileSetupForm 
              profile={profile} 
              onSubmit={handleSubmit} 
              isSubmitting={submitting}
              currentStep={currentStep}
              totalSteps={steps.length}
              setFormRef={setFormRef}
            />
            
            <div className="flex justify-between mt-8 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0}
                className="flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              
              {currentStep < steps.length - 1 ? (
                <Button
                  onClick={nextStep}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center"
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    if (profile && formRef) {
                      console.log("Triggering form submission from Finish button");
                      formRef.submitForm();
                    } else {
                      console.error("Cannot submit form: profile or formRef is null");
                      toast.error("Something went wrong. Please try again.");
                    }
                  }}
                  disabled={submitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center"
                >
                  {submitting ? "Saving..." : "Finish"}
                  <Check className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </Card>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
            <p className="text-gray-600 mb-4">Failed to load profile data. Please try again later.</p>
            <Button 
              onClick={() => {
                // Implement the logic to retry fetching the profile
                console.log("Retrying to fetch profile");
              }}
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