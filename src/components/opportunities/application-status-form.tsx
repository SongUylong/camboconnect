"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useApplicationStore } from "@/store/applicationStore";
import { toast } from "sonner";
import { useApplication } from "@/contexts/application-context";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

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
  const [isLoading, setIsLoading] = useState(false);
  const { appliedOpportunities, setApplied, addUnconfirmedApplication } = useApplicationStore();
  const { setShowConfirmationModal, setCurrentOpportunity } = useApplication();

  // Check initial application status
  useEffect(() => {
    const checkApplicationStatus = async () => {
      if (!session?.user?.id) return;

      try {
        const response = await fetch(`/api/opportunities/${opportunityId}/application-status`);
        if (!response.ok) throw new Error('Failed to fetch application status');
        
        const data = await response.json();
        
        // If application exists and is confirmed as applied, update store
        if (data.status?.isApplied && data.status?.isConfirm) {
          setApplied(opportunityId);
        }
        
        // Show confirmation modal if application exists but is not confirmed
        if (data.status && data.status.isConfirm === false) {
          setCurrentOpportunity({ id: opportunityId, title });
          setShowConfirmationModal(true);
        }
      } catch (error) {
        console.error('Error checking application status:', error);
      }
    };

    checkApplicationStatus();
  }, [opportunityId, session?.user?.id, setApplied, setShowConfirmationModal, setCurrentOpportunity, title]);

  const handleExternalApplication = async () => {
    if (!session) {
      router.push("/login");
      return;
    }

    if (!externalLink) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Create application with initial state - explicitly set isConfirm to false
      const response = await fetch(`/api/opportunities/${opportunityId}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          statusId: "pending_confirmation",
          isApplied: false,
          isConfirm: false
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update application status');
      }
      
      // Add to unconfirmed applications in store
      addUnconfirmedApplication(opportunityId, title);
      
      // Open external link
      window.open(externalLink, '_blank');
      
      // Show confirmation modal using the site-wide context
      setCurrentOpportunity({ id: opportunityId, title });
      setShowConfirmationModal(true);
      
      // Show info message to user
      toast.info('Please confirm your application status after completing the external application.');
      
    } catch (error) {
      console.error("Failed to submit application status:", error);
      toast.error("Failed to start application process. Please try again.");
    } finally {
      setIsLoading(false);
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
        className={`btn ${hasApplied ? 'btn-success' : 'btn-primary'} flex items-center justify-center min-w-[150px]`}
        disabled={isLoading || !externalLink || hasApplied}
      >
        {isLoading ? (
          <LoadingSpinner size="sm" text="Redirecting..." />
        ) : hasApplied ? (
          "Applied"
        ) : (
          "Apply on External Site"
        )}
      </button>
    </div>
  );
}