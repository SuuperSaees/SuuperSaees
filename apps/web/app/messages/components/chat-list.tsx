'use client';

import ChatItem from './chat-item';
import { useChat } from './context/chat-context';

export default function ChatList() {
  const { activeChat, chatsQuery } = useChat();

  const chatsData = chatsQuery.data;

  if (chatsQuery.isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        Loading chats...
      </div>
    );
  }

  if (chatsQuery.error) {
    return (
      <div className="flex flex-1 items-center justify-center text-red-500">
        Error: {chatsQuery.error.message}
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
