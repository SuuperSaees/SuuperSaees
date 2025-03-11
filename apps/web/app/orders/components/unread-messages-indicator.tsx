import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@kit/ui/tooltip';
import { useUnreadMessageCounts } from '~/hooks/use-unread-message-counts';

interface UnreadMessagesIndicatorProps {
  chatId: string;
}

export function UnreadMessagesIndicator({ chatId }: UnreadMessagesIndicatorProps) {
  const { getUnreadCountForChat } = useUnreadMessageCounts();
  const unreadCount = getUnreadCountForChat(chatId);
  
  if (unreadCount <= 0) {
    return null;
  }
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative">
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{unreadCount} unread message{unreadCount !== 1 ? 's' : ''}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
} 