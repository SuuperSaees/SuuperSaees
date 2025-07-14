'use client';

import { Dispatch, SetStateAction, createContext, useContext, useEffect } from 'react';

import { useUserWorkspace } from '@kit/accounts/hooks/use-user-workspace';

import { createSubscriptionHandler } from '~/hooks/create-subscription-handler';
import { TableConfig, useRealtime } from '~/hooks/use-realtime';
import { Chats } from '~/lib/chats.types';
import { File } from '~/lib/file.types';
import { Message } from '~/lib/message.types';
import { useChatManagement } from '~/(main)/messages/hooks/use-chat-management-actions';
import { useChatMessageActions } from '~/(main)/messages/hooks/use-chat-message-actions';
import { useChatState } from '~/(main)/messages/hooks/use-chat-state';
import {
  ActiveChatState,
  ChatContextType,
  ChatProviderProps,
} from '~/(main)/messages/types/chat-context.types';
import { updateArrayData } from '~/utils/data-transform';
import { useUnreadMessageCounts } from '~/hooks/use-unread-message-counts';

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
  initialChats,
  initialMembers = [],
}: ChatProviderProps) {
  // User state
  const { workspace: currentUser, user, organization } = useUserWorkspace();
  const currentUserInfo = {
    id: currentUser?.id ?? '',
    name: currentUser?.name ?? '',
    email: user?.email ?? '',
    picture_url: currentUser?.picture_url ?? '',
    role: user?.role ?? '',
  };

  // Chat state

  const {
    chatId,
    activeChat,
    setActiveChat,
    members,
    setMembers,
    setMessages,
    messagesQueryKey,
    isChatCreationDialogOpen,
    setIsChatCreationDialogOpen,
    searchQuery,
    setSearchQuery,
    filteredChats,
    setFilteredChats,
    setChats,
    fileUploads,
    handleFileUpload,
    handleFileRemove,
  } = useChatState({ initialMembers });

  // Query for chat by id
  // Uses cached messages
  const { chatByIdQuery, chatsQuery, ...chatActions } = useChatManagement({
    queryKey: ['chat', chatId ?? ''],
    chatId,
    setMessages: setMessages,
    userId: user.id,
    initialChat,
    initialChats,
    activeChat: activeChat ?? undefined,
    setActiveChat: setActiveChat ?? undefined,
  });

  // Initialize chat actions with optimized message setter
  // TODO: Replace with queryMessages instead of using chatByIdQuery.data?.messages
  const messages = chatByIdQuery.data?.messages ?? [];
  const chats = chatsQuery.data ?? [];
  const messageActions = useChatMessageActions({
    messages,
    setMessages,
    chatId,
    queryKey: messagesQueryKey,
    user: currentUserInfo,
  });
  // Real-time subscription handler
  // TODO: Implement user addition based on members for new messages
  const handleSubscriptions = createSubscriptionHandler<
    Message.Type | File.Type | Chats.Type
  >({
    idField: 'temp_id',
    onBeforeUpdate: (payload) => {
      // add user join based on members and the user_id that comes in the payload
      const message = payload.new as Message.Type;
      const userId = message.user_id;
      const user = members.find((member) => member.id === userId);
      if (
        user &&
        payload.eventType === 'INSERT' &&
        payload.table === 'messages'
      ) {
        const newMessage = {
          ...message,
          user: {
            id: user.id,
            name: user.name ?? '',
            email: user.email ?? '',
            picture_url: user.picture_url ?? '',
          },
        };

        const updatedItems = updateArrayData(
          messages,
          newMessage,
          'temp_id',
          true,
        );
        setMessages(updatedItems);

        // Add last message to the chats
        const chat = chats.find((chat) => chat.id === message.chat_id);
        if (chat) {
          chat.messages = [newMessage];
          const updatedChats = updateArrayData(chats, chat, 'id', false);
          // put chat in order of last message, so the message withe the most recent created_at makes the chat the first one
          const sortedChats = updatedChats.sort((a, b) => {
            const aTime = a.messages?.[0]?.created_at ?? '';
            const bTime = b.messages?.[0]?.created_at ?? '';
            return new Date(bTime).getTime() - new Date(aTime).getTime();
          });
          setChats(sortedChats);
        }
        return true;
      }
      // Soft delete (update "deleted_on" ) of messages
      if (payload.eventType === 'UPDATE' && payload.table === 'messages') {
        const message = payload.new as Message.Type;

        setMessages((currentMessages) => {
          let updatedMessages = updateArrayData(
            currentMessages,
            message,
            'temp_id',
            false,
          );
          updatedMessages = updatedMessages.filter(
            (msg) => !msg.deleted_on, // Only filter out deleted messages
          );
          return updatedMessages;
        });
        // ALso, delete the message from the chats if is the last message
        const chat = chats.find((chat) => chat.id === message.chat_id);
        if (chat && message.deleted_on) {
          const newMessages = messages.filter((msg) => msg.id !== message.id);
          const lastMessage = newMessages[newMessages.length - 1];
          chat.messages = lastMessage ? [lastMessage] : [];

          setChats(updateArrayData(chats, chat, 'id', false));
        }
        return true;
      }

      if (payload.eventType === 'INSERT' && payload.table === 'files') {
        // insert the file in files messages
        const file = payload.new as File.Type;
        // Use the message_id to insert the file in the files messages table
        setMessages((prev) => {
          const message = prev.find(
            (message) => message.id === file.message_id,
          );
          if (message) {
            const files = updateArrayData(
              message.files ?? [],
              file,
              'temp_id',
              true,
            );
            const newMessage = { ...message, files: files };
            const updatedItems = updateArrayData(
              messages,
              newMessage,
              'id',
              false,
            );
            return updatedItems;
          }
          return prev;
        });
        return true;
      }

      // Handles soft delete of chats
      if (payload.eventType === 'UPDATE' && payload.table === 'chats') {
        const chat = payload.new as Chats.Type;
        // put the user in the chat

        if (chat.deleted_on) {
          const updatedChats = updateArrayData(chats, chat, 'id', false);
          setChats(updatedChats);
          setActiveChat(null);
        }
      }
    },
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
      filter: {
        chat_id: `eq.${chatId}`,
      },
    },
    {
      tableName: 'files',
      currentData: [],
      setData: ((data) => data) as Dispatch<
        SetStateAction<File.Type[] | File.Type>
      >,
    },
    {
      tableName: 'chats',
      currentData: chats,
      setData: setChats,
    },
  ];

  // Initialize real-time subscriptions
  useRealtime(
    tables as TableConfig<Message.Type | File.Type | Chats.Type>[],
    realtimeConfig,
    handleSubscriptions,
  );

  const { markChatAsRead } = useUnreadMessageCounts({userId: user.id, userRole: currentUser?.role ?? '', userOrganizationId: organization?.id ?? ''});
  
  // Create a proper setChatId function that matches the expected type
  const setChatId = (value: string | ((prevState: string) => string)) => {
    const newChatId = typeof value === 'function' ? value(chatId) : value;
    const chat = chats.find(c => c.id === newChatId);
    if (chat && setActiveChat) {
      setActiveChat(chat);
    }
  };
  
  const value: ChatContextType = {
    messages: messages.filter((msg) => !('deleted_at' in msg)),
    setMessages: setMessages,
    members,
    setMembers,
    activeChat,
    setActiveChat,
    chatId: chatId ?? '',
    setChatId,
    isChatCreationDialogOpen,
    setIsChatCreationDialogOpen,
    searchQuery,
    setSearchQuery,
    chatsQuery,
    filteredChats,
    setFilteredChats,
    setChats: setChats as ActiveChatState['setChats'],
    user: {
      role: currentUser?.role ?? '',
      id: currentUser?.id ?? '',
      name: currentUser?.name ?? '',
      email: user?.email ?? '',
      picture_url: currentUser?.picture_url ?? '',
    },
    fileUploads,
    handleFileUpload,
    handleFileRemove,
    chatByIdQuery,
    ...chatActions,
    ...messageActions,
  };

  useEffect(() => {
    if (activeChat?.id) {
      void markChatAsRead(activeChat.id);
    }
  }, [activeChat?.id, markChatAsRead]);

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
