import { useEffect } from 'react';

import { useSupabase } from '@kit/supabase/hooks/use-supabase';

import { Order } from '~/lib/order.types';

import {
  Activity,
  ActivityData,
  File,
  Message,
  Review,
  ServerOrderFile,
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
  ) => Promise<void>,
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
            void handleSubscription<Message>(
              payload.new as SubscriptionPayload,
              messages,
              setMessages,
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
            void handleSubscription<Review>(
              payload.new as SubscriptionPayload,
              reviews,
              setReviews,
              TableName.REVIEWS,
            );
          }
        },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'order_files' },
        (payload) => {
          if (payload.table === 'order_files') {
            void (async () => {
              const { file_id } = payload.new as ServerOrderFile;

              // Fetch the associated file data if needed
              const { data: file, error } = await supabase
                .from('files')
                .select('*')
                .eq('id', file_id)
                .single();

              if (!error && file) {
                void handleSubscription<File>(
                  file as SubscriptionPayload,
                  files,
                  setFiles,
                  TableName.FILES,
                );
              }
            })();
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
            void handleSubscription<Activity>(
              payload.new as SubscriptionPayload,
              activities,
              setActivities,
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
            setOrder(payload.new as Order.Type);
          }
        },
      )
      .subscribe();

    // (state) => {
    //   console.log('channel', state);
    //   // if the connection is lost due to innactivity or any other state
    //   // a retry connection should be trigger
    //   // if (state === 'TIMED_OUT' || state === 'CLOSED') {
    //   //   console.log('trying to resubscribe...');
    //   //   messagesChannel.subscribe();
    //   // }
    // }
    // reviewsChannel.subscribe();
    // filesChannel.subscribe();
    // activitiesChannel.subscribe();
    // orderChannel.subscribe();

    // unsubscribe when component unmounts
    return () => {
      //eslint-disable-next-line @typescript-eslint/no-floating-promises
      supabase.removeChannel(channel);
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
