'use client';

import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useState,
} from 'react';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateFile } from 'node_modules/@kit/team-accounts/src/server/actions/files/update/update-file';
import { getUserById } from 'node_modules/@kit/team-accounts/src/server/actions/members/get/get-member-account';
import { addOrderMessage } from 'node_modules/@kit/team-accounts/src/server/actions/orders/update/update-order';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { useUserWorkspace } from '@kit/accounts/hooks/use-user-workspace';

import { deleteMessage } from '~/team-accounts/src/server/actions/messages/delete/delete-messages';
import { generateUUID } from '~/utils/generate-uuid';

import useInternalMessaging from '../hooks/use-messages';
import { useOrderSubscriptions } from '../hooks/use-subscriptions';
import {
  ActivityContextType,
  DataResult,
  DataSource,
  SubscriptionPayload,
  TableName,
  UserExtended,
} from './activity.types';
import { Brief } from '~/lib/brief.types';

export const ActivityContext = createContext<ActivityContextType | undefined>(
  undefined,
);

export const ActivityProvider = ({
  children,
  activities: serverActivities,
  messages: serverMessages,
  reviews: serverReviews,
  files: serverFiles,
  order: serverOrder,
  briefResponses: serverBriefResponses,
  userRole,
}: {
  children: ReactNode;
  activities: DataResult.Activity[];
  messages: DataResult.Message[];
  reviews: DataResult.Review[];
  files: DataResult.File[];
  order: DataResult.Order;
  userRole: string;
  briefResponses: Brief.Relationships.FormFieldResponse.Response[];
}) => {
  const { t } = useTranslation('orders');
  const [order, setOrder] = useState<DataResult.Order>(serverOrder);
  const [messages, setMessages] =
    useState<DataResult.Message[]>(serverMessages);
  const [activities, setActivities] =
    useState<DataResult.Activity[]>(serverActivities);
  const [reviews, setReviews] = useState<DataResult.Review[]>(serverReviews);
  const [files, setFiles] = useState<DataResult.File[]>(serverFiles);
  const { getInternalMessagingEnabled } = useInternalMessaging();
  const queryClient = useQueryClient();
  const [loadingMessages, setLoadingMessages] = useState(false);
  const { workspace: currentUser, user } = useUserWorkspace();

  const writeMessage = async (
    { message, fileIdsList }: { message: string; fileIdsList?: string[] },
    tempId: string,
  ) => {
    const messageId = crypto.randomUUID();
    try {
      const messageToSend = {
        id: messageId,
        content: message,
        order_id: Number(order.id),
        visibility: getInternalMessagingEnabled()
          ? 'internal_agency'
          : 'public',
        temp_id: tempId,
      };
      const newMessage = await addOrderMessage(
        currentUser.id ?? '',
        Number(order.id),
        messageToSend,
        messageToSend.visibility as DataResult.Message['visibility'],
      );
      // If there are file IDs, update the files with the new message ID
      if (fileIdsList && fileIdsList.length > 0) {
        for (const fileId of fileIdsList) {
          await updateFile(fileId, messageId);
        }
      }

      toast.success(t('message.success'), {
        description: t('message.messageSent'),
      });

      return newMessage;
    } catch (error) {
      toast.error(t('message.error'), {
        description: t('message.messageSentError'),
      });
      throw error;
    } finally {
      setLoadingMessages(false);
    }
  };

  const addMessageMutation = useMutation({
    mutationFn: ({
      message,
      fileIdsList,
      tempId,
    }: {
      message: string;
      fileIdsList?: string[];
      tempId: string;
    }) => writeMessage({ message, fileIdsList }, tempId),
    onMutate: async ({ message, tempId }) => {
      // Cancel outgoing refetches (so they don't overwrite our optimistic update)
      setLoadingMessages(true);
      await queryClient.cancelQueries({
        queryKey: ['messages'],
      });

      const optimisticMessage: DataResult.Message = {
        id: 'temp-' + tempId, // Temporary ID
        content: message,
        order_id: Number(order.id),
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
        files: [], // Default to an empty array if not provided
        reactions: [], // Default to an empty array if not provided,
        temp_id: tempId,
        pending: true,
        updated_at: new Date().toISOString(),
      };

      setMessages((oldMessages) => [...oldMessages, optimisticMessage]);

      // Return the snapshot in case of rollback
      return { optimisticMessage };
    },
    onError: (_error, _variables, context) => {
      setMessages((prevMessages) =>
        prevMessages.filter(
          (msg) => msg.temp_id !== context?.optimisticMessage.temp_id,
        ),
      );
      toast.error('Error', {
        description: 'The message could not be sent.',
      });
    },
    onSuccess: (newMessage, _variables, context) => {
      const realMessage = {
        ...newMessage,
        user: context.optimisticMessage.user,
        files: [],
        reactions: [],
      };
      setMessages((prevMessages) => {
        return reconcileState(
          prevMessages,
          realMessage,
        ) as DataResult.Message[];
      });
    },
    onSettled: () => {
      setLoadingMessages(false);
    },
  });

  const deleteMessageMutation = useMutation({
    mutationFn: (messageId: string) => deleteMessage(messageId),
    onMutate: async (messageId) => {
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

  const reconcileState = (
    items: DataResult.ArrayTarget[],
    newItem: DataResult.ArrayTarget,
  ) => {
    const itemsMatch = (
      tempItem: DataResult.ArrayTarget,
      newItem: DataResult.ArrayTarget,
    ) => {
      return tempItem?.temp_id === newItem?.temp_id;
    };
    // avoid duplicate items
    if (!items.some((msg) => msg.id === newItem.id)) {
      const existingIndex = items.findIndex((item) =>
        itemsMatch(item, newItem),
      );

      if (existingIndex !== -1) {
        // Replace the existing item
        return items.map((item, index) =>
          index === existingIndex ? newItem : item,
        );
      } else {
        // Append the new item if it doesn't already exist
        return [...items, newItem];
      }
    } else {
      return items;
    }
  };

  const reconcileData = useCallback(
    async (
      pureDataSource: DataSource.All,
      dataTarget: DataResult.All,
      tableName: TableName,
    ) => {
      if (Array.isArray(dataTarget)) {
        let newDataUser = dataTarget.find(
          (data) =>
            data?.user?.id ===
            (pureDataSource as DataSource.ArrayTarget)?.user_id,
        )?.user as UserExtended;

        if (!newDataUser) {
          try {
            newDataUser = await getUserById(
              (pureDataSource as DataSource.ArrayTarget).user_id,
            );
          } catch (err) {
            console.error('Error fetching user:', err);
            throw err; // Rethrow the error if you want the caller to handle it
          }
        }

        let nestedFiles = undefined;

        if (tableName === TableName.MESSAGES) {
          const hasRelatedFiles = () => {
            return files.some((file) => file.message_id === pureDataSource.id);
          };

          if (hasRelatedFiles()) {
            nestedFiles = files.filter(
              (file) => file.message_id === pureDataSource.id,
            );
          }
        } else if (tableName === TableName.FILES) {
          const fileData = pureDataSource as DataSource.File;
          if (fileData.message_id) {
            setMessages((prevMessages) => {
              return prevMessages.map((msg) => {
                if (msg.id === fileData.message_id) {
                  return {
                    ...msg,
                    files: [
                      ...(msg.files ?? []),
                      { ...fileData, user: newDataUser },
                    ] as DataResult.File[],
                  };
                }
                return msg;
              });
            });
          }
        }

        const reconciledData = {
          ...pureDataSource,
          user: newDataUser,
          files: nestedFiles,
        };

        return reconciledData;
      } else {
        let reconciledData = dataTarget;
        if (tableName === TableName.ORDER) {
          if (
            'status' in pureDataSource &&
            'status' in dataTarget &&
            pureDataSource.status !== dataTarget.status &&
            'status_id' in pureDataSource &&
            'status_id' in dataTarget &&
            pureDataSource.status_id !== dataTarget.status_id
          ) {
            reconciledData = {
              ...(reconciledData as DataResult.Order),
              status: pureDataSource.status,
              status_id: pureDataSource.status_id,
            };
          } else if (
            'priority' in pureDataSource &&
            'priority' in dataTarget &&
            pureDataSource.priority !== dataTarget.priority
          ) {
            reconciledData = {
              ...(reconciledData as DataResult.Order),
              priority: pureDataSource.priority,
            };
          } else if (
            'due_date' in pureDataSource &&
            'due_date' in dataTarget &&
            pureDataSource.due_date !== dataTarget.due_date
          ) {
            reconciledData = {
              ...(reconciledData as DataResult.Order),
              due_date: pureDataSource.due_date,
            };
          }

          return reconciledData;
        }

        return reconciledData;
      }
    },
    [files], // Dependency array to ensure that `files` is up-to-date
  );

  const handleSubscription = useCallback(
    async <T extends DataResult.All>(
      payload: SubscriptionPayload,
      currentDataStore: T[] | T,
      stateSetter: React.Dispatch<React.SetStateAction<T[] | T>>,
      tableName: TableName,
    ) => {
      try {
        const newData = (await reconcileData(
          payload,
          currentDataStore as DataResult.All,
          tableName,
        )) as T;
        if (tableName === TableName.MESSAGES) {
          stateSetter((prevState) => {
            if (Array.isArray(prevState)) {
              return reconcileState(
                prevState as DataResult.Message[],
                newData as DataResult.Message,
              ) as T[];
            }
            return prevState;
          });
        } else {
            stateSetter((prevState) => {
            if (Array.isArray(prevState)) {
              return [...prevState, newData] as T[];
            } else {
              return newData;
            }
          });
        }
      } catch (error) {
        console.error('Error handling subscription:', error);
      }
    },
    [reconcileData],
  );

  useOrderSubscriptions(
    order.id,
    handleSubscription,
    order,
    setOrder,
    activities,
    setActivities,
    messages,
    setMessages,
    reviews,
    setReviews,
    files,
    setFiles,
  );

  return (
    <ActivityContext.Provider
      value={{
        activities: activities,
        messages: messages.filter((msg) => !msg.deleted_on),
        reviews: reviews,
        files: files.filter((svFile) => !svFile.message_id),
        allFiles: files,
        order,
        briefResponses: serverBriefResponses,
        userRole,
        addMessage: async ({
          message,
          fileIdsList,
        }: {
          message: string;
          fileIdsList?: string[];
        }) =>
          await addMessageMutation.mutateAsync({
            message,
            fileIdsList,
            tempId: generateUUID(),
          }),
        userWorkspace: currentUser,
        loadingMessages,
        deleteMessage: async (messageId: string) => {
          await deleteMessageMutation.mutateAsync(messageId);
        },
      }}
    >
      {children}
    </ActivityContext.Provider>
  );
};

export const useActivityContext = () => {
  const context = useContext(ActivityContext);
  if (!context) {
    throw new Error(
      'useActivityContext must be used within a ActivityProvider',
    );
  }
  return context;
};
