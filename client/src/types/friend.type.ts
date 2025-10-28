import type { userType } from "./auth.type";

export type requester = Pick<
  userType,
  "id" | "email" | "fullName" | "profileImage"
>;

export type invite = {
  id: string;
  requester: requester;
  status: string;
  createdAt: Date | string;
};
export type inviteResponseType = {
  invites: invite[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
};
export type getSuggestionsResponseType = {
  suggestions: requester[];
  page: number;
  limit: number;
  totalPages: number;
  totalCount: number;
};

export interface FriendState {
  invites: inviteResponseType | null;
  suggestions: getSuggestionsResponseType | null;
  inviteHandler: ((invite: invite) => void) | null;
  isRequestingFriendship: boolean;
  isDeclingFriendship: boolean;
  isRemovingFriendship: boolean;
  isAcceptingFriendship: boolean;
  isGettingInvites: boolean;
  isGettingSuggestions: boolean;
  RequestingFriendship: (userId: string) => void;
  AcceptingFriendship: (userId: string) => void;
  DeclingFriendship: (userId: string) => void;
  RemovingFriendship: (userId: string) => void;
  getInvites: (page: number, limit: number) => void;
  getSuggestions: (page: number, limit: number) => void;
  subscribeToInvites: () => void;
  unsubscribeToInvites: () => void;
}
