import { Dispatch } from 'react';
import { SetStateAction } from 'react';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Message } from '~/lib/message.types';
import { User } from '~/lib/user.types';
import {
  createMessage,
  deleteMessage,
} from '~/server/actions/chat-messages/chat-messages.action';
import { updateFile } from '~/team-accounts/src/server/actions/files/update/update-file';

/**
 * Props interface for useChatMessageActions hook
 * @interface ChatMessageActionsProps
 * @property {Message.Type[]} messages - Array of the current chat messages
 * @property {Function} setMessages - Function to update messages state
 * @property {string} chatId - ID of currently active chat
 * @property {Pick<User.Response, 'id' | 'name' | 'email' | 'picture_url'>} user - Current user information
 */

interface ChatMessageActionsProps {
  chatId: string;
  messages: Message.Type[];
  setMessages:
    | Dispatch<SetStateAction<Message.Type[]>>
    | ((
        updater: Message.Type[] | ((prev: Message.Type[]) => Message.Type[]),
      ) => void);
  user: Pick<User.Response, 'id' | 'name' | 'email' | 'picture_url'>;
  queryKey: string[];
}

/**
 * Custom hook for managing chat message actions like adding and deleting messages
 * @param {ChatMessageActionsProps} props - Hook properties
 * @returns {Object} Object containing message-related mutations
 */
export const useChatMessageActions = ({
  chatId,
  messages,
  setMessages,
  user,
  queryKey = ['chat-messages', chatId],
}: ChatMessageActionsProps) => {
  const queryClient = useQueryClient();
  /**
   * Mutation for adding new messages to the chat

   * Handles optimistic updates and file attachments
   */

  const addMessageMutation = useMutation({
    mutationFn: async ({
      content,

      fileIds,
      userId,
      temp_id,
    }: {
      content: string;
      fileIds?: string[];
      userId: string;
      temp_id: string;
    }) => {
      const messageData = { user_id: userId, content, temp_id };
      const response = await createMessage({
        message_id: '',
        chat_id: chatId,
        messages: [messageData],
      });

      if (fileIds?.length) {
        await Promise.all(
          fileIds.map((fileId) => updateFile(fileId, response.id)),
        );
      }

      return response;
    },
    onMutate: async ({ content, temp_id }) => {
      // Cancel any outgoing refetches
      // (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey });

      // Snapshot the previous messages
      const previousMessages = messages;

      // Optimistically update to the new value
      // Create optimistic message with temporary ID
      const tempId = temp_id;

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

      setMessages((prev) => {
        const newMessages = [...prev, optimisticMessage];
        return newMessages;
      });
      return { previousMessages };
    },
    // If the mutation fails,
    // use the context returned from onMutate to roll back
    onError: (_, __, context) => {
      queryClient.setQueryData(queryKey, context?.previousMessages);
      toast.error('Failed to send message');
    },
    // Always refetch after error or success
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey });
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
