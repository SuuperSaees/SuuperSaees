'use client';

import { useUnreadMessageCounts } from '~/hooks/use-unread-message-counts';

export function MessageBadge({userId}: {userId: string}) {
  const { openChats } = useUnreadMessageCounts({userId});
  if (openChats.length <= 0 ) {
    return null;
  }
  
  return (
    <span className="ml-auto w-6 h-6 inline-flex items-center justify-center rounded-full bg-white/40 text-secondary-foreground text-xs font-semibold border border-white-200/[0.6]">
      {openChats.length}
    </span>
  );
} 