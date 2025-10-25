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

  setSelectedUser: (selectedUser) => set({ selectedUser: selectedUser }),

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
    const { selectedUser, users } = get();

    if (!selectedUser) return;
    const socket = useStoreAuth.getState().socket;

    socket.on("newMessage", (newMessage: MessageType) => {
      if (newMessage.senderId !== selectedUser.id) return;

      set({ messages: [...get().messages, newMessage] });

      // Update the latest message for the user
      set({
        users: users.map((user) =>
          user?.id === selectedUser.id
            ? { ...user, latestMessage: newMessage }
            : user
        ),
      });
    });
  },

  unsubscribeToMessages: () => {
    const socket = useStoreAuth.getState().socket;
    socket.off("newMessage");
  },
}));