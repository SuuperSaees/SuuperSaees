'use client';

import { Dispatch, SetStateAction, createContext, useContext } from 'react';

import { useUserWorkspace } from '@kit/accounts/hooks/use-user-workspace';

import { createSubscriptionHandler } from '~/hooks/create-subscription-handler';
import { useRealtime } from '~/hooks/use-realtime';
import { Message } from '~/lib/message.types';
import { useChatManagement } from '~/messages/hooks/use-chat-management-actions';
import { useChatMessageActions } from '~/messages/hooks/use-chat-message-actions';
import useChatState from '~/messages/hooks/use-chat-state';
import {
  ChatContextType,
  ChatProviderProps,
} from '~/messages/types/chat-context.types';

/**
 * Context for managing chat state and operations.
 * @type {React.Context<ChatContextType | undefined>}
 */
const ChatContext = createContext<ChatContextType | undefined>(undefined);

/**
 * Provider component that manages chat functionality and state.
 *
 * This component serves as a central hub for chat operations, handling:
 * - Message management and real-time updates
 * - Chat member management
 * - Active chat state
 * - User context and authentication
 *
 * @component
 * @param {ChatProviderProps} props - The component props
 * @param {ReactNode} props.children - Child components that will have access to chat context
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
  initialChat,
  initialMembers = [],
}: ChatProviderProps) {
  // User state
  const { workspace: currentUser, user } = useUserWorkspace();
  const currentUserInfo = {
    id: currentUser?.id ?? '',
    name: currentUser?.name ?? '',
    email: user?.email ?? '',
    picture_url: currentUser?.picture_url ?? '',
  };

  // Chat state

  const {
    chatId,
    setChatId,
    activeChat,
    setActiveChat,
    members,
    setMembers,
    setMessages,
    messagesQueryKey,
  } = useChatState({ initialMembers });

  // Query for chat by id
  // Uses cached messages
  const { chatByIdQuery, ...chatActions } = useChatManagement({
    queryKey: ['chat', chatId ?? ''],
    chatId,
    setMessages: setMessages,
    userId: user.id,
    initialChat: initialChat,
  });

  // Initialize chat actions with optimized message setter
  // TODO: Replace with queryMessages instead of using chatByIdQuery.data?.messages
  const messages = chatByIdQuery.data?.messages ?? [];

  const messageActions = useChatMessageActions({
    messages,
    setMessages: setMessages,
    chatId,
    queryKey: messagesQueryKey,
    user: currentUserInfo,
  });

  // Real-time subscription handler
  // TODO: Implement user addition based on members for new messages
  const handleSubscriptions = createSubscriptionHandler<Message.Type>({
    idField: 'temp_id',
  });

  // Configure real-time subscriptions
  const realtimeConfig = {
    channelName: 'chat-changes',
    schema: 'public',
  };

  // Set up tables to watch for real-time updates
  const tables = [
    {
      tableName: 'messages',
      currentData: messages,
      setData: setMessages as Dispatch<
        SetStateAction<Message.Type[] | Message.Type>
      >,
    },
  ];

  // Initialize real-time subscriptions
  useRealtime(tables, realtimeConfig, handleSubscriptions);

  const value: ChatContextType = {
    messages: messages.filter((msg) => !('deleted_at' in msg)),
    setMessages: setMessages,
    members,
    setMembers,
    activeChat,
    setActiveChat,
    chatId,
    setChatId,

    user: {
      id: currentUser?.id ?? '',
      name: currentUser?.name ?? '',
      email: user?.email ?? '',
      picture_url: currentUser?.picture_url ?? '',
    },
    chatByIdQuery,
    ...chatActions,
    ...messageActions,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

/**
 * Hook for accessing chat context and functionality.
 *
 * Provides access to chat state, messages, and operations like sending/deleting messages,
 * managing members, and handling chat settings.
 *
 * @returns {ChatContextType} The chat context value containing all chat-related state and functions
 * @throws {Error} If used outside of ChatProvider
 *
 * @example
 * ```tsx
 * function ChatComponent() {
 *   const { messages, addMessageMutation } = useChat()
 *   // Use chat context values and operations
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
