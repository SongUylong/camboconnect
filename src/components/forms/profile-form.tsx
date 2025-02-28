"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { UserProfile } from "@/types/user";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { toast } from "sonner";

const educationSchema = z.object({
  school: z.string().min(1, "School is required"),
  degree: z.string().min(1, "Degree is required"),
  field: z.string().min(1, "Field of study is required"),
  startDate: z.date(),
  endDate: z.date().optional(),
});

const experienceSchema = z.object({
  title: z.string().min(1, "Job title is required"),
  company: z.string().min(1, "Company is required"),
  location: z.string().min(1, "Location is required"),
  startDate: z.date(),
  endDate: z.date().optional(),
  description: z.string().min(1, "Description is required"),
});

const profileSchema = z.object({
  bio: z.string().optional(),
  skills: z.array(z.string()).min(1, "At least one skill is required"),
  education: z.array(educationSchema),
  experience: z.array(experienceSchema),
  links: z.object({
    portfolio: z.string().url().optional(),
    linkedin: z.string().url().optional(),
    github: z.string().url().optional(),
    twitter: z.string().url().optional(),
  }).optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  initialData?: Partial<UserProfile>;
  onSubmit: (data: ProfileFormData) => Promise<void>;
}

export function ProfileForm({ initialData, onSubmit }: ProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      bio: initialData?.bio || "",
      skills: initialData?.skills || [],
      education: initialData?.education || [],
      experience: initialData?.experience || [],
      links: initialData?.links || {},
    },
  });

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

  const handleFormSubmit = async (data: ProfileFormData) => {
    try {
      setIsSubmitting(true);
      await onSubmit(data);
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Bio</label>
            <textarea
              {...register("bio")}
              className="w-full min-h-[100px] p-2 border rounded-md"
              placeholder="Tell us about yourself..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Skills</label>
            <Input
              {...register("skills")}
              placeholder="Add skills (comma separated)"
            />
            {errors.skills && (
              <p className="text-red-500 text-sm mt-1">{errors.skills.message}</p>
            )}
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Education</h3>
        {educationFields.map((field, index) => (
          <div key={field.id} className="space-y-4 mb-6 p-4 border rounded-md">
            <Input
              {...register(`education.${index}.school`)}
              placeholder="School"
            />
            <Input
              {...register(`education.${index}.degree`)}
              placeholder="Degree"
            />
            <Input
              {...register(`education.${index}.field`)}
              placeholder="Field of Study"
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="date"
                {...register(`education.${index}.startDate`)}
              />
              <Input
                type="date"
                {...register(`education.${index}.endDate`)}
              />
            </div>
            <Button
              type="button"
              variant="destructive"
              onClick={() => removeEducation(index)}
            >
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
            startDate: new Date(),
          })}
        >
          Add Education
        </Button>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Experience</h3>
        {experienceFields.map((field, index) => (
          <div key={field.id} className="space-y-4 mb-6 p-4 border rounded-md">
            <Input
              {...register(`experience.${index}.title`)}
              placeholder="Job Title"
            />
            <Input
              {...register(`experience.${index}.company`)}
              placeholder="Company"
            />
            <Input
              {...register(`experience.${index}.location`)}
              placeholder="Location"
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="date"
                {...register(`experience.${index}.startDate`)}
              />
              <Input
                type="date"
                {...register(`experience.${index}.endDate`)}
              />
            </div>
            <textarea
              {...register(`experience.${index}.description`)}
              className="w-full min-h-[100px] p-2 border rounded-md"
              placeholder="Job Description"
            />
            <Button
              type="button"
              variant="destructive"
              onClick={() => removeExperience(index)}
            >
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
            startDate: new Date(),
            description: "",
          })}
        >
          Add Experience
        </Button>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Social Links</h3>
        <div className="space-y-4">
          <Input
            {...register("links.portfolio")}
            placeholder="Portfolio URL"
          />
          <Input
            {...register("links.linkedin")}
            placeholder="LinkedIn URL"
          />
          <Input
            {...register("links.github")}
            placeholder="GitHub URL"
          />
          <Input
            {...register("links.twitter")}
            placeholder="Twitter URL"
          />
        </div>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Profile"}
        </Button>
      </div>
    </form>
  );
}
