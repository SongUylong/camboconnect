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

    // Check for the trigger from ApplicationStatusForm
    const checkTriggerElement = () => {
      const triggerElement = document.getElementById('trigger-application-modal') as HTMLInputElement;
      if (triggerElement && triggerElement.value === 'true') {
        setIsOpen(true);
        
        // Store in localStorage that the modal was shown but not answered
        // This will be used to show the modal again on next login
        localStorage.setItem(`application-modal-shown-${opportunityId}`, 'true');
      }
    };

    // Check if there's a stored unanswered modal state from previous session
    const checkStoredModalState = () => {
      const wasShownBefore = localStorage.getItem(`application-modal-shown-${opportunityId}`);
      const wasAnswered = localStorage.getItem(`application-modal-answered-${opportunityId}`);
      
      // If the modal was shown before but not answered, show it again
      if (wasShownBefore === 'true' && wasAnswered !== 'true') {
        setIsOpen(true);
      }
    };

    // Initial checks
    checkTriggerElement();
    checkStoredModalState();

    // Set up a MutationObserver to watch for changes to the trigger element
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'value') {
          checkTriggerElement();
        }
      });
    });

    const triggerElement = document.getElementById('trigger-application-modal');
    if (triggerElement) {
      observer.observe(triggerElement, { attributes: true });
    }

    return () => {
      observer.disconnect();
    };
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
      
      // Mark the modal as answered in localStorage
      localStorage.setItem(`application-modal-answered-${opportunityId}`, 'true');
      
      // Close the modal
      setIsOpen(false);

    } catch (error) {
      console.error('Failed to update application status:', error);
    }
  };

  // Function to handle modal close without answering
  const handleOpenChange = (open: boolean) => {
    // If the modal is being closed without an answer, log this
    if (!open) {
      // We don't remove the 'shown' flag, so it will appear again on next login
      console.log('User closed the modal without answering');
    }
    setIsOpen(open);
  };

  if (isLoading || !session) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Application Status Confirmation</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium">{opportunityTitle}</h4>
            <p className="text-sm text-muted-foreground">Organized by: {organizationName}</p>
          </div>
          <p>Did you complete your application on the external site?</p>
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => handleResponse(false)}>
              No
            </Button>
            <Button onClick={() => handleResponse(true)}>
              Yes, I've Completed
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 