"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProfileForm } from "@/components/forms/profile-form";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

export default function EditProfilePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  const handleSubmit = async (data) => {
    try {
      // API call to update profile
      await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      toast.success("Profile updated successfully");
      router.push("/profile");
    } catch (error) {
      toast.error("Failed to update profile");
      console.error(error);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>
        <Card className="p-6">
          {isLoading ? (
            <div className="text-center py-8">Loading profile...</div>
          ) : (
            <ProfileForm
              initialData={profile}
              onSubmit={handleSubmit}
            />
          )}
        </Card>
      </div>
    </div>
  );
}
