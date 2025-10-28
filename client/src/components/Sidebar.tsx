import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import SidebarSkeletons from "./skeletons/SidebarSkeletons";
import { useStoreAuth } from "../store/useStoreAuth";
import { Image } from "lucide-react";
import { Link } from "react-router-dom";
import SearchSection from "./SearchSection";
import { useFriendStore } from "../store/useFriendStore";

export default function Sidebar() {
  const {
    getUsers,
    users,
    selectedUser,
    isUsersLoading,
    setSelectedUser,
    sentMessages,
  } = useChatStore();
  const { onlineUsers } = useStoreAuth();
  const { AcceptingFriendship } = useFriendStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    getUsers();
  }, [getUsers, sentMessages, AcceptingFriendship]);

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.fullName
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesOnlineFilter = showOnlineOnly
      ? onlineUsers?.includes(user.id)
      : true;
    return matchesSearch && matchesOnlineFilter;
  });

  return (
    <aside className="h-full w-full lg:w-[350px] md:border-r border-base-300 flex flex-col transition-all duration-200">
      <div className="md:border-b border-base-300 w-full p-5">
        <SearchSection
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
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
        </div>
      </div>

      <>
        {isUsersLoading ? (
          <SidebarSkeletons />
        ) : (
          <div className="overflow-y-auto w-full py-3">
            {filteredUsers.map((user) => (
              <Link
                key={user.id}
                to={"/"}
                onClick={() => setSelectedUser(user)}
                className={`
              w-full p-3 flex items-center gap-3
              hover:bg-base-300 transition-colors
              ${
                selectedUser?.id === user.id
                  ? "bg-base-300 ring-1 ring-base-300"
                  : ""
              }
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

                <div className="text-left min-w-0 flex-1 ">
                  <div className="flex flex-row justify-between items-center">
                    <div className="">
                      <div className="font-medium truncate">
                        {user.fullName}
                      </div>
                      <div className="text-sm text-zinc-400 flex items-center gap-1">
                        {user?.latestMessage ? (
                          <>
                            {user?.latestMessage.image && (
                              <Image className="w-4 h-4" />
                            )}
                            {user?.latestMessage.text ? (
                              <span className="line-clamp-1">
                                {user.latestMessage.text}
                              </span>
                            ) : (
                              user?.latestMessage.image && <span>Picture</span>
                            )}
                          </>
                        ) : (
                          <span>No messages yet</span>
                        )}
                      </div>
                    </div>

                    <div className="">
                      {" "}
                      {user.unseenCount > 0 ? (
                        <span className=" flex rounded-full border size-5 text-[12px] items-center justify-center bg-green-500 text-white">
                          {user.unseenCount}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              </Link>
            ))}

            {filteredUsers.length === 0 && (
              <div className="text-center text-zinc-500 py-4">
                {showOnlineOnly ? "No online users" : "No contacts"}
              </div>
            )}
          </div>
        )}
      </>
    </aside>
  );
}
