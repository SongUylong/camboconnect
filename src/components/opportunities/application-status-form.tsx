"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ApplicationStatusFormProps {
  opportunityId: string;
  externalLink?: string | null;
}

export default function ApplicationStatusForm({ 
  opportunityId, 
  externalLink 
}: ApplicationStatusFormProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

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
      // Create application with "Pending" status
      const response = await fetch(`/api/opportunities/${opportunityId}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          statusId: "pending", // This will be handled by the API to get the correct status ID
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update application status');
      }
      
      // Redirect to external link
      window.open(externalLink, '_blank');
      
      setSubmitSuccess(true);
      
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
        <h3 className="text-green-800 font-medium">Application Started</h3>
        <p className="text-green-700 mt-1">
          You have been redirected to complete your application. We'll check with you later about its completion status.
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