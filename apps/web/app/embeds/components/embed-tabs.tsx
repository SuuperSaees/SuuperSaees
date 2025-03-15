'use client';

import { Plus } from "lucide-react";
import { TabsList, TabsTrigger } from "@kit/ui/tabs";
import { EmbedTab } from "./embed-tab";
import { Embeds } from "~/lib/embeds.types";

interface EmbedTabsProps {
  embeds: Array<Embeds.Type>;
  activeEmbedId: string;
  onDeleteEmbed?: (id: string) => void;
}

export function EmbedTabs({ 
  embeds, 
  activeEmbedId, 
  onDeleteEmbed
}: EmbedTabsProps) {
  return (
    <TabsList className="bg-transparent">
      <TabsTrigger 
        value="new" 
        className="group flex items-center gap-2 text-sm transition-colors data-[state=active]:bg-[#F0F0F0] data-[state=inactive]:bg-transparent data-[state=active]:text-black data-[state=inactive]:text-gray-500"
      >
        <Plus className="h-4 w-4" />
        Add Integration
      </TabsTrigger>
      {embeds.map((embed) => (
        <EmbedTab
          key={embed.id}
          embed={embed}
          isActive={embed.id === activeEmbedId}
          onDelete={onDeleteEmbed}
        />
      ))}
    </TabsList>
  );
}

