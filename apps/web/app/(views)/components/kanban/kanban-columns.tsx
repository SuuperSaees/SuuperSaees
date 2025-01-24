'use client';
import { DndContext, DragOverlay, closestCorners } from '@dnd-kit/core';
// import { restrictToHorizontalAxis } from '@dnd-kit/modifiers';
import {
  SortableContext,
  // horizontalListSortingStrategy,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import { useKanbanContext } from '~/(views)/contexts/kanban-context';
import useKanbanColumns from '~/(views)/hooks/kanban/use-kanban-columns';
import useKanbanDragAndDrop from '~/(views)/hooks/kanban/use-kanban-drag-n-drop';
import { KanbanColumn as KanbanColumnType } from '~/(views)/kanban.types';

import styles from '../../../../components/ui/styles.module.css';
import SortableItem from '../../../components/sortable-item';
// import KanbanCard from './kanban-card';
import KanbanColumn from './kanban-column';
import KanbanCard from './kanban-card';

const KanbanColumns = ({
  columns,
  setColumns,
}: {
  columns: KanbanColumnType[];
  setColumns: React.Dispatch<React.SetStateAction<KanbanColumnType[]>>;
}) => {
  // Helper to update column positions consistently
  const { onUpdateFn, setData, customComponents } = useKanbanContext();
  const { handleUpdateColumns } = useKanbanColumns(
    columns,
    setColumns,
    setData,
    onUpdateFn,
  );

  const {
    sensors,
    activeId,
    type,
    dragState,
    handleDragEnd,
    handleDragOver,
    handleDragStart,
    handleDragCancel,
  } = useKanbanDragAndDrop({
    columns,
    onUpdateFn: handleUpdateColumns,
  });
  
  const CustomCard = customComponents?.kanban?.Card;
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragStart={handleDragStart}
      onDragCancel={handleDragCancel}
  
    >
      <div
        className={`flex max-w-full gap-4 py-4 ${styles['scrollbar-thin']} max-h-full min-h-0 h-full`}
      >
        {/* <SortableContext
          items={columns.map((column) => column.id)}
          strategy={horizontalListSortingStrategy}
        > */}
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
          <DragOverlay className='opacity-70'>
            {/* {activeId && type === 'column' && (
              <KanbanColumn
                column={columns.find((column) => column.id === activeId)}
              />
            )} */}
            {activeId && dragState.item && type === 'item' && CustomCard ? (
   
              <CustomCard
                item={dragState.item}
                className='bg-white/70 opacity-70 pointer-events-none'
                style={{ opacity: 0.7 }}
              />
            ): activeId && dragState.item && type === 'item' ? (
              <KanbanCard item={dragState.item} className='pointer-events-none' style={{ opacity: 0.7 }} />
            ): null}
          </DragOverlay>
        {/* </SortableContext> */}
      </div>
    </DndContext>
  );
};

export default KanbanColumns;
