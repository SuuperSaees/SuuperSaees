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

import { Subtask, Task } from '~/lib/tasks.types';

import { useRealTimeTasks } from './use-tasks';

export function useTaskDragAndDrop(
  tasks: Task.Type[] | Subtask.Type[],
  orderId: string,
) {
  const [taskList, setTaskList] = useState(tasks);
  const [isDragging, setIsDragging] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [dragTask, setDragTask] = useState({
    isDragging: false,
    type: null,
  });
  const { updateTaskPositions, updateSubtaskPositions } =
    useRealTimeTasks(orderId);

  useEffect(() => {
    setTaskList(tasks);
  }, [tasks]);

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

    if (dragTask.type === 'task') {
      await handleTaskDragEnd(active.id as string, over.id as string);
    } else if (dragTask.type === 'subtask') {
      await handleSubtaskDragEnd(active.id as string, over.id as string);
    }

    resetDragState();
  }

  const handleTaskDragEnd = async (activeId: string, overId: string) => {
    const oldIndex = taskList.findIndex((task) => task.id === activeId);
    const newIndex = taskList.findIndex((task) => task.id === overId);

    if (oldIndex !== newIndex) {
      const updatedTasks = arrayMove(taskList, oldIndex, newIndex).map(
        (task, index) => ({
          ...task,
          position: index,
        }),
      );

      setTaskList(updatedTasks);
      await updateTaskPositions.mutateAsync({
        tasks: updatedTasks,
      });
    }
  };

  const handleSubtaskDragEnd = async (activeId: string, overId: string) => {
    const parentTask = taskList.find((task) =>
      task.subtasks?.some((subtask) => subtask.id === activeId),
    );

    if (!parentTask?.subtasks) return;

    const oldIndex = parentTask.subtasks.findIndex(
      (subtask) => subtask.id === activeId,
    );
    const newIndex = parentTask.subtasks.findIndex(
      (subtask) => subtask.id === overId,
    );

    if (oldIndex !== newIndex) {
      const updatedSubtasks = arrayMove(
        parentTask.subtasks,
        oldIndex,
        newIndex,
      ).map((subtask, index) => ({
        ...subtask,
        position: index,
      }));

      const updatedTask = {
        ...parentTask,
        subtasks: updatedSubtasks,
      };

      const updatedTasks = taskList.map((t) =>
        t.id === parentTask.id ? updatedTask : t,
      );

      setTaskList(updatedTasks);
      await updateSubtaskPositions.mutateAsync({
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
    taskList,
    sensors,
    handleDragStart,
    handleDragEnd,
    activeId,
  };
}
