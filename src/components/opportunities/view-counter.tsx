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
    const timer = setInterval(() => {
      setTimeSpent((prev) => prev + 1);
    }, 1000); // Increment time spent every second

    return () => clearInterval(timer); // Cleanup on unmount
  }, []);

  useEffect(() => {
    if (timeSpent >= 60 && !incremented) { // 120 seconds = 2 minutes
      // Send request to increment view count
      const incrementViewCount = async () => {
        if (session?.user?.id) {
          try {
            await fetch(`/api/opportunities/${opportunityId}/increment-view`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ userId: session.user.id }),
            });
            setIncremented(true); // Prevent further increments
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