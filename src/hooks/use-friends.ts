import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

interface Friend {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImage: string | null;
  bio: string | null;
}

interface FriendRequest {
  id: string;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    profileImage: string | null;
  };
}

// Query keys
export const friendKeys = {
  all: ['friends'] as const,
  requests: ['friends', 'requests'] as const,
};

// API functions
const friendsApi = {
  getFriends: async () => {
    const { data } = await apiClient.get<{ friends: Friend[] }>('/api/friends');
    return data.friends;
  },

  getFriendRequests: async () => {
    const { data } = await apiClient.get<{ requests: FriendRequest[] }>('/api/friends/requests');
    return data.requests;
  },

  acceptFriendRequest: async (requestId: string) => {
    const { data } = await apiClient.post(`/api/friends/requests/${requestId}`);
    return data;
  },

  declineFriendRequest: async (requestId: string) => {
    const { data } = await apiClient.delete(`/api/friends/requests/${requestId}`);
    return data;
  },

  removeFriend: async (friendId: string) => {
    const { data } = await apiClient.delete(`/api/friends?friendId=${friendId}`);
    return data;
  },
};

// React Query hooks
export function useFriends() {
  return useQuery({
    queryKey: friendKeys.all,
    queryFn: friendsApi.getFriends,
  });
}

export function useFriendRequests() {
  return useQuery({
    queryKey: friendKeys.requests,
    queryFn: friendsApi.getFriendRequests,
  });
}

export function useAcceptFriendRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: friendsApi.acceptFriendRequest,
    onSuccess: () => {
      // Invalidate and refetch friends and requests
      queryClient.invalidateQueries({ queryKey: friendKeys.all });
      queryClient.invalidateQueries({ queryKey: friendKeys.requests });
    },
  });
}

export function useDeclineFriendRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: friendsApi.declineFriendRequest,
    onSuccess: () => {
      // Invalidate and refetch requests
      queryClient.invalidateQueries({ queryKey: friendKeys.requests });
    },
  });
}

export function useRemoveFriend() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: friendsApi.removeFriend,
    onSuccess: () => {
      // Invalidate and refetch friends
      queryClient.invalidateQueries({ queryKey: friendKeys.all });
    },
  });
} 