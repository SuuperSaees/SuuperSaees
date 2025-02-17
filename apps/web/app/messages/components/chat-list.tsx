'use client';

import { useEffect, useMemo } from 'react';

import ChatItem from './chat-item';
import { useChat } from './context/chat-context';
import { Chats } from '~/lib/chats.types';
import { Spinner } from '@kit/ui/spinner';

export default function ChatList() {
  const { chatId, chatsQuery, searchQuery, activeChat, setActiveChat, setChatId } = useChat();
  const chats = useMemo(() => chatsQuery.data ?? [], [chatsQuery.data]);
  const filteredChats = useMemo(() => {
    if (!searchQuery) return chats;
    if (!Array.isArray(chats) || !chats.length) return [];
    return chats.filter((chat) => {
      // Verificar nombre del chat de forma segura
      if (chat?.name?.toLowerCase().includes(searchQuery.toLowerCase())) {
        return true;
      }
      
      // Verificar mensajes de forma segura
      const hasMatchingMessage = Array.isArray(chat?.messages) && chat.messages.some((message) =>
        message?.content?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      // Verificar miembros de forma segura
      const hasMatchingMember = Array.isArray(chat?.chat_members) && chat.chat_members.some((member) =>
        member?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );

      return hasMatchingMessage || hasMatchingMember;
    });
  }, [searchQuery, chats]);

  useEffect(() => {
    if (filteredChats?.length && !activeChat) {
      setActiveChat(filteredChats[0] as Chats.Type);
      setChatId(filteredChats[0].id.toString());
    }
  }, [filteredChats, activeChat, setActiveChat, setChatId]);
  // Estado de carga
  if (chatsQuery.isLoading) return <Spinner className="w-5 h-5 mx-auto mt-6 text-gray-500" />

  // Estado de error
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
        {!Array.isArray(filteredChats) || filteredChats.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            {searchQuery ? 'No chats found' : 'No chats yet'}
          </div>
        ) : (
          filteredChats.map((chat) => (
            <ChatItem
              key={chat.id}
              chat={chat}
              isActive={chatId === chat.id.toString()}
            />
          ))
        )}
      </div>
    </div>
  );
}