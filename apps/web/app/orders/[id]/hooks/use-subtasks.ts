import { useCallback, useEffect, useState } from 'react';

import { useSupabase } from '@kit/supabase/hooks/use-supabase';

import { Subtask } from '~/lib/tasks.types';
import { DragEndEvent, DragStartEvent, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useSubtaskMutations } from './subtasks/use-subtask-mutations';

type SubtaskType = Subtask.Type;

export const useRealTimeSubtasks = (initialSubtasks: SubtaskType[]) => {
  const supabase = useSupabase();
  const [subtaskList, setSubtaskList] = useState<SubtaskType[]>(initialSubtasks);

  // Drag and drop states
  const [isDragging, setIsDragging] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [dragTask, setDragTask] = useState({
    isDragging: false,
    type: null,
  });

  const { createSubtask, updateSubtask, updateSubtaskIndex } = useSubtaskMutations();

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

  const handleSubtaskChange = useCallback(
    (payload: { eventType: string; new: SubtaskType; old: SubtaskType }) => {
      const { eventType, new: newSubtask, old: oldSubtask } = payload;
      const insert = 'INSERT';
      const update = 'UPDATE';
      const del = 'DELETE';
  
      setSubtaskList((prevSubtasks) => {
        if (eventType === insert) {
          return [...prevSubtasks, { ...newSubtask }];
        }
  
        if (eventType === update) {
          return prevSubtasks
            .map((subtask) =>
              subtask.id === newSubtask.id
                ? {
                    ...subtask,
                    ...newSubtask,
                  }
                : subtask,
            )
            .filter((subtask) => subtask.deleted_on === null); // Filter out deleted subtasks
        }
  
        if (eventType === del) {
          return prevSubtasks.filter((subtask) => subtask.id !== oldSubtask.id);
        }
  
        return prevSubtasks;
      });
    },
    [],
  )

  useEffect(() => {
    const channel = supabase
      .channel('subtasks')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'subtasks' },
        handleSubtaskChange,
      )
      .subscribe();

    return () => {
      channel.unsubscribe().catch((error) => console.error(error));
    };
  }, [supabase, handleSubtaskChange]);

  // Drag and drop handlers
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
  
    const oldIndex = subtaskList.findIndex((subtask) => subtask.id === active.id);
    const newIndex = subtaskList.findIndex((subtask) => subtask.id === over.id);
  
    if (oldIndex !== newIndex) {
      const updatedSubtasks = arrayMove(subtaskList, oldIndex, newIndex).map((subtask, index) => ({
        ...subtask,
        position: index,
      }));
  
      setSubtaskList(updatedSubtasks); 
      await updateSubtaskIndex.mutateAsync({
        subtasks: updatedSubtasks,
       }); 
    }
  
    resetDragState();
  }

  const resetDragState = () => {
    setIsDragging(false);
    setActiveId(null);
    setDragTask({
      isDragging: false,
      type: null,
    });
  };

  return {
    // Subtask states
    subtaskList,
    createSubtask,

    // Subtask mutations
    updateSubtask,
    updateSubtaskIndex,

    // Drag and drop states
    isDragging,
    dragTask,
    sensors,
    handleDragStart,
    handleDragEnd,
    activeId,
  };
};
