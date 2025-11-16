import { useCallback, useState } from 'react';

import {
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';

import {
  KanbanColumn,
  KanbanItem,
  KanbanUpdateFunction,
} from '~/(views)/kanban.types';

interface UseKanbanDragNDropProps {
  columns: KanbanColumn[];
  onUpdateFn: KanbanUpdateFunction;
}

const useKanbanDragAndDrop = ({
  columns,
  onUpdateFn,
}: UseKanbanDragNDropProps) => {
  const [activeId, setActiveId] = useState<string | number | null>(null);
  const [type, setType] = useState<'column' | 'item' | null>(null);
  const [dragState, setDragState] = useState<{
    item: KanbanItem | null;
    sourceColumn: KanbanColumn | null;
    previousColumns: KanbanColumn[] | null;
  }>({
    item: null,
    sourceColumn: null,
    previousColumns: null,
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const findColumnByItemId = useCallback(
    (itemId: string | number) =>
      columns.find((col) => col.items.some((item) => item.id === itemId)),
    [columns],
  );

  const isColumnDrag = useCallback(
    (id: string | number) => columns.some((col) => col.id === id),
    [columns],
  );

  // Helper function to find the affected columns and items after a drag operation
  const getAffectedElements = useCallback(
    (
      newColumns: KanbanColumn[],
      sourceColumnId?: string | number,
      targetColumnId?: string | number,
      itemId?: string | number,
    ) => {
      // For column reordering
      if (!itemId) {
        const affectedColumn = newColumns.find(
          (col) => col.id === sourceColumnId,
        );
        if (!affectedColumn) {
          throw new Error(
            'Could not find affected column after column reorder',
          );
        }
        return {
          updatedType: 'column' as const,
          column: affectedColumn,
          item: affectedColumn.items[0], // Required by type but not relevant for column updates
        };
      }

      // For item movement
      const targetColumn = newColumns.find((col) => col.id === targetColumnId);
      const movedItem = targetColumn?.items.find((item) => item.id === itemId);

      if (!targetColumn || !movedItem) {
        throw new Error('Could not find target column or moved item');
      }

      return {
        updatedType: 'item' as const,
        column: targetColumn,
        item: movedItem,
      };
    },
    [],
  );

  const updateColumns = useCallback(
    async (
      newColumns: KanbanColumn[],
      sourceColumnId?: string | number,
      targetColumnId?: string | number,
      itemId?: string | number,
      executeMutation = true,
      targetItem?: KanbanItem,
    ) => {
      try {
        const { updatedType, column, item } = getAffectedElements(
          newColumns,
          sourceColumnId,
          targetColumnId,
          itemId,
        );

        await onUpdateFn(
          {
            updatedType,
            columns: newColumns,
            column,
            item,
            targetItem,
          },
          executeMutation,
        );

        setDragState((prev) => ({ ...prev, previousColumns: columns }));
      } catch (error) {
        console.error('Error updating columns:', error);
        // Revert to previous state if update fails
        if (dragState.previousColumns) {
          setDragState((prev) => ({ ...prev, previousColumns: null }));
        }
      }
    },
    [columns, getAffectedElements, onUpdateFn, dragState.previousColumns],
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event;
      setActiveId(active.id);
      setType(active?.data?.current?.type ?? null);

      if (!isColumnDrag(active.id)) {
        const sourceColumn = findColumnByItemId(active.id);
        if (sourceColumn) {
          const item = sourceColumn.items.find((item) => item.id === active.id);
          setDragState({
            item: item ?? null,
            sourceColumn,
            previousColumns: columns,
          });
        }
      }
    },
    [columns, findColumnByItemId, isColumnDrag],
  );

  const moveItem = useCallback(
    (
      sourceCol: KanbanColumn,
      targetCol: KanbanColumn,
      itemId: string | number,
      overId?: string,
    ): KanbanColumn[] => {
      return columns.map((col) => {
        if (col.id === sourceCol.id) {
          return {
            ...col,
            items: col.items.filter((item) => item.id !== itemId),
          };
        }

        if (col.id === targetCol.id && dragState.item) {
          const newItems = [...col.items];
          const insertIndex =
            overId && newItems.length
              ? newItems.findIndex((item) => item.id === overId) + 1
              : newItems.length;

          newItems.splice(insertIndex, 0, dragState.item);
          return { ...col, items: newItems };
        }

        return col;
      });
    },
    [columns, dragState.item],
  );

  const handleDragOver = useCallback(
    async (event: DragOverEvent) => {
      const { active, over } = event;

      if (!over || isColumnDrag(active.id)) return;

      const sourceColumn = findColumnByItemId(active.id);
      const targetColumn =
        columns.find((col) => col.id === over.id) ??
        findColumnByItemId(over.id);

      if (!sourceColumn || !targetColumn || sourceColumn.id === targetColumn.id)
        return;

      const updatedColumns = moveItem(
        sourceColumn,
        targetColumn,
        active.id,
        over.id as string,
      );
      await updateColumns(
        updatedColumns,
        sourceColumn.id,
        targetColumn.id,
        active.id,
        false,
      );
    },
    [columns, findColumnByItemId, isColumnDrag, moveItem, updateColumns],
  );

  const handleDragCancel = useCallback(async () => {
    if (dragState.previousColumns && dragState.sourceColumn && dragState.item) {
      await updateColumns(
        dragState.previousColumns,
        dragState.sourceColumn.id,
        dragState.sourceColumn.id,
        dragState.item.id,
        false,
      );
    }
    setActiveId(null);
    setDragState({ item: null, sourceColumn: null, previousColumns: null });
  }, [dragState, updateColumns]);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over) return handleDragCancel();

      if (isColumnDrag(active.id)) {
        const oldIndex = columns.findIndex((col) => col.id === active.id);
        const newIndex = columns.findIndex((col) => col.id === over.id);
        if (oldIndex !== newIndex) {
          const newColumns = arrayMove(columns, oldIndex, newIndex);
          await updateColumns(newColumns, active.id);
        }
      } else {
        const sourceColumn = findColumnByItemId(active.id);
        const targetColumn = findColumnByItemId(over.id);

        if (
          sourceColumn &&
          targetColumn &&
          sourceColumn.id === targetColumn.id
        ) {
          const oldIndex = sourceColumn.items.findIndex(
            (item) => item.id === active.id,
          );
          const newIndex = sourceColumn.items.findIndex(
            (item) => item.id === over.id,
          );

          const updatedColumns = columns.map((col) =>
            col.id === sourceColumn.id
              ? {
                  ...col,
                  items: arrayMove(col.items, oldIndex, newIndex),
                }
              : col,
          );

          const targetItem = targetColumn.items.find(
            (item) => item.id === over.id,
          );
          await updateColumns(
            updatedColumns,
            sourceColumn.id,
            targetColumn.id,
            active.id,
            true,
            targetItem,
          );
        }
      }

      // setActiveId(null);
      // setDragState({ item: null, sourceColumn: null, previousColumns: null });
    },
    [
      columns,
      findColumnByItemId,
      handleDragCancel,
      isColumnDrag,
      updateColumns,
    ],
  );

  return {
    sensors,
    activeId,
    type,
    dragState,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
  };
};

export default useKanbanDragAndDrop;
