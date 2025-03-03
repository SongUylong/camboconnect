import { create } from 'zustand';

interface BookmarkStore {
  bookmarkedOpportunities: Set<string>;
  addBookmark: (opportunityId: string) => void;
  removeBookmark: (opportunityId: string) => void;
  isBookmarked: (opportunityId: string) => boolean;
  setInitialBookmarks: (opportunityIds: string[]) => void;
}

export const useBookmarkStore = create<BookmarkStore>((set, get) => ({
  bookmarkedOpportunities: new Set(),
  
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
  
  isBookmarked: (opportunityId: string) => {
    return get().bookmarkedOpportunities.has(opportunityId);
  },
  
  setInitialBookmarks: (opportunityIds: string[]) => {
    set({ bookmarkedOpportunities: new Set(opportunityIds) });
  },
})); 