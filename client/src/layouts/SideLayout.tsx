import Sidebar from "../components/Sidebar";
import { useChatStore } from "../store/useChatStore";
import { Outlet } from "react-router-dom";

export default function SideLayout() {
  const { selectedUser } = useChatStore();
  return (
    <div className="h-full md:h-screen bg-base-200 md:pt-10">
      <div className="flex items-center justify-center md:pt-10 px-0 md:px-4 ">
        <div className="bg-base-100 rounded-lg md:shadow-cl w-full max-w-6xl h-[calc(100vh-8rem)] ">
          <div className="flex h-full rounded-lg overflow-hidden">
            {/* Sidebar: Hidden on mobile when user is selected, always visible on desktop */}
            <div
              className={`${
                selectedUser ? "hidden md:flex" : "flex"
              } w-full md:w-auto`}
            >
              <Sidebar />
            </div>
            {/* Chat Area: Hidden on mobile when no user selected, always visible on desktop */}
            <div
              className={`${selectedUser ? "flex" : "hidden md:flex"} flex-1`}
            >
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
