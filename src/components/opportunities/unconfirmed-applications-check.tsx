"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useApplication } from "@/contexts/application-context";

interface UnconfirmedApplication {
  id: string;
  opportunity: {
    id: string;
    title: string;
  };
}

export function UnconfirmedApplicationsCheck() {
  const { data: session } = useSession();
  const router = useRouter();
  const { showConfirmationModal, setShowConfirmationModal, currentOpportunity, setCurrentOpportunity } = useApplication();
  const [unconfirmedApplications, setUnconfirmedApplications] = useState<UnconfirmedApplication[]>([]);
  const [currentApplicationIndex, setCurrentApplicationIndex] = useState(0);

  useEffect(() => {
    const checkUnconfirmedApplications = async () => {
      if (!session?.user || showConfirmationModal) return;

      try {
        const response = await fetch("/api/applications/unconfirmed");
        const data = await response.json();
        
        if (data.applications && data.applications.length > 0) {
          setUnconfirmedApplications(data.applications);
          setCurrentOpportunity(data.applications[0].opportunity);
          setShowConfirmationModal(true);
        }
      } catch (error) {
        console.error("Failed to check unconfirmed applications:", error);
      }
    };

    checkUnconfirmedApplications();
  }, [session, showConfirmationModal, setShowConfirmationModal, setCurrentOpportunity]);

  const handleConfirmation = async (hasCompleted: boolean) => {
    if (!currentOpportunity) return;
    
    try {
      await fetch(`/api/opportunities/${currentOpportunity.id}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isApplied: hasCompleted,
          isConfirm: true,
        }),
      });

      // Move to next application or close modal if done
      if (currentApplicationIndex < unconfirmedApplications.length - 1) {
        setCurrentApplicationIndex(prev => prev + 1);
        setCurrentOpportunity(unconfirmedApplications[currentApplicationIndex + 1].opportunity);
      } else {
        setShowConfirmationModal(false);
        setCurrentOpportunity(null);
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to update application status:", error);
    }
  };

  if (!showConfirmationModal || !currentOpportunity) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h3 className="text-lg font-semibold mb-4">Application Status Confirmation</h3>
        <p className="mb-6">
          Have you completed your application for{" "}
          <span className="font-semibold">{currentOpportunity.title}</span>?
        </p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={() => handleConfirmation(false)}
            className="btn btn-outline"
          >
            No
          </button>
          <button
            onClick={() => handleConfirmation(true)}
            className="btn btn-primary"
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
} 