import { create } from 'zustand';

interface BookmarkStore {
  // Core state
  bookmarkedOpportunities: Set<string>;
  
  // Actions
  addBookmark: (opportunityId: string) => void;
  removeBookmark: (opportunityId: string) => void;
  toggleBookmark: (opportunityId: string) => void;
  isBookmarked: (opportunityId: string) => boolean;
  setInitialBookmarks: (opportunityIds: string[]) => void;
  
  // UI state tracking
  pendingBookmarks: Set<string>; // Opportunities with pending bookmark operations
  addPendingBookmark: (opportunityId: string) => void;
  removePendingBookmark: (opportunityId: string) => void;
  isPendingBookmark: (opportunityId: string) => boolean;
  
  // Reset state (useful for logout)
  reset: () => void;
}

export const useBookmarkStore = create<BookmarkStore>((set, get) => ({
  // Core state
  bookmarkedOpportunities: new Set(),
  pendingBookmarks: new Set(),
  
  // Actions for bookmarks
  addBookmark: (opportunityId: string) => {
    set((state) => ({
      bookmarkedOpportunities: new Set([...state.bookmarkedOpportunities, opportunityId])
    }));
  },
  
  removeBookmark: (opportunityId: string) => {
    set((state) => {
      const newBookmarks = new Set(state.bookmarkedOpportunities);
      newBookmarks.delete(opportunityId);
      return { bookmarkedOpportunities: newBookmarks };
    });
  },
  
  toggleBookmark: (opportunityId: string) => {
    const isCurrentlyBookmarked = get().isBookmarked(opportunityId);
    if (isCurrentlyBookmarked) {
      get().removeBookmark(opportunityId);
    } else {
      get().addBookmark(opportunityId);
    }
  },
  
  isBookmarked: (opportunityId: string) => {
    return get().bookmarkedOpportunities.has(opportunityId);
  },
  
  setInitialBookmarks: (opportunityIds: string[]) => {
    set({ bookmarkedOpportunities: new Set(opportunityIds) });
  },
  
  // Actions for pending state
  addPendingBookmark: (opportunityId: string) => {
    set((state) => ({
      pendingBookmarks: new Set([...state.pendingBookmarks, opportunityId])
    }));
  },
  
  removePendingBookmark: (opportunityId: string) => {
    set((state) => {
      const newPending = new Set(state.pendingBookmarks);
      newPending.delete(opportunityId);
      return { pendingBookmarks: newPending };
    });
  },
  
  isPendingBookmark: (opportunityId: string) => {
    return get().pendingBookmarks.has(opportunityId);
  },
  
  // Reset state
  reset: () => {
    set({
      bookmarkedOpportunities: new Set(),
      pendingBookmarks: new Set(),
    });
  },
})); 