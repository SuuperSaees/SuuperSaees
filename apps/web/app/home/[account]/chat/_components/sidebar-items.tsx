'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { EllipsisVerticalIcon } from 'lucide-react';

import { Button } from '@kit/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@kit/ui/dropdown-menu';
import { Trans } from '@kit/ui/trans';
import { isRouteActive } from '@kit/ui/utils';

import { DeleteChatDialog } from './delete-chat-dialog';
import { RenameChatDialog } from './rename-chat-dialog';

export function SidebarItems({
  chats,
  href,
}: {
  href: string;
  chats: Array<{
    reference_id: string;
    name: string;
  }>;
}) {
  const pathname = usePathname();

  return (
    <>
      {chats.map((chat) => {
        const itemHref = `${href}/${chat.reference_id}`;
        const isActive = isRouteActive(pathname, itemHref, true);

        return (
          <div className={'group relative'} key={chat.reference_id}>
            <Button
              className={'flex justify-start'}
              size={'sm'}
              variant={isActive ? 'secondary' : 'ghost'}
              asChild
            >
              <Link href={itemHref}>{chat.name}</Link>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className={
                    'absolute right-0 top-0 w-10 justify-center opacity-0 group-hover:opacity-100'
                  }
                  variant={'ghost'}
                  size={'sm'}
                >
                  <EllipsisVerticalIcon className={'h-4'} />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent>
                <RenameChatDialog
                  chatName={chat.name}
                  chatReferenceId={chat.reference_id}
                >
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Trans i18nKey={'chats:rename'} />
                  </DropdownMenuItem>
                </RenameChatDialog>

                <DeleteChatDialog chatReferenceId={chat.reference_id}>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Trans i18nKey={'chats:delete'} />
                  </DropdownMenuItem>
                </DeleteChatDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      })}
    </>
  );
}
