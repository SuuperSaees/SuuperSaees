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

import { KanbanColumn, KanbanItem } from '~/(views)/kanban.types';

interface UseKanbanDragNDropProps {
  columns: KanbanColumn[];
  onUpdateFn: (columns: KanbanColumn[]) => void;
}

const useKanbanDragAndDrop = ({
  columns,
  onUpdateFn,
}: UseKanbanDragNDropProps) => {
  const [activeId, setActiveId] = useState<string | number | null>(null);
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

  // Helper: Find a column containing a specific item
  const findColumnByItemId = useCallback(
    (itemId: string | number) =>
      columns.find((col) => col.items.some((item) => item.id === itemId)),
    [columns],
  );

  // Helper: Check if the active drag target is a column
  const isColumnDrag = useCallback(
    (id: string | number) => columns.some((col) => col.id === id),
    [columns],
  );

  // Helper: Update the columns with new state
  const updateColumns = useCallback(
    (newColumns: KanbanColumn[]) => {
      setDragState((prev) => ({ ...prev, previousColumns: columns }));
      onUpdateFn(newColumns);
    },
    [columns, onUpdateFn],
  );

  // Handles the start of a drag event
  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event;
      setActiveId(active.id);

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

  // Handles moving an item between columns or reordering within a column
  const moveItem = useCallback(
    (
      sourceCol: KanbanColumn,
      targetCol: KanbanColumn,
      itemId: string | number,
      overId?: string,
    ): KanbanColumn[] => {
      return columns.map((col) => {
        if (col.id === sourceCol.id) {
          // Remove the item from the source column
          return {
            ...col,
            items: col.items.filter((item) => item.id !== itemId),
          };
        }

        if (col.id === targetCol.id && dragState.item) {
          // Add the item to the target column
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

  // Handles drag-over events (including to empty columns)
  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
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
      updateColumns(updatedColumns);
    },
    [columns, findColumnByItemId, isColumnDrag, moveItem, updateColumns],
  );

  // Handles drag cancellation (restores previous state)
  const handleDragCancel = useCallback(() => {
    if (dragState.previousColumns) {
      onUpdateFn(dragState.previousColumns);
    }
    setActiveId(null);
    setDragState({ item: null, sourceColumn: null, previousColumns: null });
  }, [dragState.previousColumns, onUpdateFn]);

  // Handles the end of a drag event
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over) return handleDragCancel();

      if (isColumnDrag(active.id)) {
        // Handle reordering columns
        const oldIndex = columns.findIndex((col) => col.id === active.id);
        const newIndex = columns.findIndex((col) => col.id === over.id);
        if (oldIndex !== newIndex) {
          updateColumns(arrayMove(columns, oldIndex, newIndex));
        }
      } else {
        // Handle reordering or moving items
        const sourceColumn = findColumnByItemId(active.id);
        const targetColumn = findColumnByItemId(over.id);

        if (
          sourceColumn &&
          targetColumn &&
          sourceColumn.id === targetColumn.id
        ) {
          // Reordering within the same column
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
          updateColumns(updatedColumns);
        }
      }

      setActiveId(null);
      setDragState({ item: null, sourceColumn: null, previousColumns: null });
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
    dragState,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
  };
};

export default useKanbanDragAndDrop;
