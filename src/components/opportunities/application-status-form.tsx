"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ApplicationStatusFormProps {
  opportunityId: string;
}

export default function ApplicationStatusForm({ opportunityId }: ApplicationStatusFormProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [applicationStatusOptions, setApplicationStatusOptions] = useState<Array<{id: string, name: string}>>([]);

  useEffect(() => {
    // In a real app, fetch application status options from API
    // For now, we'll use dummy data
    setApplicationStatusOptions([
      { id: "1", name: "Applied" },
      { id: "2", name: "Not Applied" },
      { id: "3", name: "Will Apply Later" }
    ]);

    // Check if user has an existing application for this opportunity
    if (session?.user?.id) {
      // In a real app, fetch this from API
      // For now, we'll assume no existing application
      setApplicationStatus(null);
    }
  }, [session, opportunityId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session) {
      router.push("/login");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // In a real app, send to API
      // await fetch(`/api/applications`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     opportunityId,
      //     statusId: applicationStatus,
      //     feedback
      //   }),
      // });
      
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSubmitSuccess(true);
      setShowForm(false);
      
      // Refresh the page to show updated status
      // router.refresh();
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
          Thank you for updating your application status. Your response has been recorded.
        </p>
      </div>
    );
  }

  if (applicationStatus && !showForm) {
    const statusName = applicationStatusOptions.find(s => s.id === applicationStatus)?.name || "Unknown";
    
    return (
      <div className="bg-blue-50 p-4 rounded-md">
        <h3 className="text-blue-800 font-medium">Your Current Application Status: {statusName}</h3>
        <p className="text-blue-700 mt-1">
          You've already provided your application status for this opportunity.
        </p>
        <button 
          onClick={() => setShowForm(true)}
          className="mt-3 btn btn-outline text-blue-600 border-blue-600"
        >
          Update Status
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-md border border-gray-200">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label htmlFor="applicationStatus" className="block text-sm font-medium text-gray-700">
              Application Status
            </label>
            <select
              id="applicationStatus"
              value={applicationStatus || ""}
              onChange={(e) => setApplicationStatus(e.target.value)}
              className="input mt-1"
              required
            >
              <option value="" disabled>
                Select your application status
              </option>
              {applicationStatusOptions.map((status) => (
                <option key={status.id} value={status.id}>
                  {status.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="feedback" className="block text-sm font-medium text-gray-700">
              Feedback (Optional)
            </label>
            <textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="input min-h-[100px] mt-1"
              placeholder="Share your experience with the application process..."
            />
          </div>
          
          <div className="flex items-center justify-end space-x-3">
            {showForm && (
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn btn-outline"
                disabled={isLoading}
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}