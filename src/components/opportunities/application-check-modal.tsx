"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { useApplicationStore } from "@/store/applicationStore";

interface ApplicationCheckModalProps {
  opportunityId: string;
  title: string;
}

export function ApplicationCheckModal({ 
  opportunityId,
  title
}: ApplicationCheckModalProps) {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const { showConfirmationModal, setShowConfirmationModal, setApplied } = useApplicationStore();

  const handleResponse = async (completed: boolean) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/opportunities/${opportunityId}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          statusId: completed ? "applied" : "not_applied",
          isApplied: completed
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update application status');
      }
      
      if (completed) {
        setApplied(opportunityId);
      }
      
      // Close the modal
      setShowConfirmationModal(false);

    } catch (error) {
      console.error('Failed to update application status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!session) return null;

  return (
    <Dialog open={showConfirmationModal} onOpenChange={(open) => setShowConfirmationModal(open)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Application Status Confirmation</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium">{title}</h4>
          </div>
          <p>Did you complete your application on the external site?</p>
          <div className="flex justify-end space-x-3">
            <Button 
              variant="outline" 
              onClick={() => handleResponse(false)}
              disabled={isLoading}
            >
              No
            </Button>
            <Button 
              onClick={() => handleResponse(true)}
              disabled={isLoading}
            >
              {isLoading ? "Updating..." : "Yes, I've Completed"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 