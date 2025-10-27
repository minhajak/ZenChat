import { useParams, useNavigate } from "react-router-dom";
import { useChatStore } from "../store/useChatStore";
import {
  ArrowLeft,
  Mail,
  Clock,
  MessageCircle,
  Trash2,
} from "lucide-react";
import { formatLastSeen } from "../lib/utils";
import { useState } from "react";

const UserProfilePage = () => {
  const { userId } = useParams();  
  const navigate = useNavigate();
  const { users, selectedUser, deleteConversation } =
    useChatStore();
  const [showActions, setShowActions] = useState(false);

  // Find user from users list or use selectedUser
  const user = users.find((u) => u?.id === userId) || selectedUser;

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <div className="text-center ">
          <p className="text-base-content/60 text-lg">User not found</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 text-primary hover:text-primary/80"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }


  return (
    <div className="h-auto flex flex-col bg-base-100 w-full">
      {/* Header */}
      <div className="bg-base-200 px-4 py-3 flex items-center justify-between border-b border-base-300 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-base-300 rounded-full transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-medium">Contact Info</h2>
        </div>
        <button
          onClick={() => setShowActions(!showActions)}
          className="p-2 hover:bg-base-300 rounded-full transition"
        >
        </button>
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
              <div className="absolute bottom-3 right-3 w-7 h-7 bg-green-500 border-4 border-base-200 rounded-full" />
            )}
          </div>

          {/* User Name */}
          <h1 className="text-2xl font-semibold mb-1">{user.fullName}</h1>

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
              <Mail className="w-5 h-5 text-base-content/60 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-base-content/60 mb-1">Email</p>
                <p className="text-sm break-all">{user.email}</p>
              </div>
            </div>

            {/* Last Message Time */}
            {user.latestMessage && (
              <div className="flex items-start gap-4">
                <MessageCircle className="w-5 h-5 text-base-content/60 mt-0.5" />
                <div className="flex-1">
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
            className="w-full px-6 py-4 flex items-center gap-4 hover:bg-base-300/50 transition text-error"
            onClick={() => deleteConversation(selectedUser?.id as string)}
          >
            <Trash2 className="w-5 h-5" />
            <div className="flex-1 text-left">
              <p className="text-sm font-medium">Delete Chat</p>
              <p className="text-xs text-base-content/60">
                Clear all messages from this conversation
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
