'use client';
import { useCallback, useEffect, useRef } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useSupabase } from '@kit/supabase/hooks/use-supabase';
import { useRealtime } from './use-realtime';

// Define query keys as constants for consistency
const UNREAD_COUNTS_QUERY_KEY = ['unread-message-counts'];
const NOTIFICATION_SOUND_PATH = '/sounds/pop-alert.mp3';

// Define the type for the unread message counts returned from the database
interface UnreadMessageCount {
  chat_id: string | null;
  chat_unread_count: number;
  order_id: number | null;
  order_unread_count: number;
}

// Define types for mutation parameters
interface MarkChatAsReadParams {
  chatId: string;
}

interface MarkOrderAsReadParams {
  orderId: number;
}

export function useUnreadMessageCounts({userId}: {userId: string}) {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  
  // Add a ref to track previous total count
  const prevTotalUnreadRef = useRef(0);
  
  // Add a ref for the audio element
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Function to fetch unread counts
  const fetchUnreadCounts = useCallback(async (): Promise<UnreadMessageCount[]> => {
    if (!userId) return [];
    
    const { data, error } = await supabase
      .rpc('get_unread_message_counts', { p_user_id: userId });
    
    if (error) {
      console.error('Error fetching unread counts:', error);
      throw error;
    }
    
    return data || [];
  }, [userId, supabase]);

  // Use React Query to fetch and cache unread counts
  const { data: unreadCounts = [] } = useQuery<UnreadMessageCount[]>({
    queryKey: UNREAD_COUNTS_QUERY_KEY,
    queryFn: fetchUnreadCounts,
    enabled: !!userId,
    staleTime: 30 * 1000, // Consider data fresh for 30 seconds
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
    mutationFn: async ({ chatId }: MarkChatAsReadParams) => {
      if (!userId) return;
      
      const { error } = await supabase
        .rpc('mark_messages_as_read', { 
          p_user_id: userId, 
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
        .rpc('mark_order_messages_as_read', { 
          p_user_id: userId, 
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

  // Initialize audio element with reduced volume
  useEffect(() => {
    audioRef.current = new Audio(NOTIFICATION_SOUND_PATH);
    // Set volume to 30% (value between 0.0 and 1.0)
    audioRef.current.volume = 0.1;
    
    return () => {
      audioRef.current = null;
    };
  }, []);
  
  // Play sound when unread count increases
  useEffect(() => {
    // Only play sound if count increased (not on initial load)
    if (prevTotalUnreadRef.current > 0 && totalUnread > prevTotalUnreadRef.current) {
      audioRef.current?.play().catch(err => {
        // Ignore autoplay errors (browsers may block without user interaction)
        console.warn('Audio play prevented:', err);
      });
    }
    
    // Update the ref with current value
    prevTotalUnreadRef.current = totalUnread;
  }, [totalUnread]);

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