import { Dispatch, SetStateAction } from 'react';

import { Button } from 'node_modules/@kit/ui/src/shadcn/button-shadcn';

import { Embeds } from '~/lib/embeds.types';
import { hexToRgba } from '~/utils/generate-colors';
import { DynamicIcon } from '../../../components/shared/dynamic-icon';

interface EmbedTabsProps {
  embeds: Embeds.TypeWithRelations[];
  activeTab: string;
  handleTabChange: Dispatch<SetStateAction<string>>;
  theme_color?: string;
}
export function EmbedTabs({
  embeds,
  activeTab,
  handleTabChange,
  theme_color,
}: EmbedTabsProps) {
  if (embeds.length === 0) return null;

  return (
    <div className="ml-4 flex gap-2 border-l bg-transparent pl-4">
      {embeds.map((embed) => {
        const isActive = embed.id === activeTab;
        const style = theme_color
          ? {
              backgroundColor: isActive ? hexToRgba('#667085', 0.1) : undefined,
              color: '#667085',
              borderColor: isActive ? theme_color : undefined,
            }
          : undefined;

        return (
          <Button
            key={embed.id}
            onClick={() => handleTabChange(embed.id)}
            className={`flex items-center gap-2 font-semibold hover:bg-gray-200/30 hover:text-brand ${
              isActive
                ? 'bg-brand-50/60 text-brand-900'
                : 'bg-transparent text-gray-600'
            }`}
            style={style}
            variant="ghost"
          >
            <DynamicIcon name={embed.icon ?? 'box'} className="h-4 w-4" />
            {embed.title ?? 'Embed'}
          </Button>
        );
      })}
    </div>
  );
}
