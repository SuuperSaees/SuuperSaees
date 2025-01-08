import { DndContext, closestCorners } from '@dnd-kit/core';
// import { restrictToHorizontalAxis } from '@dnd-kit/modifiers';
import {
  SortableContext,
  horizontalListSortingStrategy,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import useKanbanColumns from '~/(views)/hooks/kanban/use-kanban-columns';
import useKanbanDragAndDrop from '~/(views)/hooks/kanban/use-kanban-drag-n-drop';
import { KanbanColumn as KanbanColumnType } from '~/(views)/kanban.types';

import styles from '../../../../components/ui/styles.module.css';
import SortableItem from '../../../components/sortable-item';
import KanbanColumn from './kanban-column';
import { useKanbanContext } from '~/(views)/contexts/kanban-context';

const KanbanColumns = ({
  columns,
  setColumns,
}: {
  columns: KanbanColumnType[];
  setColumns: React.Dispatch<React.SetStateAction<KanbanColumnType[]>>;
}) => {
  // Helper to update column positions consistently
  const { onUpdateFn } = useKanbanContext();
  const { handleUpdateColumns } = useKanbanColumns(columns, setColumns, onUpdateFn);
  
  const {
    sensors,
    handleDragEnd,
    handleDragOver,
    handleDragStart,
    handleDragCancel,
  } = useKanbanDragAndDrop({
    columns,
    onUpdateFn: handleUpdateColumns,
  });

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragStart={handleDragStart}
      onDragCancel={handleDragCancel}
      // modifiers={[restrictToHorizontalAxis]}
    >
      <div
        className={`flex max-w-full gap-4 overflow-y-auto p-4 ${styles['scrollbar-thin']} max-h-screen min-h-[70vh]`}
      >
        <SortableContext
          items={columns.map((column) => column.id)}
          strategy={horizontalListSortingStrategy}
        >
          {columns?.map((column) => (
            <SortableItem
              id={column.id}
              key={column.id}
              className="h-full"
              data={{ type: 'column' }}
            >
              <SortableContext
                strategy={verticalListSortingStrategy}
                items={column.items.map((item) => item.id)}
              >
                <KanbanColumn column={column} />
              </SortableContext>
            </SortableItem>
          ))}
        </SortableContext>
      </div>
    </DndContext>
  );
};

export default KanbanColumns;
