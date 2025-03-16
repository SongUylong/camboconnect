"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ShareProfileButtonProps {
  userId: string;
}

export default function ShareProfileButton({ userId }: ShareProfileButtonProps) {
  const [copied, setCopied] = useState(false);

  const copyProfileUrl = () => {
    const url = `${window.location.origin}/profile/${userId}`;
    navigator.clipboard.writeText(url)
      .then(() => {
        setCopied(true);
        toast.success("Profile link copied to clipboard");
        
        // Reset copied state after 2 seconds
        setTimeout(() => {
          setCopied(false);
        }, 2000);
      })
      .catch((error) => {
        console.error("Error copying to clipboard:", error);
        toast.error("Failed to copy link");
      });
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      className="flex items-center gap-1"
      onClick={copyProfileUrl}
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 text-green-500" />
          <span>Copied</span>
        </>
      ) : (
        <>
          <Share2 className="h-4 w-4" />
          <span>Share</span>
        </>
      )}
    </Button>
  );
} 