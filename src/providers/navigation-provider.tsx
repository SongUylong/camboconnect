'use client';

import { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { NavigationProgress } from "@/components/ui/navigation-progress";

interface NavigationContextType {
  isNavigating: boolean;
  startLoading: () => void;
  stopLoading: () => void;
}

const NavigationContext = createContext<NavigationContextType>({
  isNavigating: false,
  startLoading: () => {},
  stopLoading: () => {},
});

export const useNavigation = () => useContext(NavigationContext);

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);
  const manualLoadingCount = useRef(0);
  const navigationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastNavigationTimeRef = useRef<number>(0);
  
  // Track navigation between pages
  useEffect(() => {
    // Only show loading for actual page navigation, not for initial load
    if (typeof window !== 'undefined' && document.readyState === 'complete') {
      const now = Date.now();
      
      // Don't show loading if navigation happens too frequently (debounce)
      if (now - lastNavigationTimeRef.current > 300) {
        setIsNavigating(true);
        lastNavigationTimeRef.current = now;
        
        // Clear any existing timeout
        if (navigationTimeoutRef.current) {
          clearTimeout(navigationTimeoutRef.current);
        }
        
        // Hide loading after a reasonable delay
        navigationTimeoutRef.current = setTimeout(() => {
          if (manualLoadingCount.current === 0) {
            setIsNavigating(false);
          }
          navigationTimeoutRef.current = null;
        }, 800);
      }
    }
    
    return () => {
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
        navigationTimeoutRef.current = null;
      }
    };
  }, [pathname, searchParams]);

  // For manual loading control (e.g., large data fetches)
  const startLoading = useCallback(() => {
    manualLoadingCount.current += 1;
    setIsNavigating(true);
  }, []);

  const stopLoading = useCallback(() => {
    manualLoadingCount.current = Math.max(0, manualLoadingCount.current - 1);
    
    if (manualLoadingCount.current === 0) {
      setIsNavigating(false);
    }
  }, []);

  return (
    <NavigationContext.Provider value={{ isNavigating, startLoading, stopLoading }}>
      <NavigationProgress isLoading={isNavigating} />
      {children}
    </NavigationContext.Provider>
  );
} 