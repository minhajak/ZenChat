import { useChatStore } from "../store/useChatStore";
import NoChatSelected from "../components/NoChatsSelected.tsx";
import ChatContainer from "../components/ChatContainer.tsx";

const HomePage = () => {
  const { selectedUser } = useChatStore();

  return <> {!selectedUser ? <NoChatSelected /> : <ChatContainer />}</>;
};
export default HomePage;
