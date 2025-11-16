'use client';

import { format } from 'date-fns';
import { enUS, es } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';

import { Avatar, AvatarFallback, AvatarImage } from '@kit/ui/avatar';

import { useUnreadMessageCounts } from '~/hooks/use-unread-message-counts';
import { Chats } from '~/lib/chats.types';
import { UnreadMessageIndicator } from '../../../components/ui/unread-message-indicator';

import { useChat } from './context/chat-context';
import { useUserWorkspace } from '@kit/accounts/hooks/use-user-workspace';

export default function ChatItem({
  chat,
  isActive = false,
}: {
  chat: Chats.TypeWithRelations;
  isActive?: boolean;
}) {
  const { setActiveChat } = useChat();
  const { t, i18n } = useTranslation('chats');

  const { workspace: userWorkspace, organization } = useUserWorkspace();
  const userRole = userWorkspace?.role ?? '';
  const userOrganizationId = organization?.id ?? '';

  const handleChatSelect = () => {
    setActiveChat(chat);
  };

  const lastMessage = chat.messages?.[chat.messages.length - 1];

  const image = !chat.image
    ? (chat.organizations?.find((org) => !org.is_agency)?.picture_url ?? '')
    : chat.image;

  const date = lastMessage?.created_at
    ? (() => {
        const date = new Date(lastMessage.created_at);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();
        const isThisWeek = date > new Date(now.setDate(now.getDate() - 7));

        const locale = i18n.language === 'es' ? es : enUS;

        if (isToday) {
          return format(date, t('dateFormat.today'), { locale });
        }
        if (isThisWeek) {
          return format(date, t('dateFormat.thisWeek'), { locale });
        }
        return format(date, t('dateFormat.older'), { locale });
      })()
    : '';

  const { getUnreadCountForChat } = useUnreadMessageCounts({ userId: chat.user_id, userRole: userRole, userOrganizationId: userOrganizationId });
  const totalChatUnread = getUnreadCountForChat(chat.id);
  return (
    <button
      onClick={handleChatSelect}
      className={`flex cursor-pointer items-center gap-3 p-4 hover:bg-gray-50 ${
        isActive ? 'bg-gray-50' : ''
      }`}
    >
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={image} />
          <AvatarFallback>
            {chat.organizations
              ?.find((org) => !org.is_agency)
              ?.name.charAt(0)
              .toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </div>

      <div className="flex w-full min-w-0 flex-col items-start text-left">
        <h3 className="w-full truncate font-medium">{chat.name}</h3>
        <p className="w-full truncate text-sm text-gray-500">
          {lastMessage ? (
            <>
              <span className="font-medium">{lastMessage.user?.name}: </span>
              <span
                dangerouslySetInnerHTML={{
                  __html: lastMessage.content?.replace(/<[^>]*>/g, '') ?? '',
                }}
              />
            </>
          ) : null}
        </p>
      </div>
      <div className="flex flex-col items-end gap-1">
        {/* Chat unread count bubble */}
        {
          totalChatUnread > 0 && (
            <UnreadMessageIndicator 
              chatId={chat.id}
              color="green"
              className="ml-auto"
              seeConversationFn={handleChatSelect}
            />
          )
        }

        {/* Date in friendly format : if today show time, if same week show day of the week, if older than a week show date in short format*/}
        <small className="text-xs text-gray-500">{date}</small>
      </div>
    </button>
  );
}
