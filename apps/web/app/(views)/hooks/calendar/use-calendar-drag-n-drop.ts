import { useCallback, useRef, useState } from 'react';

import {
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragCancelEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  rectIntersection,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';

import {
  CalendarCell,
  CalendarCellContent,
  CalendarItem,
  UpdateCalendarFunction,
} from '~/(views)/calendar.types';

type DragState<T extends CalendarItem> = {
  id: string | number;
  item: T;
  sourceDate?: string;
  sourceCell?: CalendarCellContent<CalendarItem>;
  lastTargetDate?: string;
  lastTargetCell?: CalendarCellContent<CalendarItem>;
};

export type UpdateFunction = UpdateCalendarFunction;

interface UseCalendarDragAndDropProps {
  cells: CalendarCell<CalendarItem>['content'];
  onUpdateFn: UpdateFunction;
}

const useCalendarDragAndDrop = <T extends CalendarItem>({
  cells,
  onUpdateFn,
}: UseCalendarDragAndDropProps) => {
  const [dragState, setDragState] = useState<DragState<T> | null>(null);
  const lastDragOverTime = useRef<number>(0);
  const dragOverThrottleMs = 50; // Minimum time between dragOver updates
  
  // Use rectIntersection for more precise collision detection
  const collisionDetection = rectIntersection;

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 10,
    },
  });

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 250,
      tolerance: 5,
    },
  });

  const keyboardSensor = useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates,
  });

  const sensors = useSensors(mouseSensor, touchSensor, keyboardSensor);

  const handleDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.item) {
      const sourceDate = event.active.data.current?.date as string;
      const sourceCell = cells.find((cell) => cell.date === sourceDate);
      
      setDragState({
        id: event.active.id,
        item: event.active.data.current?.item,
        sourceDate,
        sourceCell: sourceCell as CalendarCellContent<CalendarItem>,
      });
    }
  };

  const handleDragOver = useCallback(async (event: DragOverEvent) => {
    const { active, over } = event;
    if (!active || !over) return;

    const now = Date.now();
    if (now - lastDragOverTime.current < dragOverThrottleMs) {
      return; // Skip update if too soon
    }
    lastDragOverTime.current = now;

    const sourceItem = active.data.current?.item as T;
    const sourceDate = active.data.current?.date as string;
    const targetDate = over.data.current?.date as string;

    // Skip if nothing has changed or if over a non-cell element
    if (!targetDate || sourceDate === targetDate) return;

    const sourceCell = cells.find((cell) => cell.date === sourceDate);
    const targetCell = cells.find((cell) => cell.date === targetDate);

    if (!sourceCell || !targetCell) return;

    // Create updated source and target cells
    const updatedSourceCell: CalendarCellContent<CalendarItem> = {
      ...sourceCell,
      items: sourceCell.items.filter((item) => item.id !== sourceItem.id),
    };

    // Create updated item with new due date
    const updatedItem = {
      ...sourceItem,
      due_date: targetDate,
    };

    // Add item to target cell
    const updatedTargetCell: CalendarCellContent<CalendarItem> = {
      ...targetCell,
      items: [...targetCell.items, updatedItem],
    };

    // Update dragState with the last target information
    setDragState((prev) => prev ? {
      ...prev,
      lastTargetDate: targetDate,
      lastTargetCell: targetCell,
    } : null);

    // Update cells with the changes
    await onUpdateFn(
      updatedItem,
      updatedTargetCell,
      [updatedSourceCell, updatedTargetCell],
      false
    );
  }, [cells, onUpdateFn]);

  const handleDragCancel = useCallback((_event: DragCancelEvent) => {
    if (!dragState?.sourceCell) {
      setDragState(null);
      return;
    }

    // If we have a last target cell, we need to revert both cells
    if (dragState.lastTargetCell && dragState.lastTargetDate !== dragState.sourceDate) {
      const updatedSourceCell = {
        ...dragState.sourceCell,
        items: [...dragState.sourceCell.items], // Keep original items
      };

      const updatedTargetCell = {
        ...dragState.lastTargetCell,
        items: dragState.lastTargetCell.items.filter(item => item.id !== dragState.item.id), // Remove dragged item
      };

      void onUpdateFn(
        dragState.item,
        updatedSourceCell,
        [updatedSourceCell, updatedTargetCell],
        false
      );
    } else {
      // Just restore the source cell if no target cell was involved
      const updatedSourceCell = {
        ...dragState.sourceCell,
        items: [...dragState.sourceCell.items],
      };

      void onUpdateFn(
        dragState.item,
        updatedSourceCell,
        [updatedSourceCell],
        false
      );
    }

    setDragState(null);
  }, [dragState, onUpdateFn]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!active || !over) {
      setDragState(null);
      return;
    }

    const sourceItem = active.data.current?.item as T;
    const sourceDate = active.data.current?.date as string;
    const targetDate = over.data.current?.date as string;

    // If dropped on a non-cell element or invalid target, reset state
    if (!targetDate) {
      setDragState(null);
      return;
    }

    const sourceCell = cells.find((cell) => cell.date === sourceDate);
    const targetCell = cells.find((cell) => cell.date === targetDate);

    if (!sourceCell || !targetCell) {
      setDragState(null);
      return;
    }

    // Handle same cell reordering
    if (sourceDate === targetDate) {
      const items = [...sourceCell.items];
      const oldIndex = items.findIndex((item) => item.id === sourceItem.id);
      const newIndex = targetCell.items.findIndex(
        (item) => item.id === over.data.current?.item?.id
      );

      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedItems = arrayMove(items, oldIndex, newIndex);
        const updatedCell: CalendarCellContent<CalendarItem> = {
          ...sourceCell,
          items: reorderedItems,
        };

        await onUpdateFn(sourceItem, updatedCell, [updatedCell], true);
      }
    } else {
      // Handle moving to different cell
      const updatedItem = {
        ...sourceItem,
        due_date: targetDate,
      };

      const updatedSourceCell: CalendarCellContent<CalendarItem> = {
        ...sourceCell,
        items: sourceCell.items.filter((item) => item.id !== sourceItem.id),
      };

      const updatedTargetCell: CalendarCellContent<CalendarItem> = {
        ...targetCell,
        items: [...targetCell.items, updatedItem],
      };

      await onUpdateFn(
        updatedItem,
        updatedTargetCell,
        [updatedSourceCell, updatedTargetCell],
        true
      );
    }

    setDragState(null);
  };

  return {
    handleDragEnd,
    handleDragStart,
    handleDragOver,
    handleDragCancel,
    collisionDetection,
    sensors,
    dragState,
  };
};

export default useCalendarDragAndDrop;
