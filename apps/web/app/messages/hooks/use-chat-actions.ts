'use client';

import { Dispatch } from 'react';
import { SetStateAction } from 'react';

import { Chats } from '~/lib/chats.types';
import { Message } from '~/lib/message.types';
import { User } from '~/lib/user.types';

import { useChatManagement } from './use-chat-management-actions';
import { useChatMessageActions } from './use-chat-message-actions';

/**
 * Props interface for useChatActions hook
 * @interface UseChatActionsProps
 * @property {Message.Type[]} messages - Array of chat messages
 * @property {Function} setMessages - Function to update messages state
 * @property {string | null} activeChat - ID of currently active chat
 * @property {Chats.Type | null} activeChatData - Data of currently active chat
 * @property {Function} setActiveChatData - Function to update active chat data
 * @property {Pick<User.Response, 'id' | 'name' | 'email' | 'picture_url'>} user - Current user information
 * @property {Function} setActiveChat - Function to update active chat ID
 */
interface UseChatActionsProps {
  messages: Message.Type[];
  setMessages: Dispatch<SetStateAction<Message.Type[]>>;
  activeChat: string | null;
  activeChatData: Chats.Type | null;
  setActiveChatData: Dispatch<SetStateAction<Chats.Type | null>>;
  user: Pick<User.Response, 'id' | 'name' | 'email' | 'picture_url'>;
  setActiveChat: Dispatch<SetStateAction<string | null>>;
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
  activeChatData,
  activeChat,
  setActiveChatData,
  user,
  setActiveChat,
}: UseChatActionsProps) => {
  const { addMessageMutation, deleteMessageMutation } = useChatMessageActions({
    messages,
    setMessages,
    activeChatData,
    user,
  });
  const {
    updateChatMutation,
    deleteChatMutation,
    createChatMutation,
    membersUpdateMutation,
    chatsQuery,
    chatByIdQuery,
  } = useChatManagement({
    setMessages,
    activeChat,
    activeChatData,
    setActiveChat,
    setActiveChatData,
    user,
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
