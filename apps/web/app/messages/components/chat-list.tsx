'use client';

import { useQuery } from '@tanstack/react-query';
import ChatItem from "./chat-item";
import { getChats } from '~/server/actions/chats/chats.action';
import { useChat } from './context/chat-context';
import { Chats } from '~/lib/chats.types';

export default function ChatList() {
  const { activeChat, setActiveChat, setActiveChatData } = useChat();

  const { data: chatsData, isLoading, error } = useQuery({
    queryKey: ['chats'],
    queryFn: async () => {
      const response = await getChats();

      if (!response) throw new Error('Unknown error');
      if(!activeChat && response.length > 0) {
        setActiveChat(response[0].id.toString());
        setActiveChatData(response[0]);
      }
      return response as unknown as Chats.Type[];

    }
  });

  const handleChatSelect = (chat: Chats.Type) => {
    setActiveChat(chat.id.toString());
    setActiveChatData(chat);
  };

  if (isLoading) {
    return <div className="flex-1 flex items-center justify-center">Cargando chats...</div>;
  }

  if (error) {
    return <div className="flex-1 flex items-center justify-center text-red-500">Error: {error.message}</div>;
  }


  return (
    <div className="flex-1 overflow-y-auto">
      <div className="flex flex-col">
        {chatsData?.map((chat) => (
          <ChatItem 
            key={chat.id} 
            chat={chat} 
            isActive={activeChat === chat.id.toString()}
            onSelect={() => handleChatSelect(chat)}
          />
        ))}
      </div>
    </div>
  );
}