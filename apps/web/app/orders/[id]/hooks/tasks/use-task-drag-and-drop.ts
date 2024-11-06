import { useState } from 'react';

import {
  DragEndEvent,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { UseMutationResult, useQueryClient } from '@tanstack/react-query';

import { Task } from '~/lib/tasks.types';

export const useDragAndDrop = (
  updateTaskPositions: UseMutationResult<
    null | undefined,
    Error,
    { tasks: Task.Type[] },
    unknown
  >,
  orderId: string,
) => {
  const [isDragging, setIsDragging] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const [dragTask, setDragTask] = useState({
    isDragging: false,
    type: null,
  });

  // Configure DnD sensors
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
  const sensors = useSensors(mouseSensor, touchSensor);

  const handleDragStart = (event: DragStartEvent) => {
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
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      resetDragState();
      return;
    }

    let updatedTasks: Task.Type[] = [];

    queryClient.setQueryData(
      ['tasks', orderId],
      (prevTasks: Task.Type[] | undefined) => {
        if (!prevTasks) return [];
        const oldIndex = prevTasks.findIndex((task) => task.id === active.id);
        const newIndex = prevTasks.findIndex((task) => task.id === over.id);

        if (oldIndex === newIndex) return prevTasks;

        updatedTasks = arrayMove(prevTasks, oldIndex, newIndex).map(
          (task, index) => ({
            ...task,
            position: index,
          }),
        );

        return updatedTasks;
      },
    );

    await updateTaskPositions.mutateAsync({ tasks: updatedTasks });

    resetDragState();
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
    isDragging,
    activeId,
    dragTask,
    handleDragStart,
    handleDragEnd,
    sensors,
  };
};
