'use client';

import { useMemo } from 'react';

import ChatItem from './chat-item';
import { useChat } from './context/chat-context';

export default function ChatList() {
  const { chatId, chatsQuery, searchQuery } = useChat();

  const filteredChats = useMemo(() => {
    const chats = chatsQuery.data ?? [];
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
  }, [chatsQuery.data, searchQuery]);

  // Estado de carga
  if (chatsQuery.isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        Loading chats...
      </div>
    );
  }

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