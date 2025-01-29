'use client';

import { Chats } from "~/lib/chats.types";

export default function ChatItem({ chat, isActive = false }: { chat: Chats.Type; isActive?: boolean }) {
  const handleChatSelect = () => {
    console.log('Selected chat:', chat.id);
  };

  return (
    <div
      onClick={handleChatSelect}
      className={`p-4 hover:bg-gray-50 cursor-pointer flex items-center gap-3 ${
        isActive ? 'bg-gray-50' : ''
      }`}
    >
      <div className="relative">
        <img
          src={chat.avatar_url || 'https://via.placeholder.com/40'}
          alt={chat.name}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <h3 className="font-medium truncate">{chat.name}</h3>
          <span className="text-sm text-gray-500 flex-shrink-0">4:00pm</span>
        </div>
        <p className="text-sm text-gray-500 truncate">
          {chat.name || 'No messages yet'}
        </p>
      </div>
    </div>
  );
}