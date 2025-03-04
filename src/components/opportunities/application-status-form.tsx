"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ApplicationCheckModal } from "@/components/opportunities/application-check-modal";
import { useApplicationStore } from "@/store/applicationStore";

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
  const { appliedOpportunities, setShowConfirmationModal, setApplied } = useApplicationStore();

  // Check initial application status
  useEffect(() => {
    const checkApplicationStatus = async () => {
      if (!session?.user?.id) return;

      try {
        const response = await fetch(`/api/opportunities/${opportunityId}/application-status`);
        if (!response.ok) throw new Error('Failed to fetch application status');
        
        const data = await response.json();
        if (data.status?.isApplied) {
          setApplied(opportunityId);
        }
      } catch (error) {
        console.error('Error checking application status:', error);
      }
    };

    checkApplicationStatus();
  }, [opportunityId, session?.user?.id, setApplied]);

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
      // Create application with initial state
      const response = await fetch(`/api/opportunities/${opportunityId}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          statusId: "pending_confirmation",
          isApplied: false
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update application status');
      }
      
      // Open external link
      window.open(externalLink, '_blank');
      
      // Show confirmation modal
      setShowConfirmationModal(true, opportunityId);
      
    } catch (error) {
      console.error("Failed to submit application status:", error);
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
        className={`btn ${hasApplied ? 'btn-success' : 'btn-primary'}`}
        disabled={isLoading || !externalLink || hasApplied}
      >
        {isLoading ? "Redirecting..." : hasApplied ? "Applied" : "Apply on External Site"}
      </button>
      <ApplicationCheckModal opportunityId={opportunityId} title={title} />
    </div>
  );
}