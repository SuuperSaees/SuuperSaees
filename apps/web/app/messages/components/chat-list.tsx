'use client';

import { useQuery } from '@tanstack/react-query';
import { Chats } from "~/lib/chats.types";
import ChatItem from "./chat-item";
import { getChats } from '~/server/actions/chat/actions/chats/chat.actions';
import { useChat } from './context/chat-context';

export default function ChatList() {
  const { activeChat, setActiveChat, setActiveChatData } = useChat();

  const { data: chatsData, isLoading, error } = useQuery({
    queryKey: ['chats'],
    queryFn: async () => {
      const response = await getChats();
      if (!response.success) throw new Error(response.error?.message ?? 'Unknown error');
      if(!activeChat && response.success.data.length > 0) {
        setActiveChat(response.success.data[0].id.toString());
        setActiveChatData(response.success.data[0]);
      }
      return response.success.data as unknown as Chats.Type[];
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