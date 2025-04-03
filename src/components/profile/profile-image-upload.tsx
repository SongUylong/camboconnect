"use client";

import { useState, useRef } from "react";
import { User } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { useUpdateProfile } from "@/hooks/use-profile";
import { Spinner } from "@/components/ui/spinner";
import { useSession } from "next-auth/react";

interface ProfileImageUploadProps {
  currentImage: string | null;
  userId: string;
}

export default function ProfileImageUpload({ currentImage, userId }: ProfileImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(currentImage);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const updateProfile = useUpdateProfile();
  const { update: updateSession } = useSession();

  // Handle file selection
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5MB");
      return;
    }

    setIsUploading(true);

    try {
      // Create a local preview of the image
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Create form data for upload
      const formData = new FormData();
      formData.append("image", file);

      // Upload the image
      const response = await fetch(`/api/profile/image`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to upload image");
      }

      const data = await response.json();
      
      // Update profile with new image URL
      updateProfile.mutate({ 
        profileImage: data.imageUrl 
      });
      
      // Update the session with the new image URL
      await updateSession({
        user: {
          image: data.imageUrl,
        }
      });
      
      toast.success("Profile image updated successfully");
    } catch (error) {
      toast.error("Failed to update profile image");
      // Reset preview to original image
      setPreviewImage(currentImage);
    } finally {
      setIsUploading(false);
    }
  };

  // Trigger file input click
  const triggerFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div 
      className="relative cursor-pointer group h-full w-full"
      onClick={triggerFileUpload}
      title="Change profile picture"
    >
      <div className="relative h-full w-full rounded-full overflow-hidden">
        {previewImage ? (
          <Image
            src={previewImage}
            alt="Profile"
            fill
            className="object-cover"
          />
        ) : (
          <div className="h-full w-full bg-gray-200 flex items-center justify-center">
            <User className="h-1/2 w-1/2 text-gray-400" />
          </div>
        )}
        
        {/* Overlay that appears on hover */}
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-white text-sm font-medium">Change</span>
        </div>
        
        {/* Loading spinner */}
        {isUploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <Spinner className="h-8 w-8 text-white" />
          </div>
        )}
      </div>
      
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
        disabled={isUploading}
      />
    </div>
  );
}