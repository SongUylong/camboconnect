"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useApplication } from "@/contexts/application-context";
import { 
  useUnconfirmedApplications, 
  useUpdateApplicationStatus, 
  useCreateParticipation 
} from "@/hooks/use-applications";
import { Application } from "@/api/applications";
import { toast } from "sonner";

export function UnconfirmedApplicationsCheck() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { 
    showConfirmationModal, 
    setShowConfirmationModal, 
    currentOpportunity, 
    setCurrentOpportunity,
    resetModalState
  } = useApplication();
  const [unconfirmedApplications, setUnconfirmedApplications] = useState<Application[]>([]);
  const [currentApplicationIndex, setCurrentApplicationIndex] = useState(0);
  const [hasChecked, setHasChecked] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [forceRefresh, setForceRefresh] = useState(0);
  const confirmationInProgress = useRef(false);
  
  // Use React Query to fetch unconfirmed applications
  const { 
    data: unconfirmedData,
    isSuccess,
    refetch,
    isLoading
  } = useUnconfirmedApplications();
  
  // Use React Query mutations for updating application status and creating participation
  const updateApplicationMutation = useUpdateApplicationStatus();
  const createParticipationMutation = useCreateParticipation();

  // Check for unconfirmed applications when session is available
  useEffect(() => {
    // Don't do anything for unauthenticated users
    if (status === "unauthenticated" || !session?.user) {
      return;
    }
    
    if (session?.user && !showConfirmationModal && !hasChecked) {
      // Only refetch on initial load or when explicitly needed
      refetch().then(() => {
        setHasChecked(true);
        setIsInitialLoad(false);
      }).catch(error => {
        console.error("Failed to fetch unconfirmed applications:", error);
        setHasChecked(true);
        setIsInitialLoad(false);
      });
    }
  }, [session, status, showConfirmationModal, refetch, hasChecked, forceRefresh]);
  
  // Set unconfirmed applications when data is fetched
  useEffect(() => {
    if (!session?.user) return;
    
    // Only process data if we have successfully fetched it and there are applications
    if (isSuccess && unconfirmedData?.applications && unconfirmedData.applications.length > 0) {
      console.log("Unconfirmed applications found:", unconfirmedData.applications);
      
      // Set the applications in state
      setUnconfirmedApplications(unconfirmedData.applications);
      
      // Only show the modal if it's not already showing and not in the middle of confirmation
      if (!showConfirmationModal && !confirmationInProgress.current) {
        setCurrentOpportunity(unconfirmedData.applications[0].opportunity);
        setShowConfirmationModal(true);
      }
    } else if (isSuccess && (!unconfirmedData?.applications || unconfirmedData.applications.length === 0)) {
      // No unconfirmed applications found, reset modal state
      console.log("No unconfirmed applications found");
      resetModalState();
      setHasChecked(false);
      setCurrentApplicationIndex(0);
    }
  }, [session, showConfirmationModal, setShowConfirmationModal, setCurrentOpportunity, isSuccess, unconfirmedData, resetModalState, forceRefresh]);

  const handleConfirmation = async (hasCompleted: boolean) => {
    if (!currentOpportunity) return;
    
    try {
      // Set confirmation in progress to prevent showing the modal again
      confirmationInProgress.current = true;
      
      // Update application status using React Query mutation
      await updateApplicationMutation.mutateAsync({
        opportunityId: currentOpportunity.id,
        status: {
          statusId: hasCompleted ? "applied" : "not_applied",
          isApplied: hasCompleted,
          isConfirm: true,
        }
      });

      // Show success message
      toast.success(
        hasCompleted 
          ? "Application confirmed as completed!" 
          : "Application marked as not completed."
      );

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

      // Immediately close the modal after successful update
      resetModalState();
      setHasChecked(false);
      setCurrentApplicationIndex(0);
      
      // Refresh the page to update the UI
      router.refresh();

      // Refetch in the background to update the data cache
      refetch();
      
      // Force a refresh of the component
      setForceRefresh(prev => prev + 1);
      
      // Reset confirmation in progress
      setTimeout(() => {
        confirmationInProgress.current = false;
      }, 500);
    } catch (error) {
      console.error("Failed to update application status:", error);
      toast.error("Failed to update application status. Please try again.");
      confirmationInProgress.current = false;
    }
  };

  // Close button handler
  const handleClose = () => {
    resetModalState();
    setHasChecked(false);
    setCurrentApplicationIndex(0);
    setForceRefresh(prev => prev + 1);
  };

  // Don't render anything for unauthenticated users
  if (status === "unauthenticated" || !session) {
    return null;
  }

  if (!showConfirmationModal || !currentOpportunity) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Application Status Confirmation</h3>
          <button 
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
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
        {updateApplicationMutation.isPending && (
          <p className="text-blue-500 mt-2">
            Updating application status...
          </p>
        )}
        {updateApplicationMutation.isError && (
          <p className="text-red-500 mt-2">
            Error: Failed to update application status
          </p>
        )}
      </div>
    </div>
  );
} 