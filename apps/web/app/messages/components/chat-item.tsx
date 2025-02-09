'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@kit/ui/avatar';

import { Chats } from '~/lib/chats.types';

import { useChat } from './context/chat-context';

export default function ChatItem({
  chat,
  isActive = false,
}: {
  chat: Chats.TypeWithRelations;
  isActive?: boolean;
}) {
  const { setChatId, setActiveChat } = useChat();

  const handleChatSelect = () => {
    setChatId(chat.id.toString());
    setActiveChat(chat);
  };

  return (
    <button
      onClick={handleChatSelect}
      className={`flex cursor-pointer items-center gap-3 p-4 hover:bg-gray-50 ${
        isActive ? 'bg-gray-50' : ''
      }`}
    >
      <div className="relative">
          <Avatar className="h-6 w-6">
            <AvatarImage src={chat.image ?? ''} />
            <AvatarFallback>{chat.organizations?.find((org) => !org.is_agency)?.name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
        {/* <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div> */}

        {/* <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div> */}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between">
          <h3 className="truncate font-medium">{chat.name}</h3>
          {/* <span className="flex-shrink-0 text-sm text-gray-500">4:00pm</span> */}
        </div>
        {/* <p className="truncate text-sm text-gray-500">
          {chat.name || 'No messages yet'}
        </p> */}
      </div>
    </button>
  );
}
