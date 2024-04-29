import { useEffect, useRef } from 'react';

import { useSupabase } from '@kit/supabase/hooks/use-supabase';

type Notification = {
  id: number;
  body: string;
  dismissed: boolean;
  type: 'info' | 'warning' | 'error';
  created_at: string;
  link: string | null;
  entity_id: string | null;
  entity_type: string | null;
};

export function useFetchNotifications({
  onNotifications,
  accountIds,
  realtime,
}: {
  onNotifications: (notifications: Notification[]) => unknown;
  accountIds: string[];
  realtime: boolean;
}) {
  const client = useSupabase();
  const didFetchInitialData = useRef(false);

  useEffect(() => {
    let realtimeSubscription: { unsubscribe: () => void } | null = null;

    if (realtime) {
      const channel = client.channel('notifications-channel');

      realtimeSubscription = channel
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            filter: `account_id=in.(${accountIds.join(', ')})`,
            table: 'notifications',
          },
          (payload) => {
            onNotifications([payload.new as Notification]);
          },
        )
        .subscribe();
    }

    if (!didFetchInitialData.current) {
      const now = new Date().toISOString();

      const initialFetch = client
        .from('notifications')
        .select(
          `id, 
           body, 
           dismissed, 
           type, 
           created_at, 
           link, 
           entity_id, 
           entity_type
           `,
        )
        .in('account_id', accountIds)
        .eq('dismissed', false)
        .gt('expires_at', now)
        .order('created_at', { ascending: false })
        .limit(10);

      didFetchInitialData.current = true;

      void initialFetch.then(({ data, error }) => {
        if (error) {
          throw error;
        }

        if (data) {
          onNotifications(data);
        }
      });
    }

    return () => {
      if (realtimeSubscription) {
        realtimeSubscription.unsubscribe();
      }
    };
  }, [client, onNotifications, accountIds, realtime]);
}
