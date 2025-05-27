'use client';

import Tooltip from '~/components/ui/tooltip';
import { useUnreadMessageCounts } from '~/hooks/use-unread-message-counts';
import { useUserWorkspace } from '@kit/accounts/hooks/use-user-workspace';
import { useRouter } from 'next/navigation';
import { cn } from '@kit/ui/utils';

interface UnreadMessageIndicatorProps {
  orderId?: number;
  chatId?: string;
  className?: string;
  indicatorSize?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  customRoute?: string;
  tooltipText?: string;
  color?: 'red' | 'green' | 'blue' | 'yellow';
  seeConversationFn?: () => void;
}

export function UnreadMessageIndicator({ 
  orderId, 
  chatId,
  className,
  indicatorSize = 'sm',
  showCount = false,
  customRoute,
  tooltipText = 'Click to view conversation',
  color = 'red',
  seeConversationFn
}: UnreadMessageIndicatorProps) {
  const { workspace: user, organization } = useUserWorkspace();

  const { 
    getUnreadCountForOrder, 
    getUnreadCountForChat,
  } = useUnreadMessageCounts({ userId: user?.id ?? '', userRole: user?.role ?? '', userOrganizationId: organization?.id ?? '' });
  const router = useRouter();
  
  // Determine unread count based on whether we're dealing with an order or chat
  const unreadCount = orderId 
    ? getUnreadCountForOrder(orderId)
    : chatId 
      ? getUnreadCountForChat(chatId)
      : 0;
  
  if (unreadCount <= 0) {
    return null;
  }
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();



    // Navigate to the appropriate route
    if (customRoute) {
      router.push(customRoute);
    } else if (orderId) {
      router.push(`/orders/${orderId}`);
      seeConversationFn?.();
    } else if (chatId) {
      seeConversationFn?.();
    }
  };
  
  // Size classes based on the indicatorSize prop
  const sizeClasses = {
    sm: 'h-2 w-2',
    md: 'h-4 w-4',
    lg: 'h-6 w-6'
  };
  
  // Color classes based on the color prop
  const colorClasses = {
    red: 'bg-red-500',
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    yellow: 'bg-yellow-500'
  };
  
  const tooltipContent = (
    <div className="flex flex-col gap-1">
      <p className="text-sm font-medium">
        {unreadCount} unread {unreadCount === 1 ? 'message' : 'messages'}
      </p>
      <p className="text-xs text-blue-400">{tooltipText}</p>
    </div>
  );
  
  return (
    <Tooltip content={tooltipContent} delayDuration={200}>
      <div 
        className={cn(
          "flex-shrink-0 ml-1 cursor-pointer rounded-full animate-pulse",
          sizeClasses[indicatorSize],
          colorClasses[color],
          showCount ? "flex items-center justify-center" : "",
          className
        )}
        aria-label={`${unreadCount} unread messages`}
        onClick={handleClick}
      >
        {showCount && indicatorSize !== 'sm' && (
          <small className="text-xs text-white">{unreadCount}</small>
        )}
      </div>
    </Tooltip>
  );
} 