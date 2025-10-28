import { create } from "zustand";
import { client } from "../lib/axios";
import toast from "react-hot-toast";
import { useStoreAuth } from "./useStoreAuth";
import type {
  ChatState,
  getMessagesResponseType,
  getSearchUserResponseType,
  getUsersResponseType,
  MessageType,
  sendMessageResponseType,
} from "../types/chat.type";

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  users: [],
  searchResult: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isSearching: false,

  setSelectedUser: (selectedUser) => {
    const { users } = get();
    set({ selectedUser: selectedUser });

    // Mark messages as seen if there are unseen messages
    if (selectedUser && selectedUser.unseenCount > 0) {
      get().markAsSeen(selectedUser.id);
    }

    // Update the user's unseen count to 0 in the local state immediately
    set({
      users: users.map((user) => {
        if (user?.id === selectedUser?.id) {
          return {
            ...user,
            unseenCount: 0,
          };
        }
        return user;
      }),
    });
  },
  getUsers: async () => {
    try {
      set({ isUsersLoading: true });
      const res = await client.get<getUsersResponseType>("/api/message/users");
      console.log(res.data.users);
      set({ users: res.data.users });
    } catch (error: any) {
      // toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },
  deleteConversation: async (userId) => {
    try {
      await client.delete(`/api/message/conversation/${userId}`);

      // Clear messages if this is the selected user
      const { selectedUser } = get();
      if (selectedUser?.id === userId) {
        set({ messages: [] });
      }

      // Update users list - remove latest message
      set({
        users: get().users.map((user) =>
          user?.id === userId
            ? { ...user, latestMessage: null, unseenCount: 0 }
            : user
        ),
      });

      toast.success("Conversation deleted successfully");
    } catch (error: any) {
      console.error("Error deleting conversation:", error);
      toast.error("Failed to delete conversation");
    }
  },

  getMessages: async (userId) => {
    try {
      set({ isMessagesLoading: true });
      const res = await client.get<getMessagesResponseType>(
        `/api/message/${userId}`
      );
      set({ messages: res.data.messages });
    } catch (error: any) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

sentMessages: async (messageData: FormData) => {
  const { selectedUser, messages, users } = get();
  const authUser = useStoreAuth.getState().authUser;
  
  try {
    // Extract data from FormData for optimistic update
    const text = messageData.get("text") as string;
    const imageFile = messageData.get("image") as File | null;
    console.log(text)
    
    // Create preview URL for optimistic image display
    let imagePreview = null;
    if (imageFile) {
      imagePreview = URL.createObjectURL(imageFile);
    }

    // Create optimistic message (temporary message shown immediately)
    const optimisticMessage: MessageType = {
      _id: `temp-${Date.now()}`, // Temporary ID
      senderId: authUser?.id as string, // Current user is sender
      receiverId: selectedUser?.id as string, // Selected user is receiver
      createdAt: new Date().toISOString(),
      image: imagePreview as string, // Use preview URL temporarily
      text: text || "",
      seen: false,
    };

    // Optimistically update UI
    set({ messages: [...messages, optimisticMessage] });

    // Send to server
    const res = await client.post<sendMessageResponseType>(
      `/api/message/send/${selectedUser?.id}`,
      messageData
    );

    const newMessage = res.data.messages;

    // Clean up the preview URL
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    // Replace optimistic message with real message from server
    set({ 
      messages: [
        ...messages.filter(m => m._id !== optimisticMessage._id),
        newMessage
      ] 
    });

    // Update latest message for the selected user
    set({
      users: [
        // Selected user with updated data at top
        ...users
          .filter((user) => user?.id === selectedUser?.id)
          .map((user) => ({
            ...user,
            latestMessage: newMessage,
          })),
        // All other users
        ...users.filter((user) => user?.id !== selectedUser?.id),
      ],
    });
  } catch (error: any) {
    // Remove optimistic message on error
    set({ messages: messages }); // Revert to original messages
    toast.error(error.response?.data?.message || "Error sending message");
    console.error("Error sending message:", error);
  }
},

  subscribeToMessages: () => {
    const socket = useStoreAuth.getState().socket;

    socket.on("newMessage", (newMessage: MessageType) => {
      const { selectedUser, users, messages } = get();
      const authUserId = useStoreAuth.getState().authUser?.id;

      // Determine if this message is from the currently selected user
      const isMessageFromSelectedUser =
        newMessage.senderId === selectedUser?.id;

      // Add message to current chat if it's from the selected user
      if (isMessageFromSelectedUser) {
        set({ messages: [...messages, newMessage] });
        // Mark as seen immediately since chat is open
        get().markAsSeen(selectedUser.id);
      }

      // Determine the conversation partner (the other person, not the logged-in user)
      const conversationPartnerId =
        newMessage.senderId === authUserId
          ? newMessage.receiverId
          : newMessage.senderId;

      // Update users list with latest message and unseen count
      set({
        users: users.map((user) => {
          // Only update the conversation partner's entry
          if (user?.id === conversationPartnerId) {
            // Check if this is an incoming message (not sent by current user)
            const isIncomingMessage = newMessage.senderId === user.id;

            // Increment unseen count only if:
            // 1. Message is incoming (from this user)
            // 2. Chat with this user is not currently open
            const shouldIncrementUnseen =
              isIncomingMessage && !isMessageFromSelectedUser;

            return {
              ...user,
              latestMessage: newMessage,
              unseenCount: shouldIncrementUnseen
                ? user.unseenCount + 1
                : user.unseenCount,
            };
          }
          return user;
        }),
      });
    });
  },

  unsubscribeToMessages: () => {
    const socket = useStoreAuth.getState().socket;
    socket.off("newMessage");
  },

  markAsSeen: async (id: string) => {
    try {
      await client.put(`/api/message/mark-seen/${id}`);
    } catch (error) {
      toast.error("error marking the message");
    }
  },
  searchUsers: async (query: string) => {
    const trimmed = query.trim();
    set({ isSearching: true });

    // Show empty state while searching (only if query exists)
    if (trimmed) {
      set({ searchResult: [] });
    }

    try {
      if (!trimmed) {
        set({ searchResult: [], isSearching: false });
        return;
      }

      const res = await client.get<getSearchUserResponseType>(
        `/api/auth/search/${encodeURIComponent(trimmed)}`
      );

      console.log(res.data.users)
      set({ searchResult: res.data.users || [] });
    } catch (error: any) {
      console.error("Search error:", error);
      set({ searchResult: [] });
      toast.error(error.response?.data?.message || "Search failed");
    } finally {
      set({ isSearching: false });
    }
  },

  // New: Clear search results
  clearSearch: () => {
    set({ searchResult: [], isSearching: false });
  },
}));
