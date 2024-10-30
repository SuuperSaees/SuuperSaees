import { useEffect, useState } from 'react';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { useSupabase } from '@kit/supabase/hooks/use-supabase';

import { Subtask } from '~/lib/tasks.types';
import { createNewSubtask } from '~/team-accounts/src/server/actions/tasks/create/create-task';
import { updateSubtaskById, updateSubtasksPositions } from '~/team-accounts/src/server/actions/tasks/update/update-task';
import { DragEndEvent, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';

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

  const queryClient = useQueryClient();

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

  useEffect(() => {
    const handleSubtaskChange = (payload: { eventType: string; new: SubtaskType; old: SubtaskType }) => {
      const { eventType, new: newSubtask, old: oldSubtask } = payload;

      setSubtaskList((prevSubtasks) => {
        if (eventType === 'INSERT') {
          return [...prevSubtasks, { ...newSubtask }];
        }

        if (eventType === 'UPDATE') {
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

        if (eventType === 'DELETE') {
          return prevSubtasks.filter((subtask) => subtask.id !== oldSubtask.id);
        }

        return prevSubtasks;
      });
    };

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
  }, []);

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

  const createSubtask = useMutation({
    mutationFn: ({ newSubtask }: { newSubtask: Omit<Subtask.Type, 'id'> }) =>
      createNewSubtask(newSubtask),

    onSuccess: async () => {
      // toast.success('Successfully created new subtask');

      await queryClient.invalidateQueries({
        queryKey: ['subtasks', 'all'],
      });
    },
    onError: () => {
      toast.error('Error creating new subtask');
    },
  });

  const updateSubtask = useMutation({
    mutationFn: async ({
      subtaskId,
      subtask,
    }: {
      subtaskId: string;
      subtask: Subtask.Type;
    }) => updateSubtaskById(subtaskId, subtask),
    onSuccess: async () => {
      // toast.success('Successfully updated task');
      await queryClient.invalidateQueries({
        queryKey: ['subtasks', 'all'],
      });
    },
    onError: () => {
      toast.error('Failed to update task name');
    },
  });

  const updateSubtaskIndex = useMutation({
    mutationFn:(
        { 
          subtasks 
        }: {
          subtasks: Subtask.Type[];
        }
    ) => updateSubtasksPositions(subtasks),
    onSuccess: async () => {
      // toast.success('Successfully updated task positions');

      await queryClient.invalidateQueries({
        queryKey: ['subtasks', 'all'],
      });
      await queryClient.invalidateQueries({
        queryKey: ['taks', 'all'],
      });
    },
    onError: () => {
      toast.error('Error updating task positions');
    },
  });

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
