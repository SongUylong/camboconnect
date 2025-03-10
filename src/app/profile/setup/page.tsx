"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UserProfile } from "@/types/user";
import { Loader2, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProfileSetupForm } from "@/components/forms/profile-setup-form";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { LoadingOverlay } from "@/components/ui/loading-overlay";

export default function ProfileSetupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  
  // Define the steps for the setup process
  const steps = [
    { id: 'bio', title: 'Bio & Skills' },
    { id: 'education', title: 'Education' },
    { id: 'experience', title: 'Experience' },
    { id: 'links', title: 'Social Links' }
  ];

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
        skills: data.skillEntries?.map((skill: any) => skill.name) || [],
        education: data.educationEntries?.map((edu: any) => ({
          id: edu.id,
          school: edu.school,
          degree: edu.degree,
          field: edu.field,
          startDate: edu.startDate,
          endDate: edu.endDate
        })) || [],
        experience: data.experienceEntries?.map((exp: any) => ({
          id: exp.id,
          title: exp.title,
          company: exp.company,
          location: exp.location,
          startDate: exp.startDate,
          endDate: exp.endDate,
          description: exp.description || ""
        })) || [],
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
      console.log("Submitting profile data:", JSON.stringify(data, null, 2));
      
      // Ensure we have at least some data
      const hasData = 
        data.bio?.trim() || 
        data.skills?.length > 0 || 
        data.education?.length > 0 || 
        data.experience?.length > 0 || 
        Object.values(data.links || {}).some(link => link && link.trim() !== '');
      
      if (!hasData) {
        console.warn("No data to submit - form is empty");
        toast.warning("Please add some information to your profile before submitting");
        setSubmitting(false);
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
      
      // Send the complete data to the API
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedData),
      });
      
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to update profile");
      }
      
      const result = await response.json();
      console.log("Profile update response:", result);
      
      toast.success("Profile setup completed successfully!");
      
      // Clear the welcome modal flag from localStorage
      localStorage.removeItem('welcomeModalShown');
      
      // Redirect to opportunities page
      router.push("/opportunities");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update profile");
    } finally {
      setSubmitting(false);
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
        <LoadingSpinner size="lg" text="Loading your profile..." />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Failed to load profile data. Please try again.</p>
          <Button onClick={fetchProfile} variant="outline">Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center w-full py-8 px-4">
      {submitting && <LoadingOverlay text="Saving your profile..." />}
      <Card className="w-full max-w-2xl p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Complete Your Profile</h1>
          <p className="text-gray-600 mt-2">Tell us more about yourself to get started.</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center ${
                  index < steps.length - 1 ? "flex-1" : ""
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    index <= currentStep
                      ? "bg-primary text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {index < currentStep ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    index + 1
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      index < currentStep ? "bg-primary" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`text-sm ${
                  index <= currentStep ? "text-primary" : "text-gray-500"
                }`}
              >
                {step.title}
              </div>
            ))}
          </div>
        </div>

        <ProfileSetupForm
          profile={profile}
          onSubmit={handleSubmit}
          isSubmitting={submitting}
          currentStep={currentStep}
          totalSteps={steps.length}
          setFormRef={setFormRef}
        />

        <div className="flex justify-between mt-6 pt-4 border-t">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          <Button
            onClick={() => formRef?.submitForm()}
            disabled={submitting}
            className="flex items-center"
          >
            {currentStep === steps.length - 1 ? (
              <>
                Complete Setup
                <Check className="w-4 h-4 ml-2" />
              </>
            ) : (
              <>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
} 