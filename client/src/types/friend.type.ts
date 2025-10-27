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
};

export type getSuggestionsResponseType = {
  suggestions: requester[];
  page: number;
  limit: number;
  totalPages: number;
  totalCount: number;
};

export interface FriendState {
  invites: invite[] | null;
  suggestions: getSuggestionsResponseType | null;
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
  getInvites: () => void;
  getSuggestions: (pageNumber: number) => void;
}
