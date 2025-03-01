"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { WelcomeModal } from "./welcome-modal";
import { useSession } from "next-auth/react";

interface ProfileClientWrapperProps {
  isNewUser: boolean;
}

export default function ProfileClientWrapper({ isNewUser }: ProfileClientWrapperProps) {
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const router = useRouter();
  const { status } = useSession();
  
  useEffect(() => {
    // Check if this is a new user and if they've just registered
    const isFromRegistration = window.location.search.includes('from=register');
    
    // Handle authentication status
    if (status === "loading") {
      // Session is still loading, wait
      return;
    }
    
    if (status === "unauthenticated" && isFromRegistration) {
      // User is coming from registration but not authenticated
      // This could happen if the auto sign-in failed
      console.log("User is not authenticated after registration, redirecting to login");
      router.push("/login?callbackUrl=/profile?from=register");
      return;
    }
    
    // For new users, always show the welcome modal when authenticated
    // For returning users, only show it if they're coming from registration
    if ((isNewUser || isFromRegistration) && status === "authenticated") {
      setShowWelcomeModal(true);
      
      // Remove the query parameter without refreshing the page if it exists
      if (isFromRegistration) {
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      }
    }
  }, [isNewUser, status, router]);
  
  return (
    <>
      {showWelcomeModal && <WelcomeModal />}
    </>
  );
} 