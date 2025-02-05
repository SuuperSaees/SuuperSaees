import { Dispatch } from 'react';
import { SetStateAction } from 'react';

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Chats } from '~/lib/chats.types';
import { Message } from '~/lib/message.types';
import { User } from '~/lib/user.types';
import {
  createMessage,
  deleteMessage,
} from '~/server/actions/chat-messages/chat-messages.action';
import { updateFile } from '~/team-accounts/src/server/actions/files/update/update-file';
import { generateUUID } from '~/utils/generate-uuid';

/**
 * Props interface for useChatMessageActions hook
 * @interface ChatMessageActionsProps
 * @property {Message.Type[]} messages - Array of chat messages
 * @property {Function} setMessages - Function to update messages state
 * @property {Chats.Type | null} activeChatData - Data of currently active chat
 * @property {Pick<User.Response, 'id' | 'name' | 'email' | 'picture_url'>} user - Current user information
 */
interface ChatMessageActionsProps {
  messages: Message.Type[];
  setMessages: Dispatch<SetStateAction<Message.Type[]>>;
  activeChatData: Chats.Type | null;
  user: Pick<User.Response, 'id' | 'name' | 'email' | 'picture_url'>;
}

/**
 * Custom hook for managing chat message actions like adding and deleting messages
 * @param {ChatMessageActionsProps} props - Hook properties
 * @returns {Object} Object containing message-related mutations
 */
export const useChatMessageActions = ({
  messages,
  setMessages,
  activeChatData,
  user,
}: ChatMessageActionsProps) => {
  /**
   * Mutation for adding new messages to the chat
   * Handles optimistic updates and file attachments
   */
  const addMessageMutation = useMutation({
    mutationFn: async ({
      content,
      fileIds,
      userId,
    }: {
      content: string;
      fileIds?: string[];
      userId: string;
    }) => {
      if (!activeChatData) throw new Error('No active chat');

      const messageData = { user_id: userId, content };
      const response = await createMessage({
        message_id: '',
        chat_id: activeChatData.id,
        messages: [messageData],
      });

      if (fileIds?.length) {
        await Promise.all(
          fileIds.map((fileId) => updateFile(fileId, response.id)),
        );
      }

      return response;
    },
    onMutate: ({ content }) => {
      // Create optimistic message with temporary ID
      const tempId = generateUUID();
      const optimisticMessage: Message.Type = {
        content,
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        visibility: Message.Visibility.PUBLIC,
        id: 'temp-' + tempId,
        deleted_on: null,
        order_id: null,
        parent_id: null,
        type: Message.Category.CHAT_MESSAGE,
        temp_id: tempId,
        user,
      };

      setMessages((prev) => [...prev, optimisticMessage]);
      return { optimisticMessage };
    },
    onError: (_, __, context) => {
      // Remove optimistic message on error
      if (context?.optimisticMessage) {
        setMessages((prev) =>
          prev.filter(
            (msg) => msg.temp_id !== context.optimisticMessage.temp_id,
          ),
        );
      }
      toast.error('Failed to send message');
    },
  });

  /**
   * Mutation for deleting messages from the chat
   * Handles optimistic updates and error recovery
   */
  const deleteMessageMutation = useMutation({
    mutationFn: deleteMessage,
    onMutate: (messageId) => {
      // Store current messages for recovery
      const previousMessages = messages;
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? { ...msg, deleted_at: new Date().toISOString() }
            : msg,
        ),
      );
      return { previousMessages };
    },
    onError: (_, __, context) => {
      // Restore previous messages on error
      if (context?.previousMessages) {
        setMessages(context.previousMessages);
      }
      toast.error('Failed to delete message');
    },
    onSuccess: () => {
      toast.success('Message deleted successfully');
    },
  });

  return {
    deleteMessageMutation,
    addMessageMutation,
  };
};
