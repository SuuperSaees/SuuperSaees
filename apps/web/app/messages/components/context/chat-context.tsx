'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { Chats } from "~/lib/chats.types";

interface ChatContextType {
  activeChat: string | null;
  setActiveChat: (chatId: string | null) => void;
  activeChatData: Chats.Type | null;
  setActiveChatData: (chat: Chats.Type | null) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [activeChatData, setActiveChatData] = useState<Chats.Type | null>(null);

  return (
    <ChatContext.Provider value={{ 
      activeChat, 
      setActiveChat,
      activeChatData,
      setActiveChatData
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};