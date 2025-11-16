import { Dispatch } from 'react';
import { SetStateAction } from 'react';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { File } from '~/lib/file.types';
import { Message } from '~/lib/message.types';
import { User } from '~/lib/user.types';
import {
  createMessage,
  deleteMessage,
} from '~/server/actions/chat-messages/chat-messages.action';
import { createFile } from '~/server/actions/files/files.action';
import { Chats } from '~/lib/chats.types';

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

interface MutationContext {
  previousMessages: Message.Type[];
  previousChats: Chats.TypeWithRelations[] | undefined;
}

interface DeleteMessageVariables {
  chatId: string;
  messageId: string;
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
      message,
      files,
    }: {
      message: Message.Insert;
      files?: File.Insert[];
    }) => {
      const messageData = {
        user_id: user.id,
        content: message.content,
        temp_id: message.temp_id,
        id: message.id,
        chat_id: chatId,
        visibility: message.visibility,
      };
      const response = await createMessage({
        id: message.id,
        message_id: '',
        chat_id: chatId,
        messages: [messageData],
      });

      return { message: response, files: files };
    },
    onMutate: async ({ message, files }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey });
      await queryClient.cancelQueries({ queryKey: ['chats'] });

      // Snapshot the previous messages and chats
      const previousMessages = messages;
      const previousChats = queryClient.getQueryData<Chats.TypeWithRelations[]>(['chats']);

      // Create optimistic message with temporary ID
      const tempId = message.temp_id;
      const optimisticMessage: Message.Type = {
        content: message.content ?? '',
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        visibility: message.visibility as Message.Visibility,
        id: 'temp-' + tempId,
        deleted_on: null,
        order_id: null,
        parent_id: null,
        type: Message.Category.CHAT_MESSAGE,
        temp_id: tempId ?? '',
        user: user,
        files: files?.map((file) => ({ ...file, isLoading: true, temp_id: file.temp_id })) ?? [],
        chat_id: chatId,
      };

      // Update messages in the current chat
      setMessages((prev) => {
        const newMessages = [...prev, optimisticMessage];
        return newMessages;
      });

      // Update the last message in the chats list
      if (previousChats) {
        queryClient.setQueryData<Chats.TypeWithRelations[]>(['chats'], 
          previousChats.map((chat) => {
            if (chat.id === chatId) {
              return {
                ...chat,
                messages: [optimisticMessage],
                chat_messages: chat.chat_messages?.map(cm => ({
                  ...cm,
                  messages: [optimisticMessage]
                }))
              };
            }
            return chat;
          })
        );
      }

      return { previousMessages, previousChats };
    },
    onError: (_, __, context) => {
      // Restore both messages and chats on error
      if (context) {
        queryClient.setQueryData(queryKey, context.previousMessages);
        queryClient.setQueryData(['chats'], context.previousChats);
      }
      toast.error('Failed to send message');
    },

    onSuccess: async (data) => {
      if (data.files) {
        await createFile({ files: data.files });
      }
      void queryClient.invalidateQueries({ queryKey });
      void queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
  });

  /**
   * Mutation for deleting messages from the chat
   * Handles optimistic updates and error recovery
   */
  const deleteMessageMutation = useMutation<
    void,
    Error,
    DeleteMessageVariables,
    MutationContext
  >({
    mutationFn: ({ chatId, messageId }) => deleteMessage({ chatId, messageId }),
    onMutate: ({ messageId }) => {
      // Store current messages for recovery
      const previousMessages = messages;
      const previousChats = queryClient.getQueryData<Chats.TypeWithRelations[]>(['chats']);

      // Update message in current chat
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? { ...msg, deleted_at: new Date().toISOString() }
            : msg,
        ),
      );

      // Update message in chats list if it was the last message
      if (previousChats) {
        queryClient.setQueryData<Chats.TypeWithRelations[]>(['chats'], 
          previousChats.map((chat) => {
            if (chat.id === chatId && chat.messages?.[0]?.id === messageId) {
              const newLastMessage = messages.filter(m => m.id !== messageId).pop();
              return {
                ...chat,
                messages: newLastMessage ? [newLastMessage] : [],
                chat_messages: chat.chat_messages?.map(cm => ({
                  ...cm,
                  messages: newLastMessage ? [newLastMessage] : []
                }))
              };
            }
            return chat;
          })
        );
      }

      return { previousMessages, previousChats };
    },
    onError: (_, __, context) => {
      // Restore both messages and chats on error
      if (context) {
        setMessages(context.previousMessages);
        queryClient.setQueryData(['chats'], context.previousChats);
      }
      toast.error('Failed to delete message');
    },
    onSuccess: () => {
      toast.success('Message deleted successfully');
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey });
      void queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
  });

  return {
    deleteMessageMutation,
    addMessageMutation,
  };
};
