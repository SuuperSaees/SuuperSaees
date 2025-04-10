'use client';

import { Dispatch, SetStateAction } from 'react';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { useUserWorkspace } from '@kit/accounts/hooks/use-user-workspace';

import { File } from '~/lib/file.types';
import { Message } from '~/lib/message.types';
import { insertFilesInFolder } from '~/team-accounts/src/server/actions/files/create/create-file';
import { deleteMessage } from '~/team-accounts/src/server/actions/messages/delete/delete-messages';
import { addOrderMessage } from '~/team-accounts/src/server/actions/orders/update/update-order';

import { DataResult } from '../context/activity.types';
import useInternalMessaging from './use-messages';

export interface OrderApiActionsProps {
  orderId: number;
  orderUUID: string;
  clientOrganizationId: string;
  agencyId: string;
  messages: DataResult.Message[];
  setMessages:
    | Dispatch<SetStateAction<DataResult.Message[]>>
    | ((
        updater:
          | DataResult.Message[]
          | ((prev: DataResult.Message[]) => DataResult.Message[]),
      ) => void);
}

/**
 * Custom hook for managing api actions for an order
 * @param {string} orderId - The id of the order@param {string} orderId - The id of the order
 */

export const useOrderApiActions = ({
  orderId,
  orderUUID,
  clientOrganizationId,
  agencyId,
  messages,
  setMessages,
}: OrderApiActionsProps) => {
  const queryClient = useQueryClient();
  const { getInternalMessagingEnabled } = useInternalMessaging();
  const { workspace: currentUser, user } = useUserWorkspace();
  const { t } = useTranslation('orders');

  /**
   * Mutation for adding new messages to the order
   * Handles optimistic updates and file attachments
   */
  const addMessageMutation = useMutation({
    mutationFn: async ({
      message,
      files,
      tempId,
    }: {
      message: Message.Insert;
      files: File.Insert[];
      tempId: string;
    }) => {
      const newMessage = await addOrderMessage(Number(orderId), message);

      return { message: newMessage, files: files, tempId: tempId };
    },
    onMutate: async ({ message, files, tempId }) => {
      // Cancel outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({
        queryKey: ['messages'],
      });

      // Snapshot the previous messages and chats
      const previousMessages = messages;

      const optimisticMessage: DataResult.Message = {
        id: message.id ?? '', // Temporary ID
        content: message.content ?? '',
        order_id: Number(orderId),
        visibility: getInternalMessagingEnabled()
          ? 'internal_agency'
          : 'public',
        created_at: new Date().toISOString(),
        user: {
          id: currentUser?.id ?? '',
          name: currentUser?.name ?? '',
          email: user?.email ?? '',
          picture_url: currentUser.picture_url ?? '',
        },
        user_id: currentUser?.id ?? '',
        files: files.map((file) => ({
          ...file,
          isLoading: true,
          temp_id: file.temp_id,
        })),
        reactions: [], // Default to an empty array if not provided,
        temp_id: tempId,
        pending: true,
        updated_at: new Date().toISOString(),
        chat_id: null,
        deleted_on: null,
        parent_id: null,
        type: 'chat_message',
      };

      setMessages((oldMessages) => {
        console.log('setting messages', optimisticMessage);
        const newMessages = [...oldMessages, optimisticMessage];
        return newMessages;
      });

      // Return the snapshot in case of rollback
      return { optimisticMessage, previousMessages };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousMessages) {
        setMessages(context.previousMessages);
      }
      toast.error('Error', {
        description: 'The message could not be sent.',
      });
    },
    onSuccess: async (data, _variables) => {
      const { files } = data;

      if (files && files.length > 0) {
        await insertFilesInFolder(
          orderUUID,
          files,
          clientOrganizationId,
          agencyId,
        );
      }
      //  Remove the pending state of the message and for each file of the message the isLoading state
      setMessages((prev) => {
        // Only for the message that was sent
        return prev.map((message) => {
          if (message.id === data.message.id && message.files) {
            return {
              ...message,
              pending: false,
              files: message.files.map((file) => ({
                ...file,
                isLoading: false,
              })),
            };
          }
          return message;
        });
      });
      // Invalidate the messages query to refresh the data
      void queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });

  /**
   * Mutation for deleting messages from the order
   * Handles optimistic updates and deletion
   */
  const deleteMessageMutation = useMutation({
    mutationFn: ({
      messageId,
      adminActived,
    }: {
      messageId: string;
      adminActived?: boolean;
    }) => deleteMessage(messageId, adminActived),
    onMutate: async ({ messageId }) => {
      await queryClient.cancelQueries({ queryKey: ['messages'] });

      // Store the previous messages state
      const previousMessages = messages;

      // Optimistically update the UI
      setMessages((oldMessages) =>
        oldMessages.map((message) =>
          message.id === messageId
            ? { ...message, deleted_on: new Date().toISOString() }
            : message,
        ),
      );

      return { previousMessages };
    },
    onError: (_error, _variables, context) => {
      // Rollback on error
      if (context?.previousMessages) {
        setMessages(context.previousMessages);
      }
      toast.error(t('message.error'), {
        description: t('message.messageDeletedError'),
      });
    },
    onSuccess: () => {
      toast.success(t('message.messageDeleted'), {
        description: t('message.messageDeletedSuccess'),
      });
    },
  });

  return { addMessageMutation, deleteMessageMutation };
};
