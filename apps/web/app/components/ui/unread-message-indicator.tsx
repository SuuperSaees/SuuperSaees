'use client';

import Tooltip from '~/components/ui/tooltip';
import { useUnreadMessageCounts } from '~/hooks/use-unread-message-counts';
import { useUserWorkspace } from '@kit/accounts/hooks/use-user-workspace';
import { useRouter } from 'next/navigation';

interface UnreadMessageIndicatorProps {
  orderId: number;
}

export function UnreadMessageIndicator({ orderId }: UnreadMessageIndicatorProps) {
  const { user } = useUserWorkspace();
  const { getUnreadCountForOrder, markOrderAsRead } = useUnreadMessageCounts({ userId: user?.id ?? '' });
  const router = useRouter();
  const unreadCount = getUnreadCountForOrder(orderId);
  
  if (unreadCount <= 0) {
    return null;
  }
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Mark messages as read if the function exists
    if (markOrderAsRead) {
      void markOrderAsRead(orderId);
    }
    
    router.push(`/orders/${orderId}`);
  };
  
  const tooltipContent = (
    <div className="flex flex-col gap-1">
      <p className="text-sm font-medium">
        {unreadCount} unread {unreadCount === 1 ? 'message' : 'messages'}
      </p>
      <p className="text-xs text-blue-400">Click to view conversation</p>
    </div>
  );
  
  return (
    <Tooltip content={tooltipContent} delayDuration={200}>
      <div 
        className="flex-shrink-0 ml-1 h-2 w-2 cursor-pointer rounded-full bg-red-500 animate-pulse"
        aria-label={`${unreadCount} unread messages`}
        onClick={handleClick}
      />
    </Tooltip>
  );
} 