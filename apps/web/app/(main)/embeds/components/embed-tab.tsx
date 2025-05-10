'use client';

import { EllipsisVertical } from 'lucide-react';
import { Trash2 } from 'lucide-react';
import { Trans } from 'react-i18next';

import { TabsTrigger } from '@kit/ui/tabs';

import Dropdown from '~/components/ui/dropdown';
import { Embeds } from '~/lib/embeds.types';

import { DynamicEmoji } from '../../../components/shared/dynamic-emoji';

interface EmbedTabProps {
  embed: Embeds.Type;
  isActive: boolean;
  onDelete?: (embedId: string) => Promise<void> | void;
}

export function EmbedTab({ embed, isActive, onDelete }: EmbedTabProps) {
  const deleteOption = {
    value: (
      <span className="inline-flex w-full items-center gap-2 text-gray-600">
        <Trash2 className="h-5 w-5" />
        <Trans i18nKey={'service:cancel'} />
      </span>
    ),
    actionFn: async () => {
      if (onDelete) {
        await onDelete(embed.id);
      }
    },
  };

  // Render external link for 'link' type embeds
  // if (embed.type === 'link') {
  //   return (
  //     <Link
  //       href={embed.value}
  //       target="_blank"
  //       rel="noopener noreferrer"
  //       className="group flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-100"
  //     >
  //       <EmbedIcon icon={embed.icon} title={embed.title} />
  //       <span>{embed.title}</span>
  //       <SquareArrowOutUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100" />
  //     </Link>
  //   );
  // }

  // Render tab trigger for 'iframe' type embeds
  return (
    <TabsTrigger
      value={embed.id}
      className="group flex items-center gap-2 text-sm transition-colors data-[state=active]:bg-[#F0F0F0] data-[state=inactive]:bg-transparent data-[state=active]:text-black data-[state=inactive]:text-gray-500"
    >
      <DynamicEmoji emoji={embed.icon ?? ''} fallback={"🔗"} className="h-4 w-4" />
      <span>{embed.title}</span>
      {onDelete && (
        <Dropdown
          options={[deleteOption]}
          className={isActive ? 'visible' : 'invisible group-hover:visible'}
        >
          <EllipsisVertical className="h-4 w-4" />
        </Dropdown>
      )}
    </TabsTrigger>
  );
}
