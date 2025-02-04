'use client';

import ChatItem from './chat-item';
import { useChat } from './context/chat-context';

export default function ChatList() {
  const { activeChat, chats } = useChat();

  const chatsData = chats.data;
  
  if (chats.isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        Loading chats...
      </div>
    );
  }

  if (chats.error) {
    return (
      <div className="flex flex-1 items-center justify-center text-red-500">
        Error: {chats.error.message}
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="flex flex-col">
        {chatsData?.map((chat) => (
          <ChatItem
            key={chat.id}
            chat={chat}
            isActive={activeChat === chat.id.toString()}
          />
        ))}
      </div>
    </div>
  );
}
