"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";

interface ApplicationCheckModalProps {
  opportunityId: string;
  opportunityTitle: string;
  organizationName: string;
}

export function ApplicationCheckModal({ 
  opportunityId,
  opportunityTitle,
  organizationName,
}: ApplicationCheckModalProps) {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkPendingApplication = async () => {
      if (!session?.user?.id) return;

      try {
        const response = await fetch(`/api/opportunities/${opportunityId}/application-status`);
        if (!response.ok) throw new Error('Failed to fetch application status');
        
        const data = await response.json();
        // Show modal if application status is "Pending Confirmation"
        if (data.status?.name === "Pending Confirmation") {
          setIsOpen(true);
        }
      } catch (error) {
        console.error('Error checking application status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkPendingApplication();
  }, [opportunityId, session?.user?.id]);

  const handleResponse = async (completed: boolean) => {
    try {
      const response = await fetch(`/api/opportunities/${opportunityId}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          statusId: completed ? "applied" : "not_applied",
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update application status');
      }
      
      // Close the modal
      setIsOpen(false);

    } catch (error) {
      console.error('Failed to update application status:', error);
    }
  };

  if (isLoading || !session) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Application Status Check</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium">{opportunityTitle}</h4>
            <p className="text-sm text-muted-foreground">{organizationName}</p>
          </div>
          <p>Did you complete your application on the external site?</p>
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => handleResponse(false)}>
              No
            </Button>
            <Button onClick={() => handleResponse(true)}>
              Yes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 