'use client';

import { Dispatch } from 'react';
import { SetStateAction } from 'react';

import { Message } from '~/lib/message.types';
import { User } from '~/lib/user.types';

import { useChatManagement } from './use-chat-management-actions';
import { useChatMessageActions } from './use-chat-message-actions';
import { Chats } from '~/lib/chats.types';

/**
 * Props interface for useChatActions hook
 * @interface UseChatActionsProps
 * @property {Message.Type[]} messages - Array of chat messages
 * @property {Function} setMessages - Function to update messages state
 * @property {string} chatId - ID of currently active chat
 * @property {Pick<User.Response, 'id' | 'name' | 'email' | 'picture_url'>} user - Current user information
 */

interface UseChatActionsProps {
  chatId: string;
  initialChat?: Chats.TypeWithRelations;
  messagesQueryKey: string[];
  chatQueryKey: string[];
  messages: Message.Type[];
  user: Pick<User.Response, 'id' | 'name' | 'email' | 'picture_url'>;
  setMessages: Dispatch<SetStateAction<Message.Type[]>>;
}

/**
 * Custom hook that combines chat message and management actions
 * @param {UseChatActionsProps} props - Hook properties
 * @returns {Object} Object containing all chat-related mutations and queries
 * @property {UseMutationResult} addMessageMutation - Mutation for adding new messages
 * @property {UseMutationResult} deleteMessageMutation - Mutation for deleting messages
 * @property {UseMutationResult} membersUpdateMutation - Mutation for updating chat members
 * @property {UseMutationResult} deleteChatMutation - Mutation for deleting entire chat
 * @property {UseMutationResult} updateChatMutation - Mutation for updating chat details
 * @property {UseQueryResult} chatByIdQuery - Query for fetching specific chat
 * @property {UseMutationResult} createChatMutation - Mutation for creating new chat
 * @property {UseQueryResult} chatsQuery - Query for fetching all chats
 */
const useChatActions = ({
  messages,
  setMessages,
  chatId,
  user,
  messagesQueryKey,
  chatQueryKey,
  initialChat,
}: UseChatActionsProps) => {
  const { addMessageMutation, deleteMessageMutation } = useChatMessageActions({
    messages,
    setMessages,
    chatId,
    user,
    queryKey: messagesQueryKey,

  });

  const {
    updateChatMutation,
    deleteChatMutation,
    createChatMutation,
    membersUpdateMutation,
    chatsQuery,
    chatByIdQuery,
  } = useChatManagement({
    chatId,
    initialChat,
    setMessages,
    userId: user.id,
    queryKey: chatQueryKey,

  });

  return {
    addMessageMutation,
    deleteMessageMutation,
    membersUpdateMutation,
    deleteChatMutation,
    updateChatMutation,
    chatByIdQuery,
    createChatMutation,
    chatsQuery,
  };
};

export default useChatActions;
