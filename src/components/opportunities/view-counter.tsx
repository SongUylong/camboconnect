"use client";

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

interface ViewCounterProps {
  opportunityId: string;
}

export function ViewCounter({ opportunityId }: ViewCounterProps) {
  const { data: session } = useSession();
  const [timeSpent, setTimeSpent] = useState(0);
  const [incremented, setIncremented] = useState(false);

  useEffect(() => {
    // Start the timer immediately - we'll check with the server if this view has been counted
    const timer = setInterval(() => {
      setTimeSpent((prev) => prev + 1);
    }, 1000); // Increment time spent every second

    // Check with the server if this view has already been counted
    const checkIfAlreadyViewed = async () => {
      if (session?.user?.id) {
        try {
          const response = await fetch(`/api/opportunities/${opportunityId}/check-view`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            }
          });
          
          const data = await response.json();
          
          if (data.hasViewed) {
            setIncremented(true);
          }
        } catch (error) {
          console.error('Failed to check view status:', error);
        }
      }
    };

    checkIfAlreadyViewed();

    return () => clearInterval(timer); // Cleanup on unmount
  }, [opportunityId, session]);

  useEffect(() => {
    if (timeSpent >= 30 && !incremented && session?.user?.id) { // 30 seconds threshold
      // Send request to increment view count
      const incrementViewCount = async () => {
        try {
          const response = await fetch(`/api/opportunities/${opportunityId}/increment-view`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            }
          });
          
          const data = await response.json();
          
          // Only mark as incremented if the server actually counted the view
          if (data.viewed) {
            setIncremented(true);
          }
        } catch (error) {
          console.error('Failed to increment view count:', error);
        }
      };

      incrementViewCount();
    }
  }, [timeSpent, incremented, session, opportunityId]);

  return null; // This component doesn't render anything
} 