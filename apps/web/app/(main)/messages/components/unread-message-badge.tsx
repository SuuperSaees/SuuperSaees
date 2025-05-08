import React from 'react';
import { Badge } from '@kit/ui/badge';
import { useUnreadMessageCounts } from '~/hooks/use-unread-message-counts';

interface UnreadMessageBadgeProps {
  chatId: string;
}

export function UnreadMessageBadge({ chatId }: UnreadMessageBadgeProps) {
  const { getUnreadCountForChat } = useUnreadMessageCounts();
  const unreadCount = getUnreadCountForChat(chatId);
  
  if (unreadCount <= 0) {
    return null;
  }
  
  return (
    <Badge variant="secondary" className="ml-auto">
      {unreadCount}
    </Badge>
  );
} 