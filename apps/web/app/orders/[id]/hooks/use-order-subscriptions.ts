import { Dispatch } from 'react';

import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

import { createSubscriptionHandler } from '~/hooks/create-subscription-handler';
import { TableConfig, useRealtime } from '~/hooks/use-realtime';
import { Activity } from '~/lib/activity.types';
import { File } from '~/lib/file.types';
import { Message } from '~/lib/message.types';
import { Order } from '~/lib/order.types';

import { DataResult } from '../context/activity.types';
import { useOrderSubscriptionsHandlers } from './use-order-subscriptions-handlers';

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
  const {
    handleOrderChanges,
    handleFileChanges,
    handleMessageChanges,
    handleActivityChanges,
  } = useOrderSubscriptionsHandlers();

  // Real-time subscription handler
  const handleSubscriptions = createSubscriptionHandler<DataUnion>({
    onBeforeUpdate: async (payload) => {
      switch (payload.table) {
        case 'messages':
          // Handle user data enrichment for messages
          return await handleMessageChanges(
            payload as RealtimePostgresChangesPayload<Message.Type>,
            messages,
            setMessages,
          );

        // Handle file updates and message associations
        case 'files':
          return handleFileChanges(
            payload as RealtimePostgresChangesPayload<File.Type>,
            setMessages,
          );
        // Handle order status updates
        case 'orders_v2':
          return handleOrderChanges(
            payload as RealtimePostgresChangesPayload<Order.Type>,
            order,
            setOrder,
          );
        case 'activities':
          return handleActivityChanges(
            payload as RealtimePostgresChangesPayload<Activity.Type>,
            activities,
            setActivities,
          );
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
