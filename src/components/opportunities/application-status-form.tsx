"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useApplicationStore } from "@/store/applicationStore";
import { toast } from "sonner";
import { useApplication } from "@/contexts/application-context";
import { useApplicationStatus, useUpdateApplicationStatus } from "@/hooks/use-applications";

interface ApplicationStatusFormProps {
  opportunityId: string;
  externalLink?: string | null;
  title: string;
}

export default function ApplicationStatusForm({ 
  opportunityId, 
  externalLink,
  title
}: ApplicationStatusFormProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const { appliedOpportunities, setApplied, addUnconfirmedApplication } = useApplicationStore();
  const { setShowConfirmationModal, setCurrentOpportunity, resetModalState } = useApplication();
  
  // Use React Query to fetch application status
  const { 
    data: status, 
    isLoading: isStatusLoading,
    error: statusError,
    refetch: refetchStatus
  } = useApplicationStatus(opportunityId);
  
  // Use React Query mutation for updating application status
  const { 
    mutateAsync: updateStatusAsync,
    isPending: isSubmitting,
    error: updateError
  } = useUpdateApplicationStatus();
  
  // Check initial application status
  useEffect(() => {
    if (!session?.user?.id) return;
    
    // Refetch status to ensure we have the latest data
    refetchStatus().then(() => {
      if (!status) return;
      
      // If application exists and is confirmed as applied, update store
      if (status.isApplied && status.isConfirm) {
        setApplied(opportunityId);
      }
      
      // Show confirmation modal if application exists but is not confirmed
      if (status && status.isConfirm === false) {
        setCurrentOpportunity({ id: opportunityId, title });
        setShowConfirmationModal(true);
      }
    });
  }, [opportunityId, session?.user?.id, status, setApplied, setShowConfirmationModal, setCurrentOpportunity, title, refetchStatus]);
  
  // Show error toast if fetch failed
  useEffect(() => {
    if (statusError) {
      toast.error('Failed to check application status. Please refresh the page.');
    }
  }, [statusError]);
  
  const handleExternalApplication = async () => {
    if (!session) {
      router.push("/login");
      return;
    }
    
    if (!externalLink) {
      return;
    }
    
    try {
      console.log("Creating unconfirmed application for:", opportunityId);
      
      // Reset any existing modal state
      resetModalState();
      
      // Create application with initial state using React Query mutation
      const result = await updateStatusAsync({
        opportunityId,
        status: {
          statusId: "pending_confirmation",
          isApplied: false,
          isConfirm: false
        }
      });
      
      console.log("Application created:", result);
      
      // Add to unconfirmed applications in store
      addUnconfirmedApplication(opportunityId, title);
      
      // Open external link
      window.open(externalLink, '_blank');
      
      // Show confirmation modal using the site-wide context
      setCurrentOpportunity({ id: opportunityId, title });
      setShowConfirmationModal(true);
      
      // Show info message to user
      toast.info('Please confirm your application status after completing the external application.');
      
      // Refresh the status
      refetchStatus();
    } catch (error) {
      console.error("Failed to submit application status:", error);
      toast.error("Failed to create application. Please try again.");
    }
  };
  
  if (!session) {
    return (
      <div className="bg-gray-50 p-4 rounded-md">
        <p className="text-gray-700 mb-4">
          You need to log in to apply for this opportunity.
        </p>
        <Link href="/login" className="btn btn-primary">
          Log in to Apply
        </Link>
      </div>
    );
  }

  const hasApplied = appliedOpportunities.includes(opportunityId);

  return (
    <div className="bg-white p-4 rounded-md border border-gray-200">
      <p className="text-gray-600 mb-4">
        {externalLink 
          ? hasApplied 
            ? "You have already applied for this opportunity."
            : "Applications for this opportunity are managed on an external site. Click the button below to apply."
          : "This opportunity does not have an external application link configured."}
      </p>
      <button
        onClick={handleExternalApplication}
        className={`btn ${hasApplied ? 'btn-success' : 'btn-primary'}`}
        disabled={isSubmitting || !externalLink || hasApplied}
      >
        {isSubmitting ? "Redirecting..." : hasApplied ? "Applied" : "Apply on External Site"}
      </button>
      {isSubmitting && (
        <p className="text-blue-500 mt-2">
          Preparing your application...
        </p>
      )}
      {updateError && (
        <p className="text-red-500 mt-2">
          Error: Failed to create application
        </p>
      )}
    </div>
  );
}