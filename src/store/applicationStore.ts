import { create } from 'zustand';

interface ApplicationState {
  appliedOpportunities: string[];
  showConfirmationModal: boolean;
  currentOpportunityId: string | null;
  setApplied: (opportunityId: string) => void;
  setShowConfirmationModal: (show: boolean, opportunityId?: string) => void;
}

export const useApplicationStore = create<ApplicationState>((set) => ({
  appliedOpportunities: [],
  showConfirmationModal: false,
  currentOpportunityId: null,

  setApplied: (opportunityId: string) => {
    set((state) => ({
      appliedOpportunities: [...state.appliedOpportunities, opportunityId]
    }));
  },

  setShowConfirmationModal: (show: boolean, opportunityId?: string) => {
    set(() => ({
      showConfirmationModal: show,
      currentOpportunityId: opportunityId || null
    }));
  }
})); 