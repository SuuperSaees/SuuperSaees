import { useEffect } from 'react';

import { useSupabase } from '@kit/supabase/hooks/use-supabase';

import { DataResult, SubscriptionPayload, TableName } from '../context/activity.types';

export const useOrderSubscriptions = (
  orderId: number,
  handleSubscription: <T extends DataResult.All>(
    payload: SubscriptionPayload,
    currentDataStore: T | T[],
    stateSetter: React.Dispatch<React.SetStateAction<T | T[]>>,
    tableName: TableName,
  ) => Promise<void>,
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
  const supabase = useSupabase();

  useEffect(() => {
    const channel = supabase
      .channel('order-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `order_id=eq.${orderId}`,
        },
        (payload) => {
          if (payload.table === 'messages') {
            void handleSubscription<DataResult.Message>(
              payload.new as SubscriptionPayload,
              messages,
              setMessages as React.Dispatch<
                React.SetStateAction<DataResult.Message | DataResult.Message[]>
              >,
              TableName.MESSAGES,
            );
          }
        },
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reviews',
          filter: `order_id=eq.${orderId}`,
        },
        (payload) => {
          if (payload.table === 'reviews') {
            void handleSubscription<DataResult.Review>(
              payload.new as SubscriptionPayload,
              reviews,
              setReviews as React.Dispatch<
                React.SetStateAction<DataResult.Review | DataResult.Review[]>
              >,
              TableName.REVIEWS,
            );
          }
        },
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'files',
          filter: `reference_id=eq.${orderId.toString()}`,
        },
        (payload) => {
          if (payload.table === 'files') {
            void handleSubscription<DataResult.File>(
              payload.new as SubscriptionPayload,
              files,
              setFiles as React.Dispatch<React.SetStateAction<DataResult.File | DataResult.File[]>>,
              TableName.FILES,
            );
          }
        },
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'activities',
          filter: `order_id=eq.${orderId}`,
        },
        (payload) => {
          if (payload.table === 'activities') {
            void handleSubscription<DataResult.Activity>(
              payload.new as SubscriptionPayload,
              activities,
              setActivities as React.Dispatch<
                React.SetStateAction<DataResult.Activity | DataResult.Activity[]>
              >,
              TableName.ACTIVITIES,
            );
          }
        },
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders_v2',
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          if (payload.table === 'orders_v2') {
            void handleSubscription<DataResult.Order>(
              payload.new as SubscriptionPayload,
              order,
              setOrder as React.Dispatch<React.SetStateAction<DataResult.Order | DataResult.Order[]>>,
              TableName.ORDER,
            );
          }
        },
      )
      .subscribe();

    return () => {
      //eslint-disable-next-line @typescript-eslint/no-floating-promises
      supabase.removeChannel(channel);
    };
  }, [
    supabase,
    orderId,
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
  ]);
};
