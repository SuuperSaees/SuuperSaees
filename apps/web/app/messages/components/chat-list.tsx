'use client';

import { useMemo } from 'react';

import ChatItem from './chat-item';
import { useChat } from './context/chat-context';

export default function ChatList() {
  const { chatId, chatsQuery, searchQuery } = useChat();
  const chats = chatsQuery.data ?? [];

  const filteredChats = useMemo(() => {
    if (!searchQuery) return chats;
    
    return chats.filter((chat) => {
      // Verificar nombre del chat de forma segura
      if (chat.name?.toLowerCase().includes(searchQuery.toLowerCase())) {
        return true;
      }
      
      // Verificar mensajes de forma segura
      const hasMatchingMessage = chat.messages?.some((message) =>
        message?.content?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      // Verificar miembros de forma segura
      const hasMatchingMember = chat.chat_members?.some((member) =>
        member?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );

      return hasMatchingMessage || hasMatchingMember;
    });
  }, [chats, searchQuery]);

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
        {filteredChats.length === 0 ? (
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