import { Dispatch } from 'react';

import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

import { createSubscriptionHandler } from '~/hooks/create-subscription-handler';
import { TableConfig, useRealtime } from '~/hooks/use-realtime';
import { Activity } from '~/lib/activity.types';
import { File } from '~/lib/file.types';
import { Message } from '~/lib/message.types';
import { Order } from '~/lib/order.types';

import { DataResult, UserExtended } from '../context/activity.types';
import { useOrderSubscriptionsHandlers } from './use-order-subscriptions-handlers';

type DataUnion =
  | DataResult.Message
  | DataResult.Review
  | DataResult.File
  | DataResult.Activity
  | DataResult.Order;

type UpdaterFunction = (updater: DataResult.InteractionPages | ((prev: DataResult.InteractionPages) => DataResult.InteractionPages)) => void
export const useOrderSubscriptions = (
  order: DataResult.Order,
  setOrder: React.Dispatch<React.SetStateAction<DataResult.Order>>,
  activities: DataResult.InteractionPages,
  setActivities: UpdaterFunction,
  messages: DataResult.InteractionPages,
  setMessages: UpdaterFunction,
  reviews: DataResult.InteractionPages,
  setReviews: UpdaterFunction,
  files: DataResult.File[],
  setFiles: React.Dispatch<React.SetStateAction<DataResult.File[]>>,
  members: UserExtended[],

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
            members,
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
            members,
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
      setData: setMessages as UpdaterFunction,
      filter: {
        order_id: `eq.${order.id}`,
      },
    },
    {
      tableName: 'reviews',
      currentData: reviews,
      setData: setReviews as UpdaterFunction,
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
      setData: setActivities as UpdaterFunction,
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
