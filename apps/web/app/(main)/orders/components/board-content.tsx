import Board from '~/(views)/components/board';
import KanbanSkeleton from '~/(views)/components/kanban/kanban-skeleton';
import TableSkeleton from '~/(views)/components/table/table-skeleton';
import { EmbedPreview } from '~/(main)/embeds/components/embed-preview';
import { Embeds } from '~/lib/embeds.types';

interface BoardContentProps {
  ordersAreLoading: boolean;
  currentView: string;
  activeTab: string;
  isEmbedTab: (tabId: string) => boolean;
  embeds: Embeds.TypeWithRelations[];
  className?: string;
}

export function BoardContent({
  ordersAreLoading,
  currentView,
  activeTab,
  isEmbedTab,
  embeds,
  className,
}: BoardContentProps) {
  if (ordersAreLoading) {
    return currentView === 'kanban' ? (
      <KanbanSkeleton columns={5} />
    ) : (
      <TableSkeleton columns={9} rows={7} />
    );
  }

  // If the active tab is an embed, show the embed preview
  if (isEmbedTab(activeTab)) {
    const activeEmbed = embeds.find((embed) => embed.id === activeTab);
    return <EmbedPreview embedSrc={activeEmbed?.value ?? ''} />;
  }

  // Otherwise show the board
  return <Board className={className} />;
}
