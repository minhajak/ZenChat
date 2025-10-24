import { useChatStore } from "../store/useChatStore";

import Sidebar from "../components/Sidebar.tsx";
import NoChatSelected from "../components/NoChatsSelected.tsx";
import ChatContainer from "../components/ChatContainer.tsx";

const HomePage = () => {
  const { selectedUser } = useChatStore();

  return (
    <div className="h-screen bg-base-200">
      <div className="flex items-center justify-center pt-20 px-4">
        <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-6xl h-[calc(100vh-8rem)]">
          <div className="flex h-full rounded-lg overflow-hidden">
            {/* Sidebar: Hidden on mobile when user is selected, always visible on desktop */}
            <div className={`${selectedUser ? 'hidden lg:flex' : 'flex'} w-full lg:w-auto`}>
              <Sidebar />
            </div>

            {/* Chat Area: Hidden on mobile when no user selected, always visible on desktop */}
            <div className={`${selectedUser ? 'flex' : 'hidden lg:flex'} flex-1`}>
              {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default HomePage;