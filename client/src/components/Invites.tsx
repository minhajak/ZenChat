import React, { useEffect, useState } from "react";
import { useFriendStore } from "../store/useFriendStore";
import { UserPlus, Check, X, Loader2 } from "lucide-react";
import { formatLastSeen } from "../lib/utils";
import Pagination from "./Pagination";
import type { invite } from "../types/friend.type";

interface InviteProps {
  invite: invite;
  onAccept: (userId: string) => Promise<void>;
  onDecline: (userId: string) => Promise<void>;
  isProcessing: boolean;
}

const InviteItem: React.FC<InviteProps> = ({
  invite,
  onAccept,
  onDecline,
  isProcessing,
}) => {
  const [isAccepting, setIsAccepting] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);

  const isLoading = isAccepting || isDeclining || isProcessing;

  // Helper to safely get image src
  const getImageSrc = (
    profileImage?: string | File | ArrayBuffer | null | undefined
  ): string => {
    if (typeof profileImage === "string" && profileImage) {
      return profileImage;
    }
    return "/avatar.png";
  };

  const handleAccept = async () => {
    try {
      setIsAccepting(true);
      await onAccept(invite.requester.id);
    } catch (error) {
    } finally {
      setIsAccepting(false);
    }
  };

  const handleDecline = async () => {
    try {
      setIsDeclining(true);
      await onDecline(invite.requester.id);
    } catch (error) {
    } finally {
      setIsDeclining(false);
    }
  };

  return (
    <div className="p-4 hover:bg-base-200 transition-colors border-b border-base-300 last:border-b-0">
      <div className="flex items-center justify-between gap-3">
        {/* Avatar and User Info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Avatar */}
          <div className="avatar">
            <div className="w-12 h-12 rounded-full">
              <img
                src={getImageSrc(invite.requester.profileImage)}
                alt={invite.requester.fullName}
              />
            </div>
          </div>

          {/* User Info */}
          <div className="flex flex-col items-start justify-start">
            <p className="font-medium truncate">{invite.requester.fullName}</p>
            <p className="text-sm text-base-content/60 truncate">
              {invite.requester.email}
            </p>
            <p className="text-xs text-base-content/40 mt-1">
              {formatLastSeen(invite.createdAt as string)}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleAccept}
            disabled={isLoading}
            className="btn btn-success btn-sm gap-1"
            title="Accept request"
          >
            {isAccepting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span className="hidden sm:inline">Accept</span>
              </>
            )}
          </button>
          <button
            onClick={handleDecline}
            disabled={isLoading}
            className="btn btn-error btn-sm gap-1"
            title="Decline request"
          >
            {isDeclining ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <X className="w-4 h-4" />
                <span className="hidden sm:inline">Decline</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Invites() {
  const [currentPage, setCurrentPage] = useState(1);
  const [processingUserId, setProcessingUserId] = useState<string | null>(null);
  const {
    invites,
    getInvites,
    isGettingInvites,
    AcceptingFriendship,
    DeclingFriendship,
    subscribeToInvites,
    unsubscribeToInvites,
  } = useFriendStore();
  const safeInvites = invites?.invites || [];
  const totalPages = invites?.pagination?.totalPages || 0;
  const totalCount = invites?.pagination?.totalCount || 0;

  useEffect(() => {
    getInvites(currentPage, 5);
    subscribeToInvites();
    return () => unsubscribeToInvites();
  }, [currentPage, getInvites]);

  const handleAccept = async (userId: string) => {
    setProcessingUserId(userId);
    try {
      await AcceptingFriendship(userId);
    } finally {
      setProcessingUserId(null);
    }
  };

  const handleDecline = async (userId: string) => {
    setProcessingUserId(userId);
    try {
      await DeclingFriendship(userId);
    } finally {
      setProcessingUserId(null);
    }
  };

  const isEmptyState =
    safeInvites.length === 0 && !isGettingInvites && currentPage === 1;

  return (
    <div className="w-full h-full flex flex-col bg-base-100">
      {/* Header */}
      <div className="p-4 border-b border-base-300">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <UserPlus className="w-6 h-6 text-primary" />
          Friend Invites
          {totalCount > 0 && (
            <span className="badge badge-primary">{totalCount}</span>
          )}
        </h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {isGettingInvites ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="sr-only">Loading...</span>
          </div>
        ) : isEmptyState ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-16 h-16 bg-base-200 rounded-full flex items-center justify-center mb-4">
              <UserPlus className="w-8 h-8 text-base-content/40" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No pending invites</h3>
            <p className="text-base-content/60 text-sm max-w-xs">
              When someone sends you a friend request, it will appear here
            </p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-base-300">
              {safeInvites.map((invite) => (
                <InviteItem
                  key={invite.id}
                  invite={invite}
                  onAccept={handleAccept}
                  onDecline={handleDecline}
                  isProcessing={processingUserId === invite.requester.id}
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
