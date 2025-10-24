import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import SidebarSkeletons from "./skeletons/SidebarSkeletons";
import { useStoreAuth } from "../store/useStoreAuth";
import { Users } from "lucide-react";

export default function Sidebar() {
  const { getUsers, users, selectedUser, isUsersLoading, setSelectedUser } =
    useChatStore();
  const { onlineUsers } = useStoreAuth();
  const [showOnlineOnly, setShowOnlineOnly] = useState<boolean>(false);
  
  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const filteredUsers = showOnlineOnly
    ? users.filter((user) => onlineUsers?.includes(user.id))
    : users;
  
  // Calculate online count safely
  const onlineCount = onlineUsers ? onlineUsers.length - 1 : 0;
  
  if (isUsersLoading) return <SidebarSkeletons />;
  
  return (
    <aside className="h-full w-full lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center gap-2">
          <Users className="size-6" />
          <span className="font-medium">Contacts</span>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <label className="cursor-pointer flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-sm"
            />
            <span className="text-sm">Show online only</span>
          </label>
          <span className="text-xs text-zinc-500">({onlineCount} online)</span>
        </div>
      </div>

      <div className="overflow-y-auto w-full py-3">
        {filteredUsers.map((user) => (
          <button
            key={user.id}
            onClick={() => setSelectedUser(user)}
            className={`
              w-full p-3 flex items-center gap-3
              hover:bg-base-300 transition-colors
              ${selectedUser?.id === user.id ? "bg-base-300 ring-1 ring-base-300" : ""}
            `}
          >
            <div className="relative">
              <img
                src={(user.profileImage || "/avatar.png") as string}
                alt={user.fullName}
                className="size-12 object-cover rounded-full"
              />
              {onlineUsers?.includes(user.id) && (
                <span
                  className="absolute bottom-0 right-0 size-3 bg-green-500 
                  rounded-full ring-2 ring-zinc-900"
                />
              )}
            </div>

            {/* User info - visible on all screens */}
            <div className="text-left min-w-0 flex-1">
              <div className="font-medium truncate">{user.fullName}</div>
              <div className="text-sm text-zinc-400">
                {onlineUsers?.includes(user.id) ? "Online" : "Offline"}
              </div>
            </div>
          </button>
        ))}

        {filteredUsers.length === 0 && (
          <div className="text-center text-zinc-500 py-4">
            {showOnlineOnly ? "No online users" : "No contacts"}
          </div>
        )}
      </div>
    </aside>
  );
}