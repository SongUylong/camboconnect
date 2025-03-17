"use client";

import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from "react";

interface ApplicationContextType {
  showConfirmationModal: boolean;
  setShowConfirmationModal: (show: boolean) => void;
  currentOpportunity: {
    id: string;
    title: string;
  } | null;
  setCurrentOpportunity: (opportunity: { id: string; title: string; } | null) => void;
  resetModalState: () => void;
}

const ApplicationContext = createContext<ApplicationContextType | undefined>(undefined);

export function ApplicationProvider({ children }: { children: ReactNode }) {
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [currentOpportunity, setCurrentOpportunity] = useState<{ id: string; title: string; } | null>(null);

  // Function to reset the modal state
  const resetModalState = useCallback(() => {
    console.log("Resetting modal state");
    // Use a timeout to ensure the state is updated after any pending state updates
    setTimeout(() => {
      setShowConfirmationModal(false);
      setCurrentOpportunity(null);
    }, 0);
  }, []);

  // Debug logging
  useEffect(() => {
    console.log("Modal state:", { showConfirmationModal, currentOpportunity });
  }, [showConfirmationModal, currentOpportunity]);

  return (
    <ApplicationContext.Provider 
      value={{ 
        showConfirmationModal, 
        setShowConfirmationModal,
        currentOpportunity,
        setCurrentOpportunity,
        resetModalState
      }}
    >
      {children}
    </ApplicationContext.Provider>
  );
}

export function useApplication() {
  const context = useContext(ApplicationContext);
  if (context === undefined) {
    throw new Error("useApplication must be used within an ApplicationProvider");
  }
  return context;
} 