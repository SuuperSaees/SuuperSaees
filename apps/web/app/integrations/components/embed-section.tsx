'use client';

import { useCallback, useMemo, useState } from 'react';

import { Tabs, TabsContent, TabsList } from '@kit/ui/tabs';

import { EmbedEditor } from './embed-editor/embed-editor';
import { EmbedPreview } from './embed-preview';
import { EmbedTab } from './embed-tab';

export interface Embed {
  id: string;
  title: string;
  description: string;
  icon: string;
  value: string;
  type: 'link' | 'iframe';
  location: 'tab' | 'sidebar';
  visibility: 'public' | 'private';
  organization_id: string;
  created_at: string;
  updated_at: string | null;
  deleted_on: string | null;
  user_id: string;
  embed_accounts: string[] | null;
}

interface EmbedSectionProps {
  embeds: Embed[];
  onDeleteEmbed: (embedId: string) => Promise<void> | void;
}

export function EmbedSection({ embeds, onDeleteEmbed }: EmbedSectionProps) {
  // Find the first iframe embed to use as default active tab
  const defaultEmbed = useMemo(
    () => embeds.find((embed) => embed.type === 'iframe') ?? embeds[0] ?? null,
    [embeds],
  );

  const [activeEmbedId, setActiveEmbedId] = useState<string>(
    defaultEmbed?.id ?? '',
  );

  const activeEmbed = useMemo(
    () => embeds.find((embed) => embed.id === activeEmbedId) ?? null,
    [embeds, activeEmbedId],
  );

  const handleTabChange = useCallback((tabId: string) => {
    setActiveEmbedId(tabId);
  }, []);

  // Filter embeds to only show iframe types in the tab content
  const iframeEmbeds = useMemo(
    () => embeds.filter((embed) => embed.type === 'iframe'),
    [embeds],
  );

  // No embeds to display
  if (embeds.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center text-gray-500">
        No integrations available
      </div>
    );
  }

  return (
    <Tabs
      value={activeEmbedId}
      onValueChange={handleTabChange}
      className="h-full w-full text-gray-500"
    >
      <TabsList className="bg-transparent">
        {embeds.map((embed) => (
          <EmbedTab
            key={embed.id}
            embed={embed}
            isActive={embed.id === activeEmbedId}
            onDelete={onDeleteEmbed}
          />
        ))}
      </TabsList>

      <div className="flex h-full w-full gap-8">
        {/* Only render TabsContent for iframe embeds */}
        {iframeEmbeds.map((embed) => (
          <TabsContent
            key={embed.id}
            value={embed.id}
            className="h-full w-full"
          >
            <EmbedPreview embedSrc={embed.value} />
          </TabsContent>
        ))}

        <EmbedEditor
          onAction={async (values) => {
            // Here you would typically handle the form submission
            console.log('Form values:', values);
            // You might want to add your form submission logic here
          }}
          defaultValue={activeEmbed}
        />
      </div>
    </Tabs>
  );
}
