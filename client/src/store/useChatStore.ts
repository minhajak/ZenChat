import { create } from "zustand";
import { client } from "../lib/axios";
import toast from "react-hot-toast";
import { useStoreAuth } from "./useStoreAuth";
import type {
  ChatState,
  getMessagesResponseType,
  getUsersResponseType,
  MessageType,
  sendMessageResponseType,
} from "../types/chat.type";

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

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
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
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

  sentMessages: async (messageData) => {
    const { selectedUser, messages, users } = get();
    try {
      const res = await client.post<sendMessageResponseType>(
        `/api/message/send/${selectedUser?.id}`,
        messageData
      );

      const newMessage = res.data.messages;

      set({ messages: [...messages, newMessage] });

      // Update latest message for the selected user
      set({
        users: users.map((user) =>
          user?.id === selectedUser?.id
            ? { ...user, latestMessage: newMessage }
            : user
        ),
      });
    } catch (error: any) {
      toast.error("error sending message");
    }
  },

  subscribeToMessages: () => {
  const socket = useStoreAuth.getState().socket;

  socket.on("newMessage", (newMessage: MessageType) => {
    const { selectedUser, users, messages } = get();
    const authUserId = useStoreAuth.getState().authUser?.id;

    // Determine if this message is from the currently selected user
    const isMessageFromSelectedUser = newMessage.senderId === selectedUser?.id;

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
}));
