"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface ApplicationContextType {
  showConfirmationModal: boolean;
  setShowConfirmationModal: (show: boolean) => void;
  currentOpportunity: {
    id: string;
    title: string;
  } | null;
  setCurrentOpportunity: (opportunity: { id: string; title: string; } | null) => void;
}

const ApplicationContext = createContext<ApplicationContextType | undefined>(undefined);

export function ApplicationProvider({ children }: { children: ReactNode }) {
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [currentOpportunity, setCurrentOpportunity] = useState<{ id: string; title: string; } | null>(null);

  return (
    <ApplicationContext.Provider 
      value={{ 
        showConfirmationModal, 
        setShowConfirmationModal,
        currentOpportunity,
        setCurrentOpportunity
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