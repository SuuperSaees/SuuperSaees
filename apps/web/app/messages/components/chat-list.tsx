'use client';

import { Chats } from "~/lib/chats.types";
import ChatItem from "./chat-item";
import { useState } from "react";

export default function ChatList({ chats }: { chats: Chats.Type[] }) {
  const [activeChat, setActiveChat] = useState<string | null>(null);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="flex flex-col">
        {chats?.map((chat) => (
          <ChatItem 
            key={chat.id} 
            chat={chat} 
            isActive={activeChat === chat.id.toString()}
            onSelect={() => setActiveChat(chat.id.toString())}
          />
        ))}
      </div>
    </div>
  );
}