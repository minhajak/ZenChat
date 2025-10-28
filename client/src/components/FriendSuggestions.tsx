import React, { useState, useEffect } from "react";
import { useFriendStore } from "../store/useFriendStore";
import { UserPlus, Loader2, Plus } from "lucide-react";
import toast from "react-hot-toast";
import type { requester } from "../types/friend.type";
import Pagination from "./Pagination";

interface SuggestionItemProps {
  user: requester;
  onAddFriend: (userId: string) => Promise<void>;
  isLoading: boolean;
}

const SuggestionItem: React.FC<SuggestionItemProps> = ({
  user,
  onAddFriend,
  isLoading,
}) => {
  const handleAddFriend = async () => {
    await onAddFriend(user.id);
  };

  return (
    <div className="p-4 hover:bg-base-200 transition-colors border-b border-base-300 last:border-b-0">
      <div className="flex items-center justify-between gap-3">
        {/* Avatar and User Info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Avatar */}
          <div className="avatar ">
            <div className="w-12 h-12 rounded-full">
              <img
                src={(user.profileImage || "/avatar.png") as string}
                alt={user.fullName}
                className="object-cover"
              />
            </div>
          </div>

          {/* User Info */}
          <div className="flex flex-col justify-start items-start">
            <p className="font-medium truncate">{user.fullName}</p>
            <p className="text-sm text-base-content/60 truncate">
              {user.email}
            </p>
          </div>
        </div>

        {/* Action Button */}
        <>
          <button
            onClick={handleAddFriend}
            disabled={isLoading}
            className="btn btn-primary btn-sm gap-1"
            title="Add friend"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add</span>
              </>
            )}
          </button>
        </>
      </div>
    </div>
  );
};

export default function FriendSuggestions() {
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);
  const {
    suggestions,
    getSuggestions,
    isGettingSuggestions,
    RequestingFriendship,
  } = useFriendStore();
  const safeSuggestions: requester[] = suggestions?.suggestions || [];
  const totalPages = suggestions?.totalPages || 0;
  const totalCount = suggestions?.totalCount || 0;

  useEffect(() => {
    getSuggestions(currentPage,5);
  }, [currentPage, getSuggestions]);

  const handleAddFriend = async (userId: string) => {
    try {
      setLoadingUserId(userId);
      await RequestingFriendship(userId);
    } catch (error) {
      toast.error("Failed to send friend request");
    } finally {
      setLoadingUserId(null);
    }
  };

  const isEmptyState =
    safeSuggestions.length === 0 && !isGettingSuggestions && currentPage === 1;

  return (
    <div className="w-full h-full flex flex-col bg-base-100">
      {/* Header */}
      <div className="p-4 border-b border-base-300">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <UserPlus className="w-6 h-6 text-primary" />
          Friend Suggestions
          {totalCount > 0 && (
            <span className="badge badge-primary">{totalCount}</span>
          )}
        </h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {isGettingSuggestions ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="sr-only">Loading...</span>
          </div>
        ) : isEmptyState ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-16 h-16 bg-base-200 rounded-full flex items-center justify-center mb-4">
              <UserPlus className="w-8 h-8 text-base-content/40" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No suggestions yet</h3>
            <p className="text-base-content/60 text-sm max-w-xs">
              We'll suggest friends based on your connections
            </p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-base-300">
              {safeSuggestions.map((user) => (
                <SuggestionItem
                  key={user.id}
                  user={user}
                  onAddFriend={handleAddFriend}
                  isLoading={loadingUserId === user.id}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                totalPages={totalPages}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
