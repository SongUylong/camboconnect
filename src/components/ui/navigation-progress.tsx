'use client';

import { useEffect, useState, useRef } from "react";

interface NavigationProgressProps {
  isLoading: boolean;
}

export function NavigationProgress({ isLoading }: NavigationProgressProps) {
  const [visible, setVisible] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isLoading) {
      // Clear any existing hide timeout
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
      
      // Reset fade out state
      setFadeOut(false);
      
      // Make the loading screen visible immediately
      setVisible(true);
      
      // Prevent scrolling while loading
      document.body.style.overflow = 'hidden';
    } else if (visible) {
      // Start fade out animation
      setFadeOut(true);
      
      // Hide the loading screen after animation completes
      hideTimeoutRef.current = setTimeout(() => {
        setVisible(false);
        // Restore scrolling
        document.body.style.overflow = '';
      }, 500); // Match this with the CSS transition duration
    }

    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
      // Ensure scrolling is restored on unmount
      document.body.style.overflow = '';
    };
  }, [isLoading, visible]);

  if (!visible) return null;

  return (
    <div 
      className={`fixed inset-0 z-[9999] bg-white flex items-center justify-center ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      } transition-opacity duration-500`}
    >
      <div className="flex flex-col items-center text-center px-4">
        <div className="relative mb-6">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
        
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Changing page</h2>
        <p className="text-gray-500 max-w-md">
          We're preparing your content. This will only take a moment...
        </p>
      </div>
    </div>
  );
} 