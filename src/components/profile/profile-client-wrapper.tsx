"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { WelcomeModal } from "./welcome-modal";
import { useSession } from "next-auth/react";
import { useFriendStore } from "@/store/use-friend-store";

interface ProfileClientWrapperProps {
  isNewUser: boolean;
  friendIds?: string[];
}

export default function ProfileClientWrapper({ isNewUser, friendIds = [] }: ProfileClientWrapperProps) {
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const router = useRouter();
  const { status } = useSession();
  const { setInitialState } = useFriendStore();
  
  // Run this effect only once on component mount
  useEffect(() => {
    // Don't do anything until authentication is complete
    if (status === "loading") {
      return;
    }
    
    // Check if this is a new user and if they've just registered
    const isFromRegistration = window.location.search.includes('from=register');
    
    // Handle unauthenticated users trying to access from registration
    if (status === "unauthenticated" && isFromRegistration) {
      console.log("User is not authenticated after registration, redirecting to login");
      router.push("/login?callbackUrl=/profile?from=register");
      return;
    }
    
    // Check if we've already shown the welcome modal in this session
    const hasShownModal = localStorage.getItem('welcomeModalShown') === 'true';
    
    // Only show the modal if:
    // 1. User is authenticated AND
    // 2. Either they are a new user OR they're coming from registration AND
    // 3. We haven't shown the modal already
    if (status === "authenticated" && (isNewUser || isFromRegistration) && !hasShownModal) {
      setShowWelcomeModal(true);
      
      // Remove the query parameter without refreshing the page if it exists
      if (isFromRegistration) {
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      }
    }
  }, [isNewUser, status, router]); // Only depend on these values
  
  // Initialize the friend store with the user's friends
  useEffect(() => {
    if (friendIds && friendIds.length > 0) {
      setInitialState(friendIds, []);
    }
  }, [friendIds, setInitialState]);
  
  return showWelcomeModal ? <WelcomeModal /> : null;
} 