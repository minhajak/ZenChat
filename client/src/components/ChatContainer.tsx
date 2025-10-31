import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef } from "react";
import MessageInput from "./MessageInput";
import ChatHeader from "./ChatHeader";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useStoreAuth } from "../store/useStoreAuth";
import { formatMessageTime } from "../lib/utils";

export default function ChatContainer() {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeToMessages,
    deleteConversation,
  } = useChatStore();
  const { authUser } = useStoreAuth();

  const messageEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    getMessages(selectedUser?.id as string);
    subscribeToMessages();
    return () => unsubscribeToMessages();
  }, [
    selectedUser?.id,
    getMessages,
    subscribeToMessages,
    unsubscribeToMessages,
    deleteConversation,
  ]);
  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);
  if (isMessagesLoading)
    return (
      <div className="flex-1 flex flex-col">
        <ChatHeader />
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <MessageSkeleton />
        </div>
        <MessageInput />
      </div>
    );
  return (
    <div className="flex-1 flex flex-col">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`chat ${
              message.senderId === authUser?.id ? "chat-end" : "chat-start"
            }`}
            ref={messageEndRef}
          >
            <div className=" chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                  src={
                    (message.senderId === authUser?.id
                      ? authUser.profileImage || "/avatar.png"
                      : selectedUser?.profileImage || "/avatar.png") as string
                  }
                  alt="profile pic"
                />
              </div>
            </div>
            <div className="chat-header mb-1">
              <time className="text-xs opacity-50 ml-1">
                {formatMessageTime(message.createdAt)}
              </time>
            </div>
            <div className="chat-bubble flex flex-col">
              {message.image && (
                <img
                  src={message.image as string}
                  alt="Attachment"
                  className="sm:max-w-[200px] rounded-md mb-2"
                />
              )}
              {message.text && <p className="wrap-anywhere">{message.text}</p>}
            </div>
          </div>
        ))}
      </div>

      <MessageInput />
    </div>
  );
}