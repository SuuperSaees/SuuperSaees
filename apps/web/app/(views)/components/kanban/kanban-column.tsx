'use client';

import { useTranslation } from 'react-i18next';

import { useKanbanContext } from '~/(views)/contexts/kanban-context';
import { KanbanColumn as KanbanColumnType } from '~/(views)/kanban.types';
import { parseUser } from '~/(views)/utils/kanban/data-transform';
import { ViewUser } from '~/(views)/views.types';
import { darkenColor, hexToRgba } from '~/utils/generate-colors';
import { formatString } from '~/utils/text-formatter';

import SortableItem from '../../../components/sortable-item';
import Avatar from '../../../components/ui/avatar';
import KanbanCard from './kanban-card';

const KanbanColumn = ({ column }: { column: KanbanColumnType }) => {
  const { customComponents } = useKanbanContext();
  const CustomCard = customComponents?.kanban?.Card;

  const { t } = useTranslation('views');

  const columnName: ViewUser | string =
    column.value_type === 'string-default'
      ? column.name
      : parseUser(column.name);

  return (
    <div
      key={column.key}
      className="flex w-full min-w-72 max-w-72 flex-col gap-2 rounded-md p-4 max-h-full min-h-0 "
      style={{
        backgroundColor: hexToRgba(column.color, 0.2),
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between gap-2"
        style={{
          color: darkenColor(column.color, 0.7),
        }}
      >
        {column.value_type === 'string-default' ? (
          <h2 className="text-sm font-bold">
            {column.name.length
              ? column.name
              : t('kanban.columns.negations.no') +
                ' ' +
                formatString(
                  t(`kanban.columns.negations.${column.type}`),
                  'lower',
                )}
          </h2>
        ) : (
          <div className="flex items-center gap-2">
            <Avatar
              src={(columnName as ViewUser).picture_url}
              alt={(columnName as ViewUser).name}
              username={(columnName as ViewUser).name}
              className="h-6 w-6 rounded-full text-xs"
            />
            <span className="text-sm font-semibold">
              {(columnName as ViewUser).name}
            </span>
          </div>
        )}

        <span className="text-sm font-semibold">{column.count.total}</span>
      </div>
      <div className="flex flex-col gap-2 overflow-y-auto no-scrollbar max-h-full h-full">
        {column.items.map((item) => (
          <SortableItem
            key={item.id + column.id}
            id={item.id}
            data={{ type: 'item' }}
            overlayClassName='rounded-md bg-transparent'
            styleOnDrag={{ opacity: 0 }}
          >
            {CustomCard ? (
              <CustomCard item={item} />
            ) : (
              <KanbanCard item={item} />
            )}
          </SortableItem>
        ))}
      </div>
    </div>
  );
};

export default KanbanColumn;
