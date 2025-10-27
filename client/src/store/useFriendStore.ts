// Updated useFriendStore with implemented DeclingFriendship
import { create } from "zustand";
import type {
  FriendState,
  getSuggestionsResponseType,
  inviteResponseType,
} from "../types/friend.type";
import { client } from "../lib/axios";
import toast from "react-hot-toast";

export const useFriendStore = create<FriendState>((set, get) => ({
  invites: [],
  suggestions: null,
  isAcceptingFriendship: false,
  isDeclingFriendship: false,
  isRemovingFriendship: false,
  isRequestingFriendship: false,
  isGettingInvites: false,
  isGettingSuggestions: false,
RequestingFriendship: async (userId) => {
    set({ isRequestingFriendship: true });
    try {
      await client.post(`/api/friend/${userId}`);
      toast.success("Successfully created friend request");
      
      // Remove the user from suggestions after sending request
      set((state) => {
        if (!state.suggestions) return state;
        
        return {
          suggestions: {
            ...state.suggestions,
            suggestions: state.suggestions.suggestions.filter(
              (user) => user.id !== userId
            )
          }
        };
      });
    } catch (error: any) {
      console.log(error);
      toast.error(
        error.response?.data?.message ?? "Error creating friend request"
      );
    } finally {
      set({ isRequestingFriendship: false });
    }
  },
  AcceptingFriendship: async (userId) => {
    set({ isAcceptingFriendship: true });
    try {
      await client.put(`/api/friend/${userId}`);
      toast.success("Successfully accepted friend request");
      // Refetch invites to update list
      get().getInvites();
    } catch (error: any) {
      console.log(error);
      toast.error(
        error.response.data.message ?? "Error accepting friend request"
      );
    } finally {
      set({ isAcceptingFriendship: false });
    }
  },
  DeclingFriendship: async (userId) => {
    set({ isDeclingFriendship: true });
    try {
      await client.put(`/api/friend/reject/${userId}`);
      toast.success("Friend request declined");
      // Refetch invites to update list
      get().getInvites();
    } catch (error: any) {
      console.log(error);
      toast.error(
        error.response.data.message ?? "Error declining friend request"
      );
    } finally {
      set({ isDeclingFriendship: false });
    }
  },
  RemovingFriendship: async (userId) => {
    set({ isRemovingFriendship: true });
    try {
      await client.delete(`/api/friend/${userId}`); // Assuming same endpoint for remove
      toast.success("Friendship removed");
      // Refetch relevant data if needed
    } catch (error: any) {
      console.log(error);
      toast.error(error.response.data.message ?? "Error removing friendship");
    } finally {
      set({ isRemovingFriendship: false });
    }
  },
  getInvites: async () => {
    set({ isGettingInvites: true });
    try {
      const res = await client.get<inviteResponseType>(`/api/friend/invites`);
      set({ invites: res.data.invites });
      console.log(res.data.invites);
    } catch (error: any) {
      console.log(error);
      toast.error(error.response?.data?.message ?? "Error getting invites");
    } finally {
      set({ isGettingInvites: false });
    }
  },
  getSuggestions: async (pageNumber) => {
    set({ isGettingSuggestions: true });
   
    try {
      const res = await client.get<getSuggestionsResponseType>(
        `/api/friend/suggestions?page=${pageNumber}`
      );
      console.log(res.data);
      set({ suggestions: res.data });

    } catch (error: any) {
      toast.error(
        error.response?.data?.message ?? "Error getting friend suggestions"
      );
    } finally {
      set({ isGettingSuggestions: false });
    }
  },
}));
