// Updated useFriendStore with implemented DeclingFriendship
import { create } from "zustand";
import type {
  FriendState,
  getSuggestionsResponseType,
  invite,
  inviteResponseType,
} from "../types/friend.type";
import { client } from "../lib/axios";
import toast from "react-hot-toast";
import { useChatStore } from "./useChatStore";
import { useStoreAuth } from "./useStoreAuth";
export const useFriendStore = create<FriendState>((set, get) => ({
  invites: null,
  suggestions: null,
  isAcceptingFriendship: false,
  isDeclingFriendship: false,
  isRemovingFriendship: false,
  isRequestingFriendship: false,
  isGettingInvites: false,
  isGettingSuggestions: false,
  inviteHandler: null,
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
            ),
          },
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
      set((state) => {
        if (!state.invites) return state;

        return {
          invites: {
            ...state.invites,
            invites: state.invites.invites.filter(
              (invite) => invite.requester.id !== userId
            ),
            pagination: {
              ...state.invites.pagination,
              totalCount: state.invites.pagination.totalCount - 1,
            },
          },
        };
      });
      useChatStore.getState().getUsers();
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
      set((state) => {
        if (!state.invites) return state;

        return {
          invites: {
            ...state.invites,
            invites: state.invites.invites.filter(
              (invite) => invite.requester.id !== userId
            ),
            pagination: {
              ...state.invites.pagination,
              totalCount: state.invites.pagination.totalCount - 1,
            },
          },
        };
      });
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
  getInvites: async (page = 1, limit = 5) => {
    set({ isGettingInvites: true });
    try {
      const res = await client.get<inviteResponseType>(
        `/api/friend/invites?page=${page}&limit=${limit}`
      );
      set({ invites: res.data });
    } catch (error: any) {
      console.log(error);
      toast.error(error.response?.data?.message ?? "Error getting invites");
    } finally {
      set({ isGettingInvites: false });
    }
  },
  getSuggestions: async (page = 1, limit = 5) => {
    set({ isGettingSuggestions: true });

    try {
      const res = await client.get<getSuggestionsResponseType>(
        `/api/friend/suggestions?page=${page}&limit=${limit}`
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
  subscribeToInvites: () => {
    const socket = useStoreAuth.getState().socket;

    if (!socket) {
      console.error("Socket not available");
      return;
    }

    // Handler function (store reference for cleanup)
    const handleNewInvite = (invite: invite) => {
      set((state) => {
        // If invites is null, initialize it
        if (!state.invites) {
          return {
            invites: {
              invites: [invite],
              pagination: {
                currentPage: 1,
                totalPages: 1,
                totalCount: 1,
                limit: 10,
                hasNextPage: false,
                hasPrevPage: false,
              },
            },
          };
        }

        // Add new invite to the beginning of the list
        return {
          invites: {
            ...state.invites,
            invites: [invite, ...state.invites.invites],
            pagination: {
              ...state.invites.pagination,
              totalCount: state.invites.pagination.totalCount + 1,
            },
          },
        };
      });

      // Show notification (optional)
      toast.success(`New friend request from ${invite.requester.fullName}`);
    };

    // Listen for new invites
    socket.on("newInvites", handleNewInvite);

    // Store the handler for cleanup
    set({ inviteHandler: handleNewInvite });
  },

  unsubscribeToInvites: () => {
    const socket = useStoreAuth.getState().socket;
    const { inviteHandler } = get();

    if (socket && inviteHandler) {
      socket.off("newInvites", inviteHandler);
      set({ inviteHandler: null });
    }
  },
}));
