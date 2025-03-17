"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { WelcomeModal } from "./welcome-modal";
import { useSession } from "next-auth/react";
import { useFriendStore } from "@/store/use-friend-store";
import { useProfile } from "@/hooks/use-profile";

interface ProfileClientWrapperProps {
  isNewUser: boolean;
  friendIds?: string[];
}

export default function ProfileClientWrapper({ isNewUser, friendIds = [] }: ProfileClientWrapperProps) {
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const modalInitializedRef = useRef(false);
  const router = useRouter();
  const { status } = useSession();
  const { setInitialState } = useFriendStore();
  const { data: profile, isLoading: profileLoading } = useProfile();
  
  // Initialize the friend store with the user's friends
  useEffect(() => {
    if (friendIds && friendIds.length > 0) {
      setInitialState(friendIds, []);
    }
  }, [friendIds, setInitialState]);
  
  // Check if we should show the welcome modal
  useEffect(() => {
    // Don't do anything until authentication is complete and profile is loaded
    if (status === "loading" || profileLoading || modalInitializedRef.current) {
      return;
    }
    
    console.log("ProfileClientWrapper: Checking if welcome modal should be shown", {
      status,
      isNewUser,
      isSetup: profile?.isSetup
    });
    
    // Check if this is a new user and if they've just registered
    const isFromRegistration = window.location.search.includes('from=register');
    
    // Handle unauthenticated users trying to access from registration
    if (status === "unauthenticated" && isFromRegistration) {
      console.log("User is not authenticated after registration, redirecting to login");
      router.push("/login?callbackUrl=/profile?from=register");
      return;
    }
    
    // Only show the modal if:
    // 1. User is authenticated AND
    // 2. isSetup is explicitly false OR (isSetup is undefined AND (isNewUser OR isFromRegistration))
    if (status === "authenticated" && profile) {
      const shouldShowModal = profile.isSetup === false || 
                             (profile.isSetup === undefined && (isNewUser || isFromRegistration));
      
      if (shouldShowModal) {
        console.log("ProfileClientWrapper: Showing welcome modal");
        setShowWelcomeModal(true);
      } else {
        console.log("ProfileClientWrapper: Not showing welcome modal");
      }
      
      // Remove the query parameter without refreshing the page if it exists
      if (isFromRegistration) {
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      }
      
      // Mark as initialized
      modalInitializedRef.current = true;
    }
  }, [isNewUser, status, router, profile, profileLoading]);
  
  // Render the welcome modal if needed
  if (!showWelcomeModal) {
    return null;
  }
  
  return <WelcomeModal />;
} 