import { X } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useStoreAuth } from "../store/useStoreAuth";
import { formatLastSeen } from "../lib/utils";
import { useNavigate } from "react-router-dom";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useStoreAuth();
  const navigate=useNavigate();

  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={()=>navigate(`/profile/${selectedUser?.id}`)}>
          {/* Avatar */}
          <div className="avatar" >
            <div className="size-10 rounded-full relative">
              <img
                src={(selectedUser?.profileImage || "/avatar.png") as string}
                alt={selectedUser?.fullName}
              />
            </div>
          </div>
          {/* User info */}
          <div>
            <h3 className="font-medium">{selectedUser?.fullName}</h3>
            <p className="text-sm text-base-content/70">
              {onlineUsers?.includes(selectedUser?.id as string)
                ? "Online"
                : `last seen ${formatLastSeen(
                    selectedUser?.lastSeen as string
                  )}`}
            </p>
          </div>
        </div>

        {/* Close button */}
        <button onClick={() => setSelectedUser(null)}>
          <X />
        </button>
      </div>
    </div>
  );
};
export default ChatHeader;
