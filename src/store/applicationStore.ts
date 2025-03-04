import { create } from 'zustand';

interface UnconfirmedApplication {
  opportunityId: string;
  title: string;
}

interface ApplicationState {
  appliedOpportunities: string[];
  unconfirmedApplications: UnconfirmedApplication[];
  showConfirmationModal: boolean;
  currentOpportunityId: string | null;
  currentTitle: string | null;
  setApplied: (opportunityId: string) => void;
  isApplied: (opportunityId: string) => boolean;
  addUnconfirmedApplication: (opportunityId: string, title: string) => void;
  removeUnconfirmedApplication: (opportunityId: string) => void;
  setShowConfirmationModal: (show: boolean, opportunityId?: string, title?: string) => void;
  resetState: () => void;
}

export const useApplicationStore = create<ApplicationState>((set, get) => ({
  appliedOpportunities: [],
  unconfirmedApplications: [],
  showConfirmationModal: false,
  currentOpportunityId: null,
  currentTitle: null,

  setApplied: (opportunityId: string) => {
    set((state) => ({
      appliedOpportunities: [...new Set([...state.appliedOpportunities, opportunityId])]
    }));
  },

  isApplied: (opportunityId: string) => {
    return get().appliedOpportunities.includes(opportunityId);
  },

  addUnconfirmedApplication: (opportunityId: string, title: string) => {
    set((state) => ({
      unconfirmedApplications: [...state.unconfirmedApplications, { opportunityId, title }]
    }));
  },

  removeUnconfirmedApplication: (opportunityId: string) => {
    set((state) => ({
      unconfirmedApplications: state.unconfirmedApplications.filter(app => app.opportunityId !== opportunityId)
    }));
  },

  setShowConfirmationModal: (show: boolean, opportunityId?: string, title?: string) => {
    set(() => ({
      showConfirmationModal: show,
      currentOpportunityId: opportunityId || null,
      currentTitle: title || null
    }));
  },

  resetState: () => {
    set(() => ({
      appliedOpportunities: [],
      unconfirmedApplications: [],
      showConfirmationModal: false,
      currentOpportunityId: null,
      currentTitle: null
    }));
  }
})); 