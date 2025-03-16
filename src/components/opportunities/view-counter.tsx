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
    // Check if this opportunity has already been viewed by this user
    const checkIfAlreadyViewed = () => {
      // Get viewed opportunities from localStorage
      const viewedOpportunities = JSON.parse(localStorage.getItem('viewedOpportunities') || '{}');
      
      // If this opportunity is in the viewed list, mark as already incremented
      if (viewedOpportunities[opportunityId]) {
        setIncremented(true);
        return true;
      }
      
      return false;
    };
    
    // If already viewed, don't start the timer
    if (checkIfAlreadyViewed()) {
      return;
    }
    
    const timer = setInterval(() => {
      setTimeSpent((prev) => prev + 1);
    }, 1000); // Increment time spent every second

    return () => clearInterval(timer); // Cleanup on unmount
  }, [opportunityId]);

  useEffect(() => {
    if (timeSpent >= 30 && !incremented) { // 30 seconds threshold
      // Send request to increment view count
      const incrementViewCount = async () => {
        if (session?.user?.id) {
          try {
            const response = await fetch(`/api/opportunities/${opportunityId}/increment-view`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ userId: session.user.id }),
            });
            
            const data = await response.json();
            
            // Only mark as viewed if the server actually counted the view
            if (data.viewed) {
              // Mark as incremented
              setIncremented(true);
              
              // Save to localStorage to prevent future increments
              const viewedOpportunities = JSON.parse(localStorage.getItem('viewedOpportunities') || '{}');
              viewedOpportunities[opportunityId] = true;
              localStorage.setItem('viewedOpportunities', JSON.stringify(viewedOpportunities));
            }
          } catch (error) {
            console.error('Failed to increment view count:', error);
          }
        }
      };

      incrementViewCount();
    }
  }, [timeSpent, incremented, session, opportunityId]);

  return null; // This component doesn't render anything
} 