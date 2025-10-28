import type { userType } from "./auth.type";

export interface MessageType {
  _id: string;
  senderId: string;
  receiverId: string;
  text: string;
  createdAt: string;
  seen: boolean;
  image: string | File;
}

export type UserType = Pick<
  userType,
  "id" | "email" | "profileImage" | "fullName"
>;

export type userTypeWithLatestMessage = Pick<
  UserType,
  "id" | "email" | "fullName" | "profileImage"
> & {
  latestMessage: MessageType | null;
  unseenCount: number;
  lastSeen: string | null;
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

export type userforSearch = Pick<
  userType,
  "id" | "email" | "fullName" | "profileImage"
> & {
  friendshipStatus: "accepted" | "pending" | "declined" | "blocked" | null;
  isRequester: boolean;
};
export type getSearchUserResponseType = {
  users: userforSearch[];
};

export interface ChatState {
  messages: MessageType[];
  users: userTypeWithLatestMessage[];
  searchResult: userforSearch[] | never[];
  selectedUser: userTypeWithLatestMessage | null;
  isUsersLoading: boolean;
  isMessagesLoading: boolean;
  isSearching: boolean;
  getUsers: () => Promise<void>;
  getMessages: (userId: string) => Promise<void>;
  setSelectedUser: (selectedUser: userTypeWithLatestMessage | null) => void;
  sentMessages: (messageData: FormData) => Promise<void>;
  subscribeToMessages: () => void;
  unsubscribeToMessages: () => void;
  markAsSeen: (id: string) => void;
  deleteConversation: (userId: string) => Promise<void>;
  searchUsers: (query: string) => Promise<void>;
  clearSearch: () => void;
}
