"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useApplication } from "@/contexts/application-context";
import { 
  useUnconfirmedApplications, 
  useUpdateApplicationStatus, 
  useCreateParticipation 
} from "@/hooks/use-applications";
import { Application } from "@/api/applications";

export function UnconfirmedApplicationsCheck() {
  const { data: session } = useSession();
  const router = useRouter();
  const { showConfirmationModal, setShowConfirmationModal, currentOpportunity, setCurrentOpportunity } = useApplication();
  const [unconfirmedApplications, setUnconfirmedApplications] = useState<Application[]>([]);
  const [currentApplicationIndex, setCurrentApplicationIndex] = useState(0);
  const [hasChecked, setHasChecked] = useState(false);
  
  // Use React Query to fetch unconfirmed applications
  const { 
    data: unconfirmedData,
    isSuccess,
    refetch
  } = useUnconfirmedApplications();
  
  // Use React Query mutations for updating application status and creating participation
  const updateApplicationMutation = useUpdateApplicationStatus();
  const createParticipationMutation = useCreateParticipation();

  // Check for unconfirmed applications when session is available
  useEffect(() => {
    if (session?.user && !showConfirmationModal && !hasChecked) {
      refetch().then(() => {
        setHasChecked(true);
      });
    }
  }, [session, showConfirmationModal, refetch, hasChecked]);
  
  // Set unconfirmed applications when data is fetched
  useEffect(() => {
    if (!session?.user || showConfirmationModal) return;
    
    if (isSuccess && unconfirmedData?.applications && unconfirmedData.applications.length > 0) {
      setUnconfirmedApplications(unconfirmedData.applications);
      setCurrentOpportunity(unconfirmedData.applications[0].opportunity);
      setShowConfirmationModal(true);
    }
  }, [session, showConfirmationModal, setShowConfirmationModal, setCurrentOpportunity, isSuccess, unconfirmedData]);

  const handleConfirmation = async (hasCompleted: boolean) => {
    if (!currentOpportunity) return;
    
    try {
      // Update application status using React Query mutation
      await updateApplicationMutation.mutateAsync({
        opportunityId: currentOpportunity.id,
        status: {
          statusId: hasCompleted ? "applied" : "not_applied",
          isApplied: hasCompleted,
          isConfirm: true,
        }
      });

      if (hasCompleted) {
        // Create participation record using React Query mutation
        await createParticipationMutation.mutateAsync({
          opportunityId: currentOpportunity.id,
          participation: {
            year: new Date().getFullYear(),
            privacyLevel: "PUBLIC"
          }
        });
      }

      // Move to next application or close modal if done
      if (currentApplicationIndex < unconfirmedApplications.length - 1) {
        setCurrentApplicationIndex(prev => prev + 1);
        setCurrentOpportunity(unconfirmedApplications[currentApplicationIndex + 1].opportunity);
      } else {
        setShowConfirmationModal(false);
        setCurrentOpportunity(null);
        setHasChecked(false); // Reset check status to allow checking again
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
            disabled={updateApplicationMutation.isPending}
          >
            No
          </button>
          <button
            onClick={() => handleConfirmation(true)}
            className="btn btn-primary"
            disabled={updateApplicationMutation.isPending}
          >
            Yes
          </button>
        </div>
        {updateApplicationMutation.isError && (
          <p className="text-red-500 mt-2">
            Error: Failed to update application status
          </p>
        )}
      </div>
    </div>
  );
} 