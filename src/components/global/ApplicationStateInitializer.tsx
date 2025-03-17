"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useApplicationStore } from "@/store/applicationStore";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { useApplications } from "@/hooks/use-applications";

export function ApplicationStateInitializer() {
  const { data: session, status } = useSession();
  const { setApplied, resetState } = useApplicationStore();
  const pathname = usePathname();
  
  // Use React Query to fetch applications only when authenticated
  const { data: applications, error, isLoading } = useApplications({
    enabled: status === "authenticated" && !!session?.user
  });
  
  useEffect(() => {
    // Only proceed if we have a valid session and data
    if (status !== "authenticated" || !session?.user || !applications) return;
    
    // Reset state before initializing
    resetState();
    
    // Initialize the store with confirmed applications
    applications.forEach((app: any) => {
      if (app.status?.isApplied && app.status?.isConfirm) {
        setApplied(app.opportunityId);
      }
    });
  }, [applications, session?.user, status, setApplied, resetState, pathname]);
  
  // Show error toast if fetch failed - only when authenticated
  useEffect(() => {
    if (error && status === "authenticated") {
      toast.error('Failed to load your applications. Please refresh the page.');
    }
  }, [error, status]);
  
  return null;
} 