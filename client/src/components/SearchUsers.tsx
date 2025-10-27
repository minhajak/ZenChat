import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useShallow } from "zustand/react/shallow";
import type { userforSearch } from "../types/chat.type";
import { useFriendStore } from "../store/useFriendStore";

interface StoreSlice {
  isSearching: boolean;
  searchUsers: (query: string) => void;
  searchResult: userforSearch[];
  clearSearch: () => void;
}

interface SearchUsersProps {
  className?: string;
  onClose: () => void;
}

export default function SearchUsers({
  className = "",
  onClose,
}: SearchUsersProps) {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);
  const [localUpdates, setLocalUpdates] = useState<
    Record<string, "requested" | "accepted" | "pending" | "declined">
  >({});
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Optimized: Use a shallow selector to prevent unnecessary re-renders
  const selector = useCallback(
    (state: unknown): StoreSlice => ({
      isSearching: (state as StoreSlice).isSearching,
      searchUsers: (state as StoreSlice).searchUsers,
      searchResult: (state as StoreSlice).searchResult,
      clearSearch: (state as StoreSlice).clearSearch,
    }),
    []
  );

  const { isSearching, searchUsers, searchResult, clearSearch } = useChatStore(
    useShallow(selector)
  );

  const { AcceptingFriendship, RequestingFriendship } = useFriendStore();

  const handleInputChange = useCallback(
    (value: string) => {
      setSearchQuery(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);

      const trimmed = value.trim();
      if (!trimmed) {
        clearSearch();
        return;
      }

      debounceRef.current = setTimeout(() => {
        searchUsers(trimmed);
      }, 300);
    },
    [searchUsers, clearSearch]
  );

  const clearSearchQuery = useCallback(() => {
    setSearchQuery("");
    clearSearch();
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, [clearSearch]);

  const handleSendFriendRequest = useCallback(
    async (userId: string) => {
      setLoadingUserId(userId);
      try {
        await RequestingFriendship(userId);
        // Optimistically update the UI
        setLocalUpdates((prev) => ({ ...prev, [userId]: "requested" }));
        // Force refresh search results to update friendship status
        const trimmed = searchQuery.trim();
        if (trimmed) {
          // Small delay to ensure backend has updated
          setTimeout(() => {
            searchUsers(trimmed);
          }, 100);
        }
      } catch (error) {
        console.error("Failed to send friend request:", error);
        // Revert optimistic update on error
        setLocalUpdates((prev) => {
          const updated = { ...prev };
          delete updated[userId];
          return updated;
        });
      } finally {
        setLoadingUserId(null);
      }
    },
    [RequestingFriendship, searchQuery, searchUsers]
  );

  const handleAcceptFriendRequest = useCallback(
    async (userId: string) => {
      setLoadingUserId(userId);
      try {
        await AcceptingFriendship(userId);
        // Optimistically update the UI
        setLocalUpdates((prev) => ({ ...prev, [userId]: "accepted" }));
        // Force refresh search results to update friendship status
        const trimmed = searchQuery.trim();
        if (trimmed) {
          // Small delay to ensure backend has updated
          setTimeout(() => {
            searchUsers(trimmed);
          }, 100);
        }
      } catch (error) {
        console.error("Failed to accept friend request:", error);
        // Revert optimistic update on error
        setLocalUpdates((prev) => {
          const updated = { ...prev };
          delete updated[userId];
          return updated;
        });
      } finally {
        setLoadingUserId(null);
      }
    },
    [AcceptingFriendship, searchQuery, searchUsers]
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose]
  );

  const hasResults = searchResult.length > 0;
  const hasQuery = !!searchQuery.trim();

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${className}`}
      onClick={handleBackdropClick}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      <div className="relative bg-base-100 rounded-lg border border-base-300 shadow-2xl max-w-md w-full max-h-[80vh] flex flex-col">
        <div className="p-4 border-b border-base-300">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Find New Users</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-base-200 rounded-lg transition-colors"
              aria-label="Close search"
            >
              <X className="w-5 h-5 text-zinc-400" />
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => handleInputChange(e.target.value)}
              className="w-full pl-10 pr-10 py-2 bg-base-200 border border-base-300 rounded-lg focus:outline-none focus:border-primary text-sm"
              autoFocus
              aria-label="Search users"
            />
            {searchQuery && (
              <button
                onClick={clearSearchQuery}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="overflow-y-auto flex-1">
          {isSearching ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="sr-only">Searching...</span>
            </div>
          ) : hasResults ? (
            <div className="divide-y divide-base-300" role="list">
              {searchResult.map((user) => {
                const isUserLoading = loadingUserId === user.id;
                // Use local update if available, otherwise use the server status
                const currentStatus =
                  localUpdates[user.id] || user.friendshipStatus;

                // Determine if the logged-in user is the requester
                const isPendingRequest =
                  currentStatus === "pending" && (user as any).isRequester;
                const isIncomingRequest =
                  currentStatus === "pending" && !(user as any).isRequester;

                return (
                  <div
                    key={user.id}
                    className="p-4 hover:bg-base-200 transition-colors flex items-center gap-3"
                    role="listitem"
                  >
                    <img
                      src={(user.profileImage || "/avatar.png") as string}
                      alt={`${user.fullName}'s profile`}
                      className="size-12 object-cover rounded-full"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{user.fullName}</p>
                      {user.email && (
                        <p className="text-sm text-zinc-400 truncate">
                          {user.email}
                        </p>
                      )}
                    </div>

                    {currentStatus === "accepted" ? (
                      <span className="px-3 py-1.5 bg-success/20 text-success rounded-lg text-sm">
                        Friends
                      </span>
                    ) : isIncomingRequest ? (
                      <button
                        onClick={() => handleAcceptFriendRequest(user.id)}
                        disabled={isUserLoading}
                        className="px-3 py-1.5 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm text-primary-content flex items-center gap-1"
                        aria-label={`Accept request from ${user.fullName}`}
                      >
                        {isUserLoading ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Accepting...
                          </>
                        ) : (
                          "Accept"
                        )}
                      </button>
                    ) : isPendingRequest || currentStatus === "requested" ? (
                      <span className="px-3 py-1.5 bg-warning/20 text-warning rounded-lg text-sm">
                        Pending
                      </span>
                    ) : (
                      <button
                        onClick={() => handleSendFriendRequest(user.id)}
                        disabled={isUserLoading}
                        className="px-3 py-1.5 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm text-primary-content flex items-center gap-1"
                        aria-label={`Add ${user.fullName}`}
                      >
                        {isUserLoading ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Adding...
                          </>
                        ) : (
                          "Add"
                        )}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : hasQuery ? (
            <div className="text-center text-zinc-500 py-8" role="alert">
              No users found for "{searchQuery}"
            </div>
          ) : (
            <div className="text-center text-zinc-500 py-8">
              Start typing to search
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
