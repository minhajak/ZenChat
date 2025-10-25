import type { userType } from "./auth.type";

export interface MessageType {
  _id: string;
  senderId: string;
  receiverId: string;
  text: string;
  createdAt: string;
  image: string | ArrayBuffer;
}

export type UserType = Pick<userType,
  "id" | "email" | "profileImage" | "fullName"
>;

export type userTypeWithLatestMessage = Pick<UserType,
  "id" | "email" | "fullName" | "profileImage"
> & {
  latestMessage: MessageType | null;
};

export type getUsersResponseType = {
  users: userTypeWithLatestMessage[];
};

export type sendMessageResponseType = {
  messages: MessageType;
};

export type getMessagesResponseType = {
  messages: MessageType[];
};

export interface ChatState {
  messages: MessageType[];
  users: userTypeWithLatestMessage[];
  selectedUser: userTypeWithLatestMessage | null;
  isUsersLoading: boolean;
  isMessagesLoading: boolean;
  getUsers: () => Promise<void>;
  getMessages: (userId: string) => Promise<void>;
  setSelectedUser: (selectedUser: userTypeWithLatestMessage | null) => void;
  sentMessages: (messageData: {
    text: string;
    image: ArrayBuffer;
  }) => Promise<void>;
  subscribeToMessages: () => void;
  unsubscribeToMessages: () => void;
}