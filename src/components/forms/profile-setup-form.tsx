"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { UserProfile, Education, Experience, SocialLinks } from "@/types/user";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2, GraduationCap, Briefcase, Link as LinkIcon } from "lucide-react";

// Reuse the same schemas from the profile form
const educationSchema = z.object({
  id: z.string().optional(),
  school: z.string().min(1, "School is required"),
  degree: z.string().min(1, "Degree is required"),
  field: z.string().min(1, "Field of study is required"),
  startDate: z.union([z.string(), z.date()]),
  endDate: z.union([z.string(), z.date(), z.null()]).optional(),
});

const experienceSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Job title is required"),
  company: z.string().min(1, "Company is required"),
  location: z.string().min(1, "Location is required"),
  startDate: z.union([z.string(), z.date()]),
  endDate: z.union([z.string(), z.date(), z.null()]).optional(),
  description: z.string().min(1, "Description is required"),
});

const linksSchema = z.object({
  portfolio: z.string().url().optional().or(z.literal('')),
  linkedin: z.string().url().optional().or(z.literal('')),
  github: z.string().url().optional().or(z.literal('')),
  twitter: z.string().url().optional().or(z.literal('')),
});

// Complete profile schema
const profileSchema = z.object({
  bio: z.string().optional(),
  skills: z.array(z.string()).default([]),
  education: z.array(educationSchema).default([]),
  experience: z.array(experienceSchema).default([]),
  links: linksSchema.default({}),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileSetupFormProps {
  profile: UserProfile;
  onSubmit: (data: ProfileFormData) => Promise<void>;
  isSubmitting: boolean;
  currentStep: number;
  totalSteps: number;
  setFormRef?: React.Dispatch<React.SetStateAction<{ submitForm: () => void } | null>>;
}

export function ProfileSetupForm({ 
  profile, 
  onSubmit, 
  isSubmitting, 
  currentStep, 
  totalSteps,
  setFormRef
}: ProfileSetupFormProps) {
  const [skillsInput, setSkillsInput] = useState("");

  // Convert Date objects to strings for form inputs
  const prepareFormData = (data: UserProfile): ProfileFormData => {
    return {
      bio: data.bio || "",
      skills: data.skills || [],
      education: data.education?.map(edu => ({
        ...edu,
        startDate: edu.startDate instanceof Date 
          ? edu.startDate.toISOString().split('T')[0] 
          : typeof edu.startDate === 'string' ? edu.startDate : '',
        endDate: edu.endDate instanceof Date 
          ? edu.endDate.toISOString().split('T')[0] 
          : typeof edu.endDate === 'string' ? edu.endDate : null,
      })) || [],
      experience: data.experience?.map(exp => ({
        ...exp,
        startDate: exp.startDate instanceof Date 
          ? exp.startDate.toISOString().split('T')[0] 
          : typeof exp.startDate === 'string' ? exp.startDate : '',
        endDate: exp.endDate instanceof Date 
          ? exp.endDate.toISOString().split('T')[0] 
          : typeof exp.endDate === 'string' ? exp.endDate : null,
      })) || [],
      links: data.links || {},
    };
  };

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: prepareFormData(profile),
    mode: "onChange"
  });

  // Log form errors for debugging
  useEffect(() => {
    console.log("Form errors:", errors);
  }, [errors]);

  const skills = watch("skills");

  const { fields: educationFields, append: appendEducation, remove: removeEducation } = 
    useFieldArray({
      control,
      name: "education",
    });

  const { fields: experienceFields, append: appendExperience, remove: removeExperience } = 
    useFieldArray({
      control,
      name: "experience",
    });

  const handleAddSkill = () => {
    if (skillsInput.trim()) {
      const newSkills = [...skills, skillsInput.trim()];
      setValue("skills", newSkills, { shouldDirty: true, shouldValidate: true });
      setSkillsInput("");
    }
  };

  const handleRemoveSkill = (index: number) => {
    const newSkills = [...skills];
    newSkills.splice(index, 1);
    setValue("skills", newSkills, { shouldDirty: true, shouldValidate: true });
  };

  const handleFormSubmit = async (data: ProfileFormData) => {
    try {
      console.log("Form submission data:", JSON.stringify(data, null, 2));
      
      // Validate that we have at least some data before submitting
      const hasData = 
        data.bio?.trim() || 
        data.skills?.length > 0 || 
        data.education?.length > 0 || 
        data.experience?.length > 0 || 
        Object.values(data.links || {}).some(link => link && link.trim() !== '');
      
      if (!hasData) {
        console.warn("No data to submit - form is empty");
      }
      
      // Ensure we have valid arrays and objects even if they're empty
      const formattedData = {
        ...data,
        bio: data.bio || "",
        skills: Array.isArray(data.skills) ? data.skills : [],
        education: Array.isArray(data.education) ? data.education : [],
        experience: Array.isArray(data.experience) ? data.experience : [],
        links: data.links || {}
      };
      
      // Log the exact data being sent to the API
      console.log("Sending to API:", formattedData);
      
      await onSubmit(formattedData);
    } catch (error) {
      console.error("Error in form submission:", error);
    }
  };

  // Expose the form submission function to the parent component
  useEffect(() => {
    if (setFormRef) {
      setFormRef({
        submitForm: () => {
          console.log("Form submission triggered from parent component");
          // Get the current form values
          const formValues = {
            bio: watch("bio") || "",
            skills: watch("skills") || [],
            education: watch("education") || [],
            experience: watch("experience") || [],
            links: watch("links") || {}
          };
          
          console.log("Current form values:", formValues);
          
          // Submit the form with the current values
          onSubmit(formValues);
        }
      });
    }
  }, [setFormRef, watch, onSubmit]);

  // Add a key press handler for the skills input
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  // Render different form sections based on the current step
  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Bio & Skills
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Tell us about yourself</h3>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Bio</label>
              <textarea
                {...register("bio")}
                className="w-full min-h-[120px] p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="Tell us about yourself..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Skills</label>
              <div className="flex gap-2">
                <Input
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Add a skill"
                  className="flex-1 h-10 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <Button 
                  type="button" 
                  onClick={handleAddSkill}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Add
                </Button>
              </div>
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {skills.map((skill, index) => (
                    <div key={index} className="bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full flex items-center text-sm">
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(index)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                        aria-label={`Remove ${skill}`}
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {errors.skills && (
                <p className="text-red-500 text-sm mt-2">{errors.skills.message}</p>
              )}
            </div>
          </div>
        );
      
      case 1: // Education
        return (
          <div className="space-y-6">
            <div className="flex items-center mb-4">
              <GraduationCap className="h-5 w-5 text-blue-600 mr-2" />
              <h3 className="text-xl font-semibold text-gray-800">Education</h3>
            </div>
            
            {educationFields.length === 0 && (
              <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-md mb-4">
                <p>No education entries yet. Add your educational background.</p>
              </div>
            )}
            
            {educationFields.map((field, index) => (
              <div key={field.id} className="space-y-4 mb-6 p-5 border border-gray-200 rounded-md bg-gray-50 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">School/University</label>
                    <Input
                      {...register(`education.${index}.school`)}
                      placeholder="School or University name"
                      className="border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {errors.education?.[index]?.school && (
                      <p className="text-red-500 text-xs mt-1">{errors.education[index]?.school?.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Degree</label>
                    <Input
                      {...register(`education.${index}.degree`)}
                      placeholder="Bachelor's, Master's, etc."
                      className="border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {errors.education?.[index]?.degree && (
                      <p className="text-red-500 text-xs mt-1">{errors.education[index]?.degree?.message}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Field of Study</label>
                  <Input
                    {...register(`education.${index}.field`)}
                    placeholder="Computer Science, Business, etc."
                    className="border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {errors.education?.[index]?.field && (
                    <p className="text-red-500 text-xs mt-1">{errors.education[index]?.field?.message}</p>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Start Date</label>
                    <Input
                      type="date"
                      {...register(`education.${index}.startDate`)}
                      className="border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {errors.education?.[index]?.startDate && (
                      <p className="text-red-500 text-xs mt-1">{errors.education[index]?.startDate?.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">End Date (Optional)</label>
                    <Input
                      type="date"
                      {...register(`education.${index}.endDate`)}
                      className="border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => removeEducation(index)}
                  className="mt-2 flex items-center"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove Education
                </Button>
              </div>
            ))}
            
            <Button
              type="button"
              onClick={() => appendEducation({
                school: "",
                degree: "",
                field: "",
                startDate: new Date().toISOString().split('T')[0],
                endDate: "",
              })}
              className="mt-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Education
            </Button>
          </div>
        );
      
      case 2: // Experience
        return (
          <div className="space-y-6">
            <div className="flex items-center mb-4">
              <Briefcase className="h-5 w-5 text-blue-600 mr-2" />
              <h3 className="text-xl font-semibold text-gray-800">Experience</h3>
            </div>
            
            {experienceFields.length === 0 && (
              <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-md mb-4">
                <p>No experience entries yet. Add your work experience.</p>
              </div>
            )}
            
            {experienceFields.map((field, index) => (
              <div key={field.id} className="space-y-4 mb-6 p-5 border border-gray-200 rounded-md bg-gray-50 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Job Title</label>
                    <Input
                      {...register(`experience.${index}.title`)}
                      placeholder="Software Engineer, Project Manager, etc."
                      className="border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {errors.experience?.[index]?.title && (
                      <p className="text-red-500 text-xs mt-1">{errors.experience[index]?.title?.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Company</label>
                    <Input
                      {...register(`experience.${index}.company`)}
                      placeholder="Company name"
                      className="border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {errors.experience?.[index]?.company && (
                      <p className="text-red-500 text-xs mt-1">{errors.experience[index]?.company?.message}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Location</label>
                  <Input
                    {...register(`experience.${index}.location`)}
                    placeholder="City, Country"
                    className="border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {errors.experience?.[index]?.location && (
                    <p className="text-red-500 text-xs mt-1">{errors.experience[index]?.location?.message}</p>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Start Date</label>
                    <Input
                      type="date"
                      {...register(`experience.${index}.startDate`)}
                      className="border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {errors.experience?.[index]?.startDate && (
                      <p className="text-red-500 text-xs mt-1">{errors.experience[index]?.startDate?.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">End Date (Optional)</label>
                    <Input
                      type="date"
                      {...register(`experience.${index}.endDate`)}
                      className="border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Description</label>
                  <textarea
                    {...register(`experience.${index}.description`)}
                    className="w-full min-h-[100px] p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Describe your responsibilities and achievements"
                  />
                  {errors.experience?.[index]?.description && (
                    <p className="text-red-500 text-xs mt-1">{errors.experience[index]?.description?.message}</p>
                  )}
                </div>
                
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => removeExperience(index)}
                  className="mt-2 flex items-center"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove Experience
                </Button>
              </div>
            ))}
            
            <Button
              type="button"
              onClick={() => appendExperience({
                title: "",
                company: "",
                location: "",
                startDate: new Date().toISOString().split('T')[0],
                description: "",
                endDate: "",
              })}
              className="mt-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Experience
            </Button>
          </div>
        );
      
      case 3: // Social Links
        return (
          <div className="space-y-6">
            <div className="flex items-center mb-4">
              <LinkIcon className="h-5 w-5 text-blue-600 mr-2" />
              <h3 className="text-xl font-semibold text-gray-800">Social Links</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Portfolio Website</label>
                <Input
                  {...register("links.portfolio")}
                  placeholder="https://yourportfolio.com"
                  className="border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.links?.portfolio && (
                  <p className="text-red-500 text-xs mt-1">{errors.links.portfolio.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">LinkedIn</label>
                <Input
                  {...register("links.linkedin")}
                  placeholder="https://linkedin.com/in/yourusername"
                  className="border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.links?.linkedin && (
                  <p className="text-red-500 text-xs mt-1">{errors.links.linkedin.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">GitHub</label>
                <Input
                  {...register("links.github")}
                  placeholder="https://github.com/yourusername"
                  className="border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.links?.github && (
                  <p className="text-red-500 text-xs mt-1">{errors.links.github.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Twitter</label>
                <Input
                  {...register("links.twitter")}
                  placeholder="https://twitter.com/yourusername"
                  className="border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.links?.twitter && (
                  <p className="text-red-500 text-xs mt-1">{errors.links.twitter.message}</p>
                )}
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {renderStepContent()}
      
      {/* Hidden submit button that will be triggered programmatically - removed to avoid duplication */}
    </form>
  );
} 