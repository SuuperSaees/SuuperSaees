'use client';

import { useCallback, useMemo, useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import { Chats } from '~/lib/chats.types';
import { Message } from '~/lib/message.types';
import { User } from '~/lib/user.types';

/**
 * Props interface for useChatState hook
 * @interface UseChatStateProps
 * @property {ChatMembers.Type[]} initialMembers - Initial list of chat members
 */
interface UseChatStateProps {
  initialMembers: User.Response[];
}

/**
 * Custom hook for managing chat state
 * Handles chat ID, active chat, members, and messages state management
 *
 * @param {UseChatStateProps} props - Hook properties
 * @returns {Object} Object containing chat state and setters
 * @property {string} chatId - Current chat ID
 * @property {Function} setChatId - Function to update chat ID
 * @property {Chats.Type | null} activeChat - Currently active chat
 * @property {Function} setActiveChat - Function to update active chat
 * @property {ChatMembers.Type[]} members - List of chat members
 * @property {Function} setMembers - Function to update members list
 * @property {Function} setMessages - Optimized function to update messages using QueryClient
 * @property {string[]} messagesQueryKey - Query key for messages cache
 * @property {Function} setChats - Optimized function to update chats using QueryClient
 * @property {string} searchQuery - Current search query
 * @property {Function} setSearchQuery - Function to update search query
 * @property {Chats.TypeWithRelations[]} filteredChats - Filtered chats based on search query
 * @property {Function} setFilteredChats - Function to update filtered chats
 * @property {boolean} isChatCreationDialogOpen - Whether the chat creation dialog is open
 * @property {Function} setIsChatCreationDialogOpen - Function to update chat creation dialog open state
 */


const useChatState = ({ initialMembers }: UseChatStateProps) => {
  // State for tracking current chat ID and active chat
  const [chatId, setChatId] = useState<string>('');
  const [activeChat, setActiveChat] = useState<Chats.Type | null>(null);
  const [isChatCreationDialogOpen, setIsChatCreationDialogOpen] =
    useState(false);
  // State for chat members with initial values
  const [members, setMembers] = useState<User.Response[]>(
    initialMembers ?? [],
  );

  // State for search query
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredChats, setFilteredChats] = useState<Chats.TypeWithRelations[]>(
    [],
  );

  // Query key for messages cache
  // TODO: Update to use 'chat-messages' prefix in future
  const messagesQueryKey = useMemo(() => ['chat', chatId], [chatId]);

  const queryClient = useQueryClient();

  /**
   * Optimized message setter that works with React Query cache
   * Updates messages while preserving other chat data
   *
   * @param {Message.Type[] | ((prev: Message.Type[]) => Message.Type[])} updater - New messages or update function
   */
  const setMessages = useCallback(
    (updater: Message.Type[] | ((prev: Message.Type[]) => Message.Type[])) => {
      // TODO: Refactor to use messages data directly from query
      const currentChat = queryClient.getQueryData(
        messagesQueryKey,
      ) as Chats.TypeWithRelations;
      const currentMessages = currentChat?.messages ?? [];

      const newMessages =
        typeof updater === 'function' ? updater(currentMessages) : updater;
      queryClient.setQueryData(messagesQueryKey, {
        ...currentChat,
        messages: newMessages,
      });
    },
    [queryClient, messagesQueryKey],
  );

  /**
   * Optimized chat setter that works with React Query cache
   * Updates chats while preserving other chat data
   *
   * @param {Chats.Type} data - New chat data
   */
  const setChats = useCallback(
    (
      updater:
        | Chats.Type
        | ((prev: Chats.TypeWithRelations[]) => Chats.TypeWithRelations[]),
    ) => {
      const currentChats =
        queryClient.getQueryData<Chats.TypeWithRelations[]>(['chats']) ??
        ([] as Chats.TypeWithRelations[]);
      const newChats =
        typeof updater === 'function' ? updater(currentChats ?? []) : updater;

      queryClient.setQueryData(['chats'], newChats);
    },
    [queryClient],
  );

  return {
    chatId,
    setChatId,
    activeChat,
    setActiveChat,
    members,
    setMembers,
    setMessages,
    messagesQueryKey,
    searchQuery,
    setSearchQuery,
    filteredChats,
    setFilteredChats,
    isChatCreationDialogOpen,
    setIsChatCreationDialogOpen,
    setChats,
  };
};


export default useChatState;
