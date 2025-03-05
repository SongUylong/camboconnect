import { create } from 'zustand';

interface FriendState {
  friendIds: Set<string>;
  pendingRequestIds: Set<string>;
  addFriend: (friendId: string) => void;
  removeFriend: (friendId: string) => void;
  addPendingRequest: (userId: string) => void;
  removePendingRequest: (userId: string) => void;
  setInitialState: (friendIds: string[], pendingRequestIds: string[]) => void;
}

export const useFriendStore = create<FriendState>((set) => ({
  friendIds: new Set<string>(),
  pendingRequestIds: new Set<string>(),
  
  addFriend: (friendId: string) =>
    set((state) => ({
      friendIds: new Set(state.friendIds).add(friendId),
      pendingRequestIds: new Set([...state.pendingRequestIds].filter(id => id !== friendId))
    })),
    
  removeFriend: (friendId: string) =>
    set((state) => ({
      friendIds: new Set([...state.friendIds].filter(id => id !== friendId))
    })),
    
  addPendingRequest: (userId: string) =>
    set((state) => ({
      pendingRequestIds: new Set(state.pendingRequestIds).add(userId)
    })),
    
  removePendingRequest: (userId: string) =>
    set((state) => ({
      pendingRequestIds: new Set([...state.pendingRequestIds].filter(id => id !== userId))
    })),
    
  setInitialState: (friendIds: string[], pendingRequestIds: string[]) =>
    set(() => ({
      friendIds: new Set(friendIds),
      pendingRequestIds: new Set(pendingRequestIds)
    })),
})); 