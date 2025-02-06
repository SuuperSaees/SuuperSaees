'use client';

import { useCallback, useMemo, useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import { ChatMembers } from '~/lib/chat-members.types';
import { Chats } from '~/lib/chats.types';
import { Message } from '~/lib/message.types';
import { GetChatByIdResponse } from '~/server/actions/chats/chats.interface';

/**
 * Props interface for useChatState hook
 * @interface UseChatStateProps
 * @property {ChatMembers.Type[]} initialMembers - Initial list of chat members
 */
interface UseChatStateProps {
  initialMembers: ChatMembers.Type[];
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
 */
const useChatState = ({ initialMembers }: UseChatStateProps) => {
  // State for tracking current chat ID and active chat
  const [chatId, setChatId] = useState<string>('');
  const [activeChat, setActiveChat] = useState<Chats.Type | null>(null);

  // State for chat members with initial values
  const [members, setMembers] = useState<ChatMembers.Type[]>(
    initialMembers ?? [],
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
      ) as GetChatByIdResponse;
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

  return {
    chatId,
    setChatId,
    activeChat,
    setActiveChat,
    members,
    setMembers,
    setMessages,
    messagesQueryKey,
  };
};

export default useChatState;
