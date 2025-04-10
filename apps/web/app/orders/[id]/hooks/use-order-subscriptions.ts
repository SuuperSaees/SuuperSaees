import { Dispatch } from 'react';

import { createSubscriptionHandler } from '~/hooks/create-subscription-handler';
import { TableConfig, useRealtime } from '~/hooks/use-realtime';
import { getUserById } from '~/team-accounts/src/server/actions/members/get/get-member-account';
import { updateArrayData } from '~/utils/data-transform';

import { DataResult } from '../context/activity.types';

type DataUnion =
  | DataResult.Message
  | DataResult.Review
  | DataResult.File
  | DataResult.Activity
  | DataResult.Order;

export const useOrderSubscriptions = (
  order: DataResult.Order,
  setOrder: React.Dispatch<React.SetStateAction<DataResult.Order>>,
  activities: DataResult.Activity[],
  setActivities: React.Dispatch<React.SetStateAction<DataResult.Activity[]>>,
  messages: DataResult.Message[],
  setMessages: React.Dispatch<React.SetStateAction<DataResult.Message[]>>,
  reviews: DataResult.Review[],
  setReviews: React.Dispatch<React.SetStateAction<DataResult.Review[]>>,
  files: DataResult.File[],
  setFiles: React.Dispatch<React.SetStateAction<DataResult.File[]>>,
) => {
  // Real-time subscription handler
  const handleSubscriptions = createSubscriptionHandler<
    | DataResult.Message
    | DataResult.Review
    | DataResult.File
    | DataResult.Activity
    | DataResult.Order
  >({
    idField: 'temp_id' as keyof DataUnion,
    onBeforeUpdate: async (payload) => {
      const { eventType, new: newData, table } = payload;

      // Handle user data enrichment for messages
      if (table === 'messages' && eventType === 'INSERT') {
        const message = newData as DataResult.Message;
        // Get the user from the messages array
        let user = messages.find((msg) => msg.id === message.id)?.user;
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
        setMessages(updatedMessages);
        return true;
      }

      // Handle file updates and message associations
      if (table === 'files' && eventType === 'INSERT') {
        const file = newData as DataResult.File;
        // Use the message_id to insert the file in the files messages table
        setMessages((prev) => {
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

        const newOrderToUpdate: DataResult.Order =
          updateArrayData([order], orderUpdate, 'id', false)[0] ?? order;
        setOrder(newOrderToUpdate);

        return true;
      }
    },
  });

  // Configure real-time subscriptions
  const realtimeConfig = {
    channelName: 'order-changes',
    schema: 'public',
  };

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
};
