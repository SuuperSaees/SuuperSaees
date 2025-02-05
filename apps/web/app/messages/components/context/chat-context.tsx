'use client';

import { createContext, useContext, useState } from 'react';

import { useUserWorkspace } from '@kit/accounts/hooks/use-user-workspace';

import { ChatMembers } from '~/lib/chat-members.types';
import { Chats } from '~/lib/chats.types';
import { Message } from '~/lib/message.types';
import useChatActions from '~/messages/hooks/use-chat-actions';
import {
  ChatContextType,
  ChatProviderProps,
} from '~/messages/types/chat-context.types';

/**
 * Context for managing chat state and operations
 * @type {React.Context<ChatContextType | undefined>}
 */
const ChatContext = createContext<ChatContextType | undefined>(undefined);

/**
 * Provider component for chat functionality
 * Manages chat state, messages, and provides chat-related operations through context
 *
 * @component
 * @param {ChatProviderProps} props - Component props
 * @param {ReactNode} props.children - Child components
 * @param {Message.Type[]} [props.initialMessages=[]] - Initial messages to populate the chat
 * @param {ChatMembers.Type[]} [props.initialMembers=[]] - Initial members in the chat
 *
 * @example
 * ```tsx
 * function App() {
 *   return (
 *     <ChatProvider initialMessages={messages} initialMembers={members}>
 *       <ChatComponent />
 *     </ChatProvider>
 *   )
 * }
 * ```
 */
export function ChatProvider({
  children,
  initialMessages = [],
  initialMembers = [],
}: ChatProviderProps) {
  // Get user workspace information
  const { workspace: currentUser, user } = useUserWorkspace();

  // Initialize chat state using custom hook
  const [messages, setMessages] = useState<Message.Type[]>(initialMessages);
  const [members, setMembers] = useState<ChatMembers.Type[]>(initialMembers);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [activeChatData, setActiveChatData] = useState<Chats.Type | null>(null);

  // Initialize chat actions (mutations and queries)
  const {
    addMessageMutation,
    deleteMessageMutation,
    membersUpdateMutation,
    updateChatMutation,
    deleteChatMutation,
    chatByIdQuery,
    createChatMutation,
    chatsQuery,
  } = useChatActions({
    messages: messages,
    setMessages: setMessages,
    activeChatData: activeChatData,
    activeChat: activeChat,
    setActiveChatData: setActiveChatData,
    user: {
      id: currentUser?.id ?? '',
      name: currentUser?.name ?? '',
      email: user?.email ?? '',
      picture_url: currentUser?.picture_url ?? '',
    },
    setActiveChat: setActiveChat,
  });

  // Combine all values for context
  const value: ChatContextType = {
    // Filter out deleted messages
    messages: messages.filter((msg) => !('deleted_at' in msg)),
    setMessages: setMessages,
    members: members,
    setMembers: setMembers,
    activeChat: activeChat,
    setActiveChat: setActiveChat,
    activeChatData: activeChatData,
    setActiveChatData: setActiveChatData,
    addMessageMutation,
    deleteMessageMutation,
    membersUpdateMutation,
    updateChatMutation,
    deleteChatMutation,
    chatByIdQuery,
    chatsQuery,
    createChatMutation,
    user: {
      id: currentUser?.id ?? '',
      name: currentUser?.name ?? '',
      email: user?.email ?? '',
      picture_url: currentUser?.picture_url ?? '',
    },
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

/**
 * Hook for accessing chat context
 * @returns {ChatContextType} Chat context value
 * @throws {Error} If used outside of ChatProvider
 *
 * @example
 * ```tsx
 * function ChatComponent() {
 *   const { messages, addMessageMutation } = useChat()
 *   // Use chat context values
 * }
 * ```
 */
export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
