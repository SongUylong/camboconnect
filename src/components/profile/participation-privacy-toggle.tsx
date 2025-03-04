"use client";

import { useState } from "react";
import { Eye, EyeOff, Users } from "lucide-react";
import { toast } from "sonner";

type PrivacyLevel = "PUBLIC" | "FRIENDS_ONLY" | "ONLY_ME";

interface ParticipationPrivacyToggleProps {
  participationId: string;
  initialPrivacyLevel: PrivacyLevel;
}

export function ParticipationPrivacyToggle({
  participationId,
  initialPrivacyLevel,
}: ParticipationPrivacyToggleProps) {
  const [privacyLevel, setPrivacyLevel] = useState<PrivacyLevel>(initialPrivacyLevel);
  const [isLoading, setIsLoading] = useState(false);

  const handlePrivacyChange = async (newLevel: PrivacyLevel) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/participations/${participationId}/privacy`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ privacyLevel: newLevel }),
      });

      if (!response.ok) throw new Error("Failed to update privacy level");

      setPrivacyLevel(newLevel);
      toast.success("Privacy level updated");
    } catch (error) {
      console.error("Error updating privacy level:", error);
      toast.error("Failed to update privacy level");
    } finally {
      setIsLoading(false);
    }
  };

  const getPrivacyIcon = (level: PrivacyLevel) => {
    switch (level) {
      case "PUBLIC":
        return <Eye className="h-4 w-4" />;
      case "FRIENDS_ONLY":
        return <Users className="h-4 w-4" />;
      case "ONLY_ME":
        return <EyeOff className="h-4 w-4" />;
    }
  };

  const getPrivacyLabel = (level: PrivacyLevel) => {
    switch (level) {
      case "PUBLIC":
        return "Public";
      case "FRIENDS_ONLY":
        return "Friends Only";
      case "ONLY_ME":
        return "Only Me";
    }
  };

  return (
    <div className="flex items-center space-x-2">
      {["PUBLIC", "FRIENDS_ONLY", "ONLY_ME"].map((level) => (
        <button
          key={level}
          onClick={() => handlePrivacyChange(level as PrivacyLevel)}
          disabled={isLoading || privacyLevel === level}
          className={`flex items-center px-2 py-1 rounded text-xs ${
            privacyLevel === level
              ? "bg-blue-100 text-blue-700 border border-blue-300"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
          }`}
          title={getPrivacyLabel(level as PrivacyLevel)}
        >
          {getPrivacyIcon(level as PrivacyLevel)}
          <span className="ml-1">{getPrivacyLabel(level as PrivacyLevel)}</span>
        </button>
      ))}
    </div>
  );
} 