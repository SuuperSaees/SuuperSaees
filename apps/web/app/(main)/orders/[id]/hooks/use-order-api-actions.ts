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
  interactions: DataResult.InteractionPages;
  setInteractions:
    | Dispatch<SetStateAction<DataResult.InteractionPages>>
    | ((
        updater:
          | DataResult.InteractionPages
          | ((
              prev: DataResult.InteractionPages,
            ) => DataResult.InteractionPages),
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
  interactions,
  setInteractions,
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
        queryKey: ['interactions', orderId],
      });

      // Snapshot the previous messages and chats
      const previousInteractions = interactions;

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
          id: file.id ?? `temp-${Date.now()}-${Math.random()}`,
          isLoading: true,
          temp_id: file.temp_id,
        })),
        temp_id: tempId,
        pending: true,
        updated_at: new Date().toISOString(),
        chat_id: null,
        deleted_on: null,
        parent_id: null,
        type: 'chat_message',
      };

      setInteractions((oldInteractions) => {
        // console.log('setting messages', optimisticMessage);
        const newPages = [...(oldInteractions?.pages ?? [])];
        const newInitialPageMessages = [
          ...(newPages[0]?.messages ?? []),
          optimisticMessage,
        ];
        newPages[0] = {
          ...newPages[0],
          messages: newInitialPageMessages,
          activities: newPages[0]?.activities ?? [],
          reviews: newPages[0]?.reviews ?? [],
          // briefResponses: newPages[0]?.briefResponses ?? [],
          nextCursor: newPages[0]?.nextCursor ?? null,
        };
        return {
          pages: newPages,
          pageParams: oldInteractions?.pageParams ?? [],
        };
      });

      // Return the snapshot in case of rollback
      return { optimisticMessage, previousInteractions };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousInteractions) {
        setInteractions(context.previousInteractions);
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
      // Note: Not invalidating queries here as real-time subscriptions will handle updates
      // This prevents race conditions between optimistic updates and fresh data fetches
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
      await queryClient.cancelQueries({ queryKey: ['interactions', orderId] });

      // Store the previous messages state
      const previousInteractions = interactions;

      // Optimistically update the UI

      setInteractions((oldInteractions) => {
        const newPages = [...(oldInteractions?.pages ?? [])];
        let pageIndex = -1;
        let messageIndex = -1;
        interactions?.pages.some((page, pIndex) => {
          const mIndex = page.messages.findIndex(
            (message) => message.id === messageId,
          );
          if (mIndex !== -1) {
            pageIndex = pIndex;
            messageIndex = mIndex;
            return true;
          }
          return false;
        });
        const messagesToUpdate = [
          ...(interactions?.pages[pageIndex]?.messages ?? []),
        ];
        const messageToUpdate = messagesToUpdate[messageIndex];
        if (!messageToUpdate) return oldInteractions;

        messageToUpdate.deleted_on = new Date().toISOString();
        newPages[pageIndex] = {
          ...newPages[pageIndex],
          messages: messagesToUpdate,
          activities: newPages[pageIndex]?.activities ?? [],
          reviews: newPages[pageIndex]?.reviews ?? [],
            // briefResponses: newPages[pageIndex]?.briefResponses ?? [],
          nextCursor: newPages[pageIndex]?.nextCursor ?? null,
        };
        return {
          pages: newPages,
          pageParams: oldInteractions?.pageParams ?? [],
        };
      });

      return { previousInteractions };
    },
    onError: (_error, _variables, context) => {
      // Rollback on error
      if (context?.previousInteractions) {
        setInteractions(context.previousInteractions);
      }
      toast.error(t('message.error'), {
        description: t('message.messageDeletedError'),
      });
    },
    onSuccess: () => {
      toast.success(t('message.messageDeleted'), {
        description: t('message.messageDeletedSuccess'),
      });
      // await queryClient.invalidateQueries({
      //   queryKey: ['interactions', orderId],
      // });
    },
  });

  return { addMessageMutation, deleteMessageMutation };
};
