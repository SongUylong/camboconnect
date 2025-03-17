"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useApplication } from "@/contexts/application-context";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useApplicationStore } from "@/store/applicationStore";
import { 
  useUnconfirmedApplications, 
  useUpdateApplicationStatus,
  useCreateParticipation
} from "@/hooks/use-applications";

export function UnconfirmedApplicationsCheck() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { 
    showConfirmationModal, 
    setShowConfirmationModal, 
    currentOpportunity, 
    setCurrentOpportunity 
  } = useApplication();
  const { setApplied } = useApplicationStore();
  const [hasChecked, setHasChecked] = useState(false);
  
  // Use React Query to fetch unconfirmed applications
  const { 
    data: unconfirmedData,
    isLoading,
    error,
    refetch
  } = useUnconfirmedApplications();
  
  // Use React Query mutations
  const { mutate: updateStatus } = useUpdateApplicationStatus();
  const { mutate: createParticipation } = useCreateParticipation();
  
  // Only fetch unconfirmed applications when the user is authenticated
  useEffect(() => {
    if (status === "authenticated" && session?.user?.id && !hasChecked && !showConfirmationModal) {
      refetch().then(() => {
        setHasChecked(true);
      }).catch(error => {
        console.error("Failed to fetch unconfirmed applications:", error);
        setHasChecked(true);
      });
    }
  }, [status, session, hasChecked, showConfirmationModal, refetch]);
  
  useEffect(() => {
    if (!session?.user?.id || showConfirmationModal || !unconfirmedData?.applications?.length) return;
    
    // If there are any unconfirmed applications, show the modal for the first one
    const firstApp = unconfirmedData.applications[0];
    setCurrentOpportunity({
      id: firstApp.opportunity.id,
      title: firstApp.opportunity.title
    });
    setShowConfirmationModal(true);
  }, [session?.user?.id, showConfirmationModal, unconfirmedData, setShowConfirmationModal, setCurrentOpportunity]);
  
  const handleConfirmation = async (hasCompleted: boolean) => {
    if (!currentOpportunity) return;
    
    // Update application status using React Query mutation
    updateStatus({
      opportunityId: currentOpportunity.id,
      status: {
        statusId: hasCompleted ? "applied" : "not_applied",
        isApplied: hasCompleted,
        isConfirm: true
      }
    });
    
    if (hasCompleted) {
      // Create participation record using React Query mutation
      createParticipation({
        opportunityId: currentOpportunity.id,
        participation: {
          year: new Date().getFullYear(),
          privacyLevel: "PUBLIC"
        }
      });
      
      // Update the application store
      setApplied(currentOpportunity.id);
      toast.success('Application completed successfully!');
    } else {
      toast.info('Application status updated');
    }
    
    setShowConfirmationModal(false);
    setCurrentOpportunity(null);
    setHasChecked(false);
    router.refresh();
  };
  
  // Don't render anything for unauthenticated users
  if (status === "unauthenticated" || !session) {
    return null;
  }
  
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