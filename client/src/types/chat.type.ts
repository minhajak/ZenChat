import type { userType } from "./auth.type";

export interface MessageType {
  _id: string;
  senderId: string;
  receiverId: string;
  text: string;
  createdAt: string;
  image: string | ArrayBuffer;
}
export type UserType = Pick<
  userType,
  "id" | "email" | "profileImage" | "fullName"
>;

export type getUsersResponseType = {
  users: UserType[];
};

export type sendMessageResponseType = {
  messages: MessageType;
};

export type getMessagesResponseType = {
  messages: MessageType[];
};

export interface ChatState {
  messages: MessageType[];
  users: UserType[];
  selectedUser: UserType | null;
  isUsersLoading: boolean;
  isMessagesLoading: boolean;
  getUsers: () => Promise<void>;
  getMessages: (userId: string) => Promise<void>;
  setSelectedUser: (selectedUser: UserType | null) => void;
  sentMessages: (messageData: {
    text: string;
    image: ArrayBuffer;
  }) => Promise<void>;
  subscribeToMessages: () => void;
  unsubscribeToMessages: () => void;
}