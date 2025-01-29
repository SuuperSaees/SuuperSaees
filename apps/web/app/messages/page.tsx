import ChatInbox from './components/chat-inbox';
import ChatThread from './components/chat-thread';
import ChatEmptyState from './components/chat-empty-state';
import { getChats } from '~/server/actions/chat/chat.actions';
import { fetchCurrentUser } from '~/team-accounts/src/server/actions/members/get/get-member-account';
import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';
import { Chats } from '~/lib/chats.types';

export default async function MessagesPage() {
  const client = getSupabaseServerComponentClient();
  const user = await fetchCurrentUser(client);
  const chats = await getChats({
    user_id: user.id,
  });
  const chatsData = chats.success?.data as unknown as Chats.Type[];
  
  return (
    <div className="h-full flex border-t">
      <div className="w-[380px] border-r flex flex-col bg-white">
        <ChatInbox chats={chatsData} />
      </div>
      <div className="flex-1 flex flex-col bg-white">
        {chatsData && chatsData.length > 0 ? (
          <ChatThread />
        ) : (
          <ChatEmptyState />
        )}
      </div>
    </div>
  );
}