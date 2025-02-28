"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { UserSettings } from "@/types/user";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

const settingsSchema = z.object({
  emailNotifications: z.object({
    opportunities: z.boolean(),
    messages: z.boolean(),
    applicationUpdates: z.boolean(),
    organizationUpdates: z.boolean(),
  }),
  privacy: z.object({
    showProfile: z.boolean(),
    showEmail: z.boolean(),
    showPhone: z.boolean(),
  }),
  theme: z.enum(["light", "dark", "system"]),
  language: z.string(),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

interface SettingsFormProps {
  initialData?: Partial<UserSettings>;
  onSubmit: (data: SettingsFormData) => Promise<void>;
}

export function SettingsForm({ initialData, onSubmit }: SettingsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      emailNotifications: {
        opportunities: initialData?.emailNotifications?.opportunities ?? true,
        messages: initialData?.emailNotifications?.messages ?? true,
        applicationUpdates: initialData?.emailNotifications?.applicationUpdates ?? true,
        organizationUpdates: initialData?.emailNotifications?.organizationUpdates ?? true,
      },
      privacy: {
        showProfile: initialData?.privacy?.showProfile ?? true,
        showEmail: initialData?.privacy?.showEmail ?? false,
        showPhone: initialData?.privacy?.showPhone ?? false,
      },
      theme: initialData?.theme || "system",
      language: initialData?.language || "en",
    },
  });

  const handleFormSubmit = async (data: SettingsFormData) => {
    try {
      setIsSubmitting(true);
      await onSubmit(data);
      toast.success("Settings updated successfully");
    } catch (error) {
      toast.error("Failed to update settings");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Email Notifications</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">New Opportunities</label>
            <Switch {...register("emailNotifications.opportunities")} />
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Messages</label>
            <Switch {...register("emailNotifications.messages")} />
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Application Updates</label>
            <Switch {...register("emailNotifications.applicationUpdates")} />
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Organization Updates</label>
            <Switch {...register("emailNotifications.organizationUpdates")} />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Privacy Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Show Profile</label>
            <Switch {...register("privacy.showProfile")} />
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Show Email</label>
            <Switch {...register("privacy.showEmail")} />
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Show Phone</label>
            <Switch {...register("privacy.showPhone")} />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Appearance</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Theme</label>
            <select
              {...register("theme")}
              className="w-full p-2 border rounded-md"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Language</label>
            <select
              {...register("language")}
              className="w-full p-2 border rounded-md"
            >
              <option value="en">English</option>
              <option value="km">Khmer</option>
            </select>
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </form>
  );
}
