import { useEffect } from 'react';

import { useSupabase } from '@kit/supabase/hooks/use-supabase';

import { Order } from '~/lib/order.types';

import {
  Activity,
  ActivityData,
  File,
  Message,
  Review,
  SubscriptionPayload,
  TableName,
} from '../context/activity-context';

export const useOrderSubscriptions = (
  orderId: number,
  handleSubscription: <T extends ActivityData>(
    payload: SubscriptionPayload,
    currentDataStore: T[],
    stateSetter: React.Dispatch<React.SetStateAction<T[]>>,
    tableName: TableName,
  ) => void,
  setOrder: React.Dispatch<React.SetStateAction<Order.Type>>,
  activities: Activity[],
  setActivities: React.Dispatch<React.SetStateAction<Activity[]>>,
  messages: Message[],
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  reviews: Review[],
  setReviews: React.Dispatch<React.SetStateAction<Review[]>>,
  files: File[],
  setFiles: React.Dispatch<React.SetStateAction<File[]>>,
) => {
  const supabase = useSupabase();

  useEffect(() => {
    const messagesChannel = supabase.channel('message-subscription').on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `order_id=eq.${orderId}`,
      },
      (payload) => {
        handleSubscription<Message>(
          payload.new as SubscriptionPayload,
          messages,
          setMessages,
          TableName.MESSAGES,
        );
      },
    );

    const reviewsChannel = supabase.channel('review-subscription').on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'reviews',
        filter: `order_id=eq.${orderId}`,
      },
      (payload) => {
        handleSubscription<Review>(
          payload.new as SubscriptionPayload,
          reviews,
          setReviews,
          TableName.REVIEWS,
        );
      },
    );

    const filesChannel = supabase.channel('file-subscription').on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'files',
        filter: `order_id=eq.${orderId}`,
      },
      (payload) => {
        handleSubscription<File>(
          payload.new as SubscriptionPayload,
          files,
          setFiles,
          TableName.FILES,
        );
      },
    );

    const activitiesChannel = supabase.channel('activity-subscription').on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'activities',
        filter: `order_id=eq.${orderId}`,
      },
      (payload) => {
        handleSubscription<Activity>(
          payload.new as SubscriptionPayload,
          activities,
          setActivities,
          TableName.ACTIVITIES,
        );
      },
    );

    const orderChannel = supabase.channel('order-subscription').on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'orders_v2',
        filter: `id=eq.${orderId}`,
      },
      (payload) => {
        setOrder(payload.new as Order.Type);
      },
    );

    // subscribe to channels
    messagesChannel.subscribe();
    reviewsChannel.subscribe();
    filesChannel.subscribe();
    activitiesChannel.subscribe();
    orderChannel.subscribe();

    // unsubscribe when component unmounts
    return () => {
      //eslint-disable-next-line @typescript-eslint/no-floating-promises
      supabase.removeChannel(orderChannel);
      //eslint-disable-next-line @typescript-eslint/no-floating-promises
      supabase.removeChannel(messagesChannel);
      //eslint-disable-next-line @typescript-eslint/no-floating-promises
      supabase.removeChannel(activitiesChannel);
      //eslint-disable-next-line @typescript-eslint/no-floating-promises
      supabase.removeChannel(reviewsChannel);
      //eslint-disable-next-line @typescript-eslint/no-floating-promises
      supabase.removeChannel(filesChannel);
    };
  }, [
    supabase,
    orderId,
    handleSubscription,
    setOrder,
    activities,
    setActivities,
    messages,
    setMessages,
    reviews,
    setReviews,
    files,
    setFiles,
  ]);
};
