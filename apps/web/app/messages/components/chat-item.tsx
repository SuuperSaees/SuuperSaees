'use client';

import { useRouter } from 'next/navigation';

import { MessageCircle } from 'lucide-react';

import { Chats } from '~/lib/chats.types';

import { useChat } from './context/chat-context';

export default function ChatItem({
  chat,
  isActive = false,
}: {
  chat: Chats.Type;
  isActive?: boolean;
}) {
  const { setChatId, setActiveChat } = useChat();

  const router = useRouter();

  const handleChatSelect = () => {
    setChatId(chat.id.toString());
    setActiveChat(chat);
    router.push(`/messages`);
  };

  return (
    <button
      onClick={handleChatSelect}
      className={`flex cursor-pointer items-center gap-3 p-4 hover:bg-gray-50 ${
        isActive ? 'bg-gray-50' : ''
      }`}
    >
      <div className="relative">
        <MessageCircle className="h-12 w-12 rounded-full object-cover p-2 pl-4" />
        {/* <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div> */}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between">
          <h3 className="truncate font-medium">{chat.name}</h3>
          <span className="flex-shrink-0 text-sm text-gray-500">4:00pm</span>
        </div>
        <p className="truncate text-sm text-gray-500">
          {chat.name || 'No messages yet'}
        </p>
      </div>
    </button>
  );
}
