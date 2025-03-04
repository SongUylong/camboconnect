"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useApplication } from "@/contexts/application-context";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useApplicationStore } from "@/store/applicationStore";

export function UnconfirmedApplicationsCheck() {
  const { data: session } = useSession();
  const router = useRouter();
  const { 
    showConfirmationModal, 
    setShowConfirmationModal, 
    currentOpportunity, 
    setCurrentOpportunity 
  } = useApplication();
  const { setApplied } = useApplicationStore();

  useEffect(() => {
    const checkUnconfirmedApplications = async () => {
      if (!session?.user?.id || showConfirmationModal) return;

      try {
        const response = await fetch('/api/applications/unconfirmed');
        if (!response.ok) throw new Error('Failed to fetch unconfirmed applications');
        
        const data = await response.json();
        
        // If there are any unconfirmed applications, show the modal for the first one
        if (data.applications.length > 0) {
          const firstApp = data.applications[0];
          setCurrentOpportunity({
            id: firstApp.opportunityId,
            title: firstApp.opportunity.title
          });
          setShowConfirmationModal(true);
        }
      } catch (error) {
        console.error('Error checking unconfirmed applications:', error);
      }
    };

    checkUnconfirmedApplications();
  }, [session?.user?.id, showConfirmationModal, setShowConfirmationModal, setCurrentOpportunity]);

  const handleConfirmation = async (hasCompleted: boolean) => {
    if (!currentOpportunity) return;
    
    try {
      // Update application status
      const response = await fetch(`/api/opportunities/${currentOpportunity.id}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          statusId: hasCompleted ? "applied" : "not_applied",
          isApplied: hasCompleted,
          isConfirm: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update application status');
      }

      if (hasCompleted) {
        // Create participation record
        const participationResponse = await fetch(`/api/opportunities/${currentOpportunity.id}/participation`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            year: new Date().getFullYear(),
            privacyLevel: "PUBLIC"
          }),
        });

        if (!participationResponse.ok) {
          throw new Error('Failed to create participation record');
        }

        // Update the application store
        setApplied(currentOpportunity.id);
        toast.success('Application completed successfully!');
      } else {
        toast.info('Application status updated');
      }

      setShowConfirmationModal(false);
      setCurrentOpportunity(null);
      router.refresh();
    } catch (error) {
      console.error('Failed to update application status:', error);
      toast.error('Failed to update application status. Please try again.');
    }
  };

  if (!showConfirmationModal || !currentOpportunity) {
    return null;
  }

  return (
    <Dialog open={showConfirmationModal} onOpenChange={(open) => {
      if (!open) {
        toast.warning('Please confirm your application status before closing.');
        return;
      }
      setShowConfirmationModal(open);
    }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Application Status Confirmation</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium">{currentOpportunity.title}</h4>
          </div>
          <p>Did you complete your application on the external site?</p>
          <div className="flex justify-end space-x-3">
            <Button 
              variant="outline" 
              onClick={() => handleConfirmation(false)}
            >
              No
            </Button>
            <Button 
              onClick={() => handleConfirmation(true)}
            >
              Yes, I've Completed
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 