import Link from 'next/link';

import { Pencil } from 'lucide-react';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';
import { Button } from '@kit/ui/button';
import { Sidebar, SidebarContent } from '@kit/ui/sidebar';

import { SidebarItems } from '~/(main)/home/[account]/chat/_components/sidebar-items';
import { createChatMessagesService } from '~/(main)/home/[account]/chat/_lib/server/chat-messages.service';
import { withI18n } from '~/lib/i18n/with-i18n';

async function ChatLayout({
  params,
  children,
}: React.PropsWithChildren<{
  params: {
    account: string;
  };
}>) {
  const client = getSupabaseServerComponentClient();
  const service = createChatMessagesService(client);

  const chats = await service.getChats(params.account);

  const href = `/home/${params.account}/chat`;

  return (
    <div className={'flex h-screen overflow-y-hidden'}>
      <Sidebar className={'h-auto space-y-2 py-2 shadow-none'}>
        <SidebarContent className={'py-1'}>
          <Button
            asChild
            size={'sm'}
            className={'group relative flex justify-start'}
          >
            <Link href={href}>
              <Pencil
                className={'absolute right-2 hidden h-3 group-hover:block'}
              />

              <span>New Chat</span>
            </Link>
          </Button>
        </SidebarContent>

        <SidebarContent>
          <SidebarItems href={href} chats={chats} />
        </SidebarContent>
      </Sidebar>

      {children}
    </div>
  );
}

export default withI18n(ChatLayout);
