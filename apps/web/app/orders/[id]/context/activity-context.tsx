'use client';

import {
  Dispatch,
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import { getUserById } from 'node_modules/@kit/team-accounts/src/server/actions/members/get/get-member-account';

import { useUserWorkspace } from '@kit/accounts/hooks/use-user-workspace';

import { createSubscriptionHandler } from '~/hooks/create-subscription-handler';
import { TableConfig, useRealtime } from '~/hooks/use-realtime';
import { useUnreadMessageCounts } from '~/hooks/use-unread-message-counts';
import { Brief } from '~/lib/brief.types';
import { updateArrayData } from '~/utils/data-transform';

import { useOrderApiActions } from '../hooks/use-order-api-actions';
import { useOrderSubscriptions } from '../hooks/use-subscriptions';
import {
  ActivityContextType,
  DataResult,
  DataSource,
  SubscriptionPayload,
  TableName,
  UserExtended,
} from './activity.types';

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
  clientOrganizationId,
  agencyId,
}: {
  children: ReactNode;
  activities: DataResult.Activity[];
  messages: DataResult.Message[];
  reviews: DataResult.Review[];
  files: DataResult.File[];
  order: DataResult.Order;
  userRole: string;
  briefResponses: Brief.Relationships.FormFieldResponse.Response[];
  clientOrganizationId: string;
  agencyId: string;
}) => {
  const [order, setOrder] = useState<DataResult.Order>(serverOrder);
  const [messages, setMessages] =
    useState<DataResult.Message[]>(serverMessages);
  const [activities, setActivities] =
    useState<DataResult.Activity[]>(serverActivities);
  const [reviews, setReviews] = useState<DataResult.Review[]>(serverReviews);
  const [files, setFiles] = useState<DataResult.File[]>(serverFiles);
  const { workspace: currentUser } = useUserWorkspace();

  const { addMessageMutation, deleteMessageMutation } = useOrderApiActions({
    orderId: order.id,
    orderUUID: order.uuid,
    clientOrganizationId,
    agencyId,
    messages,
    setMessages,
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
  // Real-time subscription handler
  const handleSubscriptions = createSubscriptionHandler<
    | DataResult.Message
    | DataResult.Review
    | DataResult.File
    | DataResult.Activity
    | DataResult.Order
  >({
    idField: 'temp_id',
    onBeforeUpdate: async (payload) => {
      const { eventType, new: newData, table } = payload;

      // Handle user data enrichment for messages
      if (table === 'messages' && eventType === 'INSERT') {
        const message = newData as DataResult.Message;
        // Get the user from the messages array
        let user = messages.find((msg) => msg.id === message.id)?.user;
        console.log('user', user);
        if (!user) {
          try {
            user = await getUserById(message.user_id);
          } catch (err) {
            console.error('Error fetching user:', err);
            return;
          }
        }
        const enrichedMessage = {
            pending: false,
            ...message,
            user,
          };
          const updatedMessages = updateArrayData(
            messages,
            enrichedMessage,
            'temp_id',
            true,
          );
          console.log('updatedMessages', updatedMessages);
          setMessages(updatedMessages);
          return true;
      }

      // Handle file updates and message associations
      if (table === 'files' && eventType === 'INSERT') {
        const file = newData as DataResult.File;
        // Use the message_id to insert the file in the files messages table
        setMessages((prev) => {
          console.log('prev', prev);
          const message = prev.find(
            (message) => message.id === file.message_id,
          );
          if (message) {
            const files = updateArrayData(
              message.files ?? [],
              file,
              'temp_id',
              true,
            );
            const newMessage = {
              ...message,
              files: files.map((file) => ({ ...file, isLoading: false })),
            };
            console.log('newMessage', newMessage);
            const updatedItems = updateArrayData(
              messages,
              newMessage,
              'temp_id',
              false,
            );
            return updatedItems;
          }
          return prev;
        });
        return true;
      }

      // Handle order status updates
      if (table === 'orders_v2' && eventType === 'UPDATE') {
        const orderUpdate = newData as DataResult.Order;
        if (
          orderUpdate.status !== order.status ||
          orderUpdate.status_id !== order.status_id ||
          orderUpdate.priority !== order.priority ||
          orderUpdate.due_date !== order.due_date
        ) {
          return orderUpdate;
        }
        return false;
      }
      return true;
    },
  });

  // Configure real-time subscriptions
  const realtimeConfig = {
    channelName: 'order-changes',
    schema: 'public',
  };

  type DataUnion =
    | DataResult.Message
    | DataResult.Review
    | DataResult.File
    | DataResult.Activity
    | DataResult.Order;

  const tables: TableConfig<DataUnion>[] = [
    {
      tableName: 'messages',
      currentData: messages,
      setData: setMessages as Dispatch<
        React.SetStateAction<DataUnion[] | DataUnion>
      >,
      filter: {
        order_id: `eq.${order.id}`,
      },
    },
    {
      tableName: 'reviews',
      currentData: reviews,
      setData: setReviews as Dispatch<
        React.SetStateAction<DataUnion[] | DataUnion>
      >,
      filter: {
        order_id: `eq.${order.id}`,
      },
    },
    {
      tableName: 'files',
      currentData: files,
      setData: setFiles as Dispatch<
        React.SetStateAction<DataUnion[] | DataUnion>
      >,
      filter: {
        reference_id: `eq.${order.id}`,
      },
    },
    {
      tableName: 'activities',
      currentData: activities,
      setData: setActivities as Dispatch<
        React.SetStateAction<DataUnion[] | DataUnion>
      >,
      filter: {
        order_id: `eq.${order.id}`,
      },
    },
    {
      tableName: 'orders_v2',
      currentData: order,
      setData: setOrder as Dispatch<
        React.SetStateAction<DataUnion[] | DataUnion>
      >,
      filter: {
        id: `eq.${order.id}`,
      },
    },
  ];

  // Initialize real-time subscriptions
  useRealtime(tables, realtimeConfig, handleSubscriptions);
  // useOrderSubscriptions(
  //   order.id,
  //   handleSubscription,
  //   order,
  //   setOrder,
  //   activities,
  //   setActivities,
  //   messages,
  //   setMessages,
  //   reviews,
  //   setReviews,
  //   files,
  //   setFiles,
  // );

  const { markOrderAsRead } = useUnreadMessageCounts({
    userId: currentUser.id ?? '',
  });
  useEffect(() => {
    if (order.id) {
      void markOrderAsRead(order.id);
    }
  }, [order.id, markOrderAsRead]);

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
        addMessageMutation,
        userWorkspace: currentUser,
        loadingMessages: addMessageMutation.isPending,
        deleteMessage: async (messageId: string, adminActived?: boolean) => {
          await deleteMessageMutation.mutateAsync({ messageId, adminActived });
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
