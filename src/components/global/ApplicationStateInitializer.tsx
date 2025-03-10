"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useApplicationStore } from "@/store/applicationStore";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { useLoadingState } from "@/hooks/useLoadingState";

export function ApplicationStateInitializer() {
  const { data: session, status } = useSession();
  const { setApplied, resetState } = useApplicationStore();
  const pathname = usePathname();
  const { withLoading } = useLoadingState();

  useEffect(() => {
    const initializeApplicationState = async () => {
      // Only proceed if we have a valid session
      if (status !== "authenticated" || !session?.user) return;

      try {
        // Reset state before initializing
        resetState();

        const response = await withLoading(async () => {
          console.log('Fetching applications for initialization');
          return fetch('/api/applications');
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch applications: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Initialize the store with confirmed applications
        data.applications.forEach((app: any) => {
          if (app.status?.isApplied && app.status?.isConfirm) {
            setApplied(app.opportunityId);
          }
        });
      } catch (error) {
        console.error('Error initializing application state:', error);
        toast.error('Failed to load your applications. Please refresh the page.');
      }
    };

    initializeApplicationState();
  }, [session?.user?.id, status, setApplied, resetState, pathname, withLoading]);

  return null;
} 