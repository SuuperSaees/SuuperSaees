'use client';
import { useCallback, useEffect } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useSupabase } from '@kit/supabase/hooks/use-supabase';
import { useRealtime } from './use-realtime';
import { useOrganizationSettings } from 'node_modules/@kit/accounts/src/context/organization-settings-context';

// import { useUserWorkspace } from '@kit/accounts/hooks/use-user-workspace';
// import { AccountRoles } from '~/lib/account.types';

// Define query keys as constants for consistency
const UNREAD_COUNTS_QUERY_KEY = ['unread-message-counts'];
const NOTIFICATION_SOUND_PATH = '/sounds/pop-alert.mp3';

// Define the type for the unread message counts returned from the database
export interface UnreadMessageCount {
  chat_id: string | null;
  chat_unread_count: number;
  order_id: number | null;
  order_unread_count: number;
  // message_ids: string[];
}

// Define types for mutation parameters
export interface MarkChatAsReadParams {
  chatId: string;
}

export interface MarkOrderAsReadParams {
  orderId: number;
}

// Create a singleton for sound management
// This ensures only one sound plays regardless of how many hook instances exist
const SoundManager = (() => {
  let instance: {
    audio: HTMLAudioElement | null;
    lastPlayedAt: number;
    prevTotalUnread: number;
    play: (totalUnread: number) => void;
  } | null = null;
  
  return {
    getInstance: (soundSrc = NOTIFICATION_SOUND_PATH) => {
      if (!instance) {
        // Create audio element
        const audio = typeof window !== 'undefined' 
          ? new Audio(soundSrc) 
          : null;
          
        // Set volume to 10%
        if (audio) {
          audio.volume = 0.1;
        }
        
        instance = {
          audio,
          lastPlayedAt: 0,
          prevTotalUnread: 0,
          play: (totalUnread: number) => {
            if (!instance?.audio) return;
            
            const now = Date.now();
            
            // Only play sound if:
            // 1. Count increased (not on initial load)
            // 2. At least 1 second has passed since the last sound
            if (
              instance.prevTotalUnread > 0 && 
              totalUnread > instance.prevTotalUnread &&
              now - instance.lastPlayedAt > 1000
            ) {
              instance.audio.play().catch(err => {
                console.warn('Audio play prevented:', err);
              });
              
              instance.lastPlayedAt = now;
            }
            
            // Update the previous total
            instance.prevTotalUnread = totalUnread;
          }
        };
      }
      
      return instance;
    }
  };
})();


export interface UseUnreadMessageCountsProps {
  userId: string;
  userRole: string;
  userOrganizationId: string;

}
export function useUnreadMessageCounts({ userId, userRole, userOrganizationId }: UseUnreadMessageCountsProps) {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { notification_sound } = useOrganizationSettings()
  // Get the singleton sound manager
  const soundManager = SoundManager.getInstance(notification_sound);
  
  // Function to fetch unread counts
  const fetchUnreadCounts = useCallback( async (): Promise<UnreadMessageCount[]> => {
    // if (!userId) return [];
      
    const { data, error } = await supabase
      .rpc('get_unread_message_counts', { 
        p_user_id: userId,
        p_organization_id: userOrganizationId,
        p_role: userRole,
      });
    

    if (error) {
      console.error('Error fetching unread counts:', error);
      throw error;
    }

    
    return data;
  }, [userOrganizationId, userRole, supabase, userId]);


  // Use React Query to fetch and cache unread counts
  const { data: unreadCounts = [] } = useQuery<UnreadMessageCount[]>({
    queryKey: UNREAD_COUNTS_QUERY_KEY,
    queryFn: fetchUnreadCounts,
    staleTime: 30 * 1000, // Consider data fresh for 30 seconds
    enabled: !!userId && !!userRole && !!userOrganizationId,
  });

  // Calculate total unread count for chats
  const totalChatUnread = unreadCounts.reduce(
    (sum, item) => sum + Number(item.chat_unread_count), 
    0
  );
  
  // Calculate total unread count for orders
  const totalOrderUnread = unreadCounts.reduce(
    (sum, item) => sum + Number(item.order_unread_count), 
    0
  );
  
  // Calculate combined total
  const totalUnread = totalChatUnread + totalOrderUnread;

  // Set up realtime subscription for messages and message_reads tables
  useRealtime(
    [
      {
        tableName: 'messages',
        currentData: unreadCounts as unknown as Record<string, unknown>[],
        setData: () => null, // Using null function instead of empty method
      },
      {
        tableName: 'message_reads',
        currentData: unreadCounts as unknown as Record<string, unknown>[],
        setData: () => null, // Using null function instead of empty method
      }
    ],
    {
      channelName: 'unread-messages-subscription',
    },
    async () => {
      if (!userId) return;
      
      // Invalidate the query to trigger a refetch
      await queryClient.invalidateQueries({ queryKey: UNREAD_COUNTS_QUERY_KEY });
    }
  );

  // Function to mark a chat as read using React Query mutation
  const { mutateAsync: markChatAsReadMutation } = useMutation<
    void,
    Error,
    MarkChatAsReadParams
  >({
    mutationFn: async ({ chatId,  }: MarkChatAsReadParams) => {
      if (!userId) return;
      
      const { error } = await supabase
        .rpc('mark_messages_as_read', { 
          p_user_id: userId, 
          p_organization_id: userOrganizationId,
          p_role: userRole,
          p_chat_id: chatId
        });
      
      if (error) {
        console.error('Error marking messages as read:', error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate the unread counts query to trigger a refetch
      void queryClient.invalidateQueries({ queryKey: UNREAD_COUNTS_QUERY_KEY });
    }
  });
  
  // Function to mark an order's messages as read
  const { mutateAsync: markOrderAsReadMutation } = useMutation<
    void,
    Error,
    MarkOrderAsReadParams
  >({
    mutationFn: async ({ orderId }: MarkOrderAsReadParams) => {
      if (!userId) return;
      
      const { error } = await supabase
        .rpc('mark_messages_as_read', { 
          p_user_id: userId, 
          p_organization_id: userOrganizationId,
          p_role: userRole,
          p_order_id: orderId 
        });
      
      if (error) {
        console.error('Error marking order messages as read:', error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate the unread counts query to trigger a refetch
      void queryClient.invalidateQueries({ queryKey: UNREAD_COUNTS_QUERY_KEY });
    }
  });

  // Wrapper functions with simpler interfaces
  const markChatAsRead = useCallback(
    (chatId: string ) => 
      markChatAsReadMutation({ chatId }),
    [markChatAsReadMutation]
  );

  const markOrderAsRead = useCallback(
    (orderId: number) => 
      markOrderAsReadMutation({ orderId }),
    [markOrderAsReadMutation]
  );

  // Play sound when unread count changes
  useEffect(() => {
    // Use the singleton sound manager to play the sound
    soundManager.play(totalUnread);
  }, [totalUnread, soundManager]);

  return {
    openOrders: unreadCounts.filter(count => count.order_unread_count > 0),
    openChats: unreadCounts.filter(count => count.chat_unread_count > 0),
    unreadCounts,
    totalUnread,
    totalChatUnread,
    totalOrderUnread,
    markChatAsRead,
    markOrderAsRead,
    getUnreadCountForChat: useCallback(
      (chatId: string) => 
        unreadCounts.find(count => count.chat_id === chatId)?.chat_unread_count ?? 0,
      [unreadCounts]
    ),
    getUnreadCountForOrder: useCallback(
      (orderId: number) =>
        unreadCounts.find(count => count.order_id === orderId)?.order_unread_count ?? 0,
      [unreadCounts]
    )
  };
} 