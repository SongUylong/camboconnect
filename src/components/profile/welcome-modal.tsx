"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, UserCircle, ArrowRight, ArrowLeft, Check, X } from "lucide-react";
import { ProfileSetupForm } from "@/components/forms/profile-setup-form";
import { UserProfile as FormUserProfile } from "@/types/user";
import { UserProfile as ApiUserProfile } from "@/api/profile";
import { toast } from "sonner";
import { useProfile, useUpdateProfile, useUpdateSetupStatus } from "@/hooks/use-profile";

export function WelcomeModal() {
  // Basic state
  const [visible, setVisible] = useState(true);
  const [showSetupForm, setShowSetupForm] = useState(false);
  const [profile, setProfile] = useState<FormUserProfile | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [formRef, setFormRef] = useState<{ submitForm: () => void } | null>(null);
  
  // Use React Query hooks
  const { data: profileData, isLoading: profileLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const updateSetupStatus = useUpdateSetupStatus();
  
  // Check if we should render the modal based on isSetup
  useEffect(() => {
    if (profileData?.isSetup === true) {
      console.log("WelcomeModal: isSetup is true, not rendering modal");
      setVisible(false);
    }
  }, [profileData]);
  
  // Define the steps for the setup process
  const steps = [
    { id: 'bio', title: 'Bio & Skills' },
    { id: 'education', title: 'Education' },
    { id: 'experience', title: 'Experience' },
    { id: 'links', title: 'Social Links' }
  ];

  // Handle closing the modal
  const handleClose = useCallback(() => {
    console.log("Closing modal and updating isSetup to true");
    
    // First close the modal to ensure UI responsiveness
    setVisible(false);
    
    // Then update isSetup in the background
    if (profileData?.isSetup !== true) {
      updateSetupStatus.mutate(true, {
        onSuccess: (data) => {
          console.log("Successfully updated isSetup:", data);
        },
        onError: (error) => {
          console.error("Failed to update isSetup:", error);
          toast.error("Failed to update profile setup status. The welcome modal may appear again.");
        }
      });
    }
  }, [updateSetupStatus, profileData?.isSetup]);

  // Handle skip for now button click
  const handleSkipForNow = useCallback(() => {
    console.log("Skipping setup and updating isSetup to true");
    
    // First close the modal to ensure UI responsiveness
    setVisible(false);
    
    // Then update isSetup in the background
    if (profileData?.isSetup !== true) {
      updateSetupStatus.mutate(true, {
        onSuccess: (data) => {
          console.log("Successfully updated isSetup:", data);
        },
        onError: (error) => {
          console.error("Failed to update isSetup:", error);
          toast.error("Failed to update profile setup status. The welcome modal may appear again.");
        }
      });
    }
  }, [updateSetupStatus, profileData?.isSetup]);

  // Handle setup now button click
  const handleSetupNow = useCallback(() => {
    if (!profileData) {
      toast.error("Profile data is not available. Please try again later.");
      return;
    }
    
    // Create a new form profile object
    const formProfile: FormUserProfile = {
      bio: profileData.bio || "",
      skills: profileData.skills || [],
      education: profileData.education || [],
      experience: profileData.experience || [],
      links: profileData.links || {}
    };
    
    // Set the profile first
    setProfile(formProfile);
    
    // Then show the setup form in a separate state update
    setTimeout(() => {
      setShowSetupForm(true);
    }, 0);
  }, [profileData]);

  // Handle form submission
  const handleSubmit = useCallback(async (data: FormUserProfile) => {
    try {
      setSubmitting(true);
      
      // Ensure we have at least some data
      const hasData = 
        (data.bio?.trim() || "") !== "" || 
        (data.skills && data.skills.length > 0) || 
        (data.education && data.education.length > 0) || 
        (data.experience && data.experience.length > 0) || 
        Object.values(data.links || {}).some(link => link && link.trim() !== '');
      
      if (!hasData) {
        toast.warning("Please add some information to your profile before submitting");
        setSubmitting(false);
        return;
      }
      
      // Convert links to the format expected by the API
      const apiLinks: Record<string, string> = {};
      if (data.links) {
        Object.entries(data.links).forEach(([key, value]) => {
          if (value) {
            apiLinks[key] = value;
          }
        });
      }
      
      const apiProfileData: Partial<ApiUserProfile> = {
        bio: data.bio,
        skills: data.skills,
        education: data.education,
        experience: data.experience,
        links: apiLinks,
        isSetup: true
      };
      
      await updateProfile.mutateAsync(apiProfileData);
      
      toast.success("Profile setup completed successfully!");
      
      // Close the modal
      setVisible(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update profile");
    } finally {
      setSubmitting(false);
    }
  }, [updateProfile]);

  // Navigation functions
  const nextStep = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  }, [currentStep, steps.length]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  // If the modal is closed, don't render anything
  if (!visible) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div 
        className={`bg-white rounded-xl shadow-lg overflow-hidden max-w-md w-full ${showSetupForm ? 'max-w-3xl' : 'max-w-md'}`}
      >
        {!showSetupForm ? (
          <div className="relative">
            {/* Decorative header with gradient */}
            <div className="h-24 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
            
            <button 
              onClick={handleSkipForNow}
              className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full p-1"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
            
            <div className="px-6 pb-6">
              <div className="relative -mt-12 text-center">
                <div className="mx-auto bg-white p-3 rounded-full shadow-md mb-4 inline-block">
                  <UserCircle className="h-12 w-12 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Welcome to CamboConnect!</h2>
                <p className="text-gray-600 mt-2 max-w-sm mx-auto">
                  Your account has been created successfully. Now let's set up your profile to help you connect with the best opportunities.
                </p>
              </div>
              
              <div className="py-4">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-gray-900">Complete Your Profile</h4>
                      <p className="text-sm text-gray-600">Add your education, experience, and skills to stand out</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-gray-900">Get Personalized Opportunities</h4>
                      <p className="text-sm text-gray-600">We'll match you with opportunities based on your profile</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-gray-900">Connect with Organizations</h4>
                      <p className="text-sm text-gray-600">Build your network with leading organizations in Cambodia</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:justify-center gap-3 pt-2">
                <Button 
                  variant="outline" 
                  onClick={handleSkipForNow}
                  className="w-full sm:w-auto border-gray-300 hover:bg-gray-50 text-gray-700"
                >
                  Skip for Now
                </Button>
                <Button 
                  onClick={handleSetupNow}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center group"
                >
                  Set Up Now
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </div>
          </div>
        ) : profileLoading ? (
          <div className="text-center py-8 px-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your profile data...</p>
          </div>
        ) : !profile ? (
          <div className="text-center py-8 px-6">
            <div className="bg-red-100 text-red-600 p-4 rounded-lg mb-4 mx-auto max-w-md">
              <p className="text-gray-600 mb-4">Failed to load profile data. Please try again later.</p>
              <Button 
                onClick={() => setShowSetupForm(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Go Back
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSetupForm(false)}
                className="h-10 w-10 rounded-full hover:bg-gray-100"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Back to welcome</span>
              </Button>
              <h1 className="text-xl font-bold text-gray-800">Set Up Your Profile</h1>
              
              <button 
                onClick={handleClose}
                className="ml-auto text-gray-500 hover:bg-gray-100 rounded-full p-1"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Progress indicator */}
            <div className="flex justify-between mb-6">
              {steps.map((step, index) => (
                <div key={step.id} className="flex flex-col items-center">
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      index < currentStep 
                        ? 'bg-green-500 text-white' 
                        : index === currentStep 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {index < currentStep ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  <span className={`text-xs mt-1 ${
                    index === currentStep ? 'text-blue-600 font-medium' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </span>
                </div>
              ))}
            </div>
            
            {/* Only render the form if we have profile data */}
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
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0 || submitting}
                className={`${currentStep === 0 ? 'invisible' : 'visible'}`}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
              
              {currentStep < steps.length - 1 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={submitting}
                >
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={() => formRef?.submitForm()}
                  disabled={submitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      Complete Setup
                      <Check className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 