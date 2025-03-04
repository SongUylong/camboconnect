"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useApplication } from "@/contexts/application-context";

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
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const { setShowConfirmationModal, setCurrentOpportunity } = useApplication();

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
          isApplied: false,
          isConfirm: false,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update application status');
      }
      
      // Set current opportunity and show modal
      setCurrentOpportunity({ id: opportunityId, title });
      setShowConfirmationModal(true);
      
      // Open external link
      window.open(externalLink, '_blank');
      
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

  if (submitSuccess) {
    return (
      <div className="bg-green-50 p-4 rounded-md">
        <h3 className="text-green-800 font-medium">Application Status Updated</h3>
        <p className="text-green-700 mt-1">
          Your application status has been successfully updated.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-md border border-gray-200">
      <p className="text-gray-600 mb-4">
        {externalLink 
          ? "Applications for this opportunity are managed on an external site. Click the button below to apply."
          : "This opportunity does not have an external application link configured."}
      </p>
      <button
        onClick={handleExternalApplication}
        className="btn btn-primary"
        disabled={isLoading || !externalLink}
      >
        {isLoading ? "Redirecting..." : "Apply on External Site"}
      </button>
    </div>
  );
}