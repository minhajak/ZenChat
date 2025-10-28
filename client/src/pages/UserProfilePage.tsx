import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { ArrowLeft, Mail, Clock, MessageCircle, Trash2, AlertCircle } from "lucide-react";
import { formatLastSeen } from "../lib/utils";

const UserProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { users, selectedUser, deleteConversation } = useChatStore();

  // Find user from users list or use selectedUser
  const user = users.find((u) => u?.id === userId) || selectedUser;

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full bg-base-100">
        <div className="text-center p-8">
          <p className="text-base-content/60 text-lg mb-4">User not found</p>
          <button
            onClick={() => navigate(-1)}
            className="btn btn-outline btn-primary"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  const handleDelete = () => {
    if (user.id) {
      deleteConversation(user.id);
    }
    setShowDeleteModal(false);
  };

  return (
    <>
      <div className="flex flex-col bg-base-100 w-full h-full overflow-hidden">
        {/* Header */}
        <div className="bg-base-200 px-4 py-3 flex items-center justify-between border-b border-base-300 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-base-300 rounded-full transition"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-medium">Contact Info</h2>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Profile Section */}
          <div className="bg-base-200 flex flex-col items-center py-8 px-6">
            {/* Profile Image */}
            <div className="relative mb-4">
              <img
                src={(user.profileImage || "/avatar.png") as string}
                alt={user.fullName}
                className="w-40 h-40 rounded-full object-cover ring-4 ring-base-300 cursor-pointer hover:opacity-90 transition"
              />
              {user.lastSeen === null && (
                <div className="absolute bottom-3 right-3 w-7 h-7 bg-success border-4 border-base-200 rounded-full" />
              )}
            </div>

            {/* User Name */}
            <h1 className="text-2xl font-semibold mb-1 text-center">
              {user.fullName}
            </h1>

            {/* Last Seen Status */}
            <p className="text-sm text-base-content/60 flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {formatLastSeen(user.lastSeen)}
            </p>
          </div>

          {/* About Section */}
          <div className="mt-6 bg-base-200">
            <div className="px-6 py-3 border-b border-base-300">
              <h3 className="text-sm font-medium text-base-content/60">About</h3>
            </div>

            <div className="px-6 py-4 space-y-4">
              {/* Email */}
              <div className="flex items-start gap-4">
                <Mail className="w-5 h-5 text-base-content/60 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-base-content/60 mb-1">Email</p>
                  <p className="text-sm break-all">{user.email}</p>
                </div>
              </div>

              {/* Last Message Time */}
              {user.latestMessage && (
                <div className="flex items-start gap-4">
                  <MessageCircle className="w-5 h-5 text-base-content/60 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-base-content/60 mb-1">
                      Last Message
                    </p>
                    <p className="text-sm">
                      {new Date(user.latestMessage.createdAt).toLocaleString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Media, Links, Docs Section */}
          <div className="mt-6 bg-base-200">
            <div className="px-6 py-4 border-b border-base-300">
              <button className="w-full flex items-center justify-between hover:bg-base-300/50 -mx-2 px-2 py-2 rounded-lg transition">
                <span className="text-sm">Media, Links, and Docs</span>
                <span className="text-xs text-base-content/60">0 →</span>
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="mt-6 mb-6 bg-base-200">
            <button
              className="w-full px-6 py-4 flex items-center gap-4 hover:bg-error/5 transition text-error"
              onClick={() => setShowDeleteModal(true)}
            >
              <div className="p-2 bg-error/10 rounded-lg">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-medium">Delete Chat</p>
                <p className="text-xs text-base-content/60">
                  Clear all messages from this conversation
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <input
        type="checkbox"
        id="delete-modal"
        className="modal-toggle"
        checked={showDeleteModal}
        onChange={() => setShowDeleteModal(!showDeleteModal)}
      />
      <div className="modal" role="dialog">
        <div className="modal-box">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-error/10 rounded-lg">
              <AlertCircle className="w-5 h-5 text-error" />
            </div>
            <h3 className="font-bold text-lg">Delete Chat</h3>
          </div>
          <p className="py-4">
            Are you sure you want to clear all messages from this conversation with {user.fullName}? This action cannot be undone.
          </p>
          <div className="modal-action">
            <button className="btn btn-error" onClick={handleDelete}>
              Yes, delete it
            </button>
            <button className="btn" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </button>
          </div>
        </div>
        <label
          className="modal-backdrop"
          htmlFor="delete-modal"
          onClick={() => setShowDeleteModal(false)}
        />
      </div>
    </>
  );
};

export default UserProfilePage;