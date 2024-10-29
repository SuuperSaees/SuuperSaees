import { useState } from 'react';
import { useEffect } from 'react';

import {
  DragEndEvent,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';

import { Subtask} from '~/lib/tasks.types';

import { useRealTimeSubtasks } from './use-subtasks';

export function useSubtaskDragAndDrop(
  subtasks: Subtask.Type[],
) {
  const [subtaskListDragAnDrop, setSubaskList] = useState(subtasks);
  const [isDragging, setIsDragging] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [dragTask, setDragTask] = useState({
    isDragging: false,
    type: null,
  });

  const { updateSubtaskIndex } =
    useRealTimeSubtasks(subtaskListDragAnDrop);

  useEffect(() => {
    setSubaskList(subtasks);
  }, [subtasks]);

  const mouseSensor = useSensor(MouseSensor, {
    // Require the mouse to move by 10 pixels before activating
    activationConstraint: {
      distance: 10,
    },
  });
  const touchSensor = useSensor(TouchSensor, {
    // Press delay of 250ms, with tolerance of 5px of movement
    activationConstraint: {
      delay: 250,
      tolerance: 5,
    },
  });
  const sensors = useSensors(mouseSensor, touchSensor);

  function handleDragStart(event: DragStartEvent) {
    setIsDragging(true);
    setActiveId(event.active.id as string);
    const draggableData = event.active?.data?.current;

    if (draggableData?.type) {
      setDragTask({
        isDragging: true,
        type: draggableData.type,
      });
    } else {
      setDragTask({
        isDragging: false,
        type: null,
      });
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over) {
      resetDragState();
      return;
    }

    await handleTaskDragEnd(active.id as string, over.id as string);

    resetDragState();
  }

  const handleTaskDragEnd = async (activeId: string, overId: string) => {
    const oldIndex = subtaskListDragAnDrop.findIndex((task) => task.id === activeId);
    const newIndex = subtaskListDragAnDrop.findIndex((task) => task.id === overId);

    if (oldIndex !== newIndex) {
      const updatedSubtasks = arrayMove(subtaskListDragAnDrop, oldIndex, newIndex).map(
        (subtask, index) => ({
          ...subtask,
          position: index,
        }),
      );

      setSubaskList(updatedSubtasks);
      await updateSubtaskIndex.mutateAsync({
        subtasks: updatedSubtasks,
      });
    }
  };

  const resetDragState = () => {
    setIsDragging(false);
    setActiveId(null);
    setDragTask({
      isDragging: false,
      type: null,
    });
  };

  return {
    dragTask,
    isDragging,
    subtaskListDragAnDrop,
    sensors,
    handleDragStart,
    handleDragEnd,
    activeId,
  };
}
