"use client";

import { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useCheckViewStatus, useIncrementViewCount } from '@/hooks/use-opportunities';

interface ViewCounterProps {
  opportunityId: string;
}

export function ViewCounter({ opportunityId }: ViewCounterProps) {
  const { data: session, status } = useSession();
  const [timeSpent, setTimeSpent] = useState(0);
  const [incremented, setIncremented] = useState(false);
  const incrementAttempted = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Use React Query to check if the user has already viewed this opportunity
  const { 
    data: viewStatus,
    isSuccess: viewCheckSuccess,
    isLoading: viewCheckLoading
  } = useCheckViewStatus(opportunityId);
  
  // Use React Query to increment the view count
  const incrementViewMutation = useIncrementViewCount();

  // Cleanup function
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Start timer only if user is logged in and view hasn't been incremented
  useEffect(() => {
    // Only start timer if user is logged in and we've checked view status
    if (status === 'unauthenticated') {
      // Don't track views for unauthenticated users
      return;
    }
    
    if (session?.user?.id && viewCheckSuccess && !incremented && !timerRef.current) {
      // If already viewed, mark as incremented
      if (viewStatus?.hasViewed) {
        setIncremented(true);
        return;
      }
      
      // Start the timer
      timerRef.current = setInterval(() => {
        setTimeSpent((prev) => prev + 1);
      }, 1000); // Increment time spent every second
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [session, status, viewCheckSuccess, viewStatus, incremented]);

  // Increment view count after 30 seconds if not already incremented
  useEffect(() => {
    if (
      timeSpent >= 30 && // 30 seconds threshold
      !incremented && 
      session?.user?.id && 
      !incrementAttempted.current
    ) {
      incrementAttempted.current = true; // Mark as attempted to prevent multiple calls
      
      incrementViewMutation.mutate(opportunityId, {
        onSuccess: (data) => {
          if (data.viewed) {
            setIncremented(true);
            // Stop the timer once view is incremented
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
          }
        },
        onError: (error) => {
          console.error('Failed to increment view count:', error);
          // Reset the attempt flag after a delay to allow retry
          setTimeout(() => {
            incrementAttempted.current = false;
          }, 10000); // Wait 10 seconds before allowing another attempt
        }
      });
    }
  }, [timeSpent, incremented, session, opportunityId, incrementViewMutation]);

  return null; // This component doesn't render anything
} 