"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useApplicationStore } from "@/store/applicationStore";
import { usePathname } from "next/navigation";
import { toast } from "sonner";

export function ApplicationStateInitializer() {
  const { data: session, status } = useSession();
  const { setApplied, resetState } = useApplicationStore();
  const pathname = usePathname();

  useEffect(() => {
    const initializeApplicationState = async () => {
      // Only proceed if we have a valid session
      if (status !== "authenticated" || !session?.user) return;

      try {
        // Reset state before initializing
        resetState();
        console.log('State reset completed');

        const response = await fetch('/api/applications');
        if (!response.ok) {
          throw new Error(`Failed to fetch applications: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Initialize the store with confirmed applications
        data.applications.forEach((app: any) => {
          if (app.status?.isApplied && app.status?.isConfirm) {
            console.log('Setting applied for opportunity:', app.opportunityId);
            setApplied(app.opportunityId);
          }
        });

        console.log('Application state initialized successfully');
      } catch (error) {
        console.error('Error initializing application state:', error);
        toast.error('Failed to load your applications. Please refresh the page.');
      }
    };

    console.log('Initializing application state for pathname:', pathname);
    initializeApplicationState();
  }, [session?.user?.id, status, setApplied, resetState, pathname]);

  return null;
} 