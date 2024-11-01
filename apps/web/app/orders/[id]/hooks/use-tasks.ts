import { useCallback, useEffect } from 'react';

import { useQuery, useQueryClient } from '@tanstack/react-query';

import { useSupabase } from '@kit/supabase/hooks/use-supabase';

import { Subtask, Task } from '~/lib/tasks.types';
import { getTasks } from '~/team-accounts/src/server/actions/tasks/get/get-tasks';

import { useDragAndDrop } from './tasks/use-task-drag-and-drop';
import { useTaskMutations } from './tasks/use-task-mutations';

export const useRealTimeTasks = (orderId: string) => {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  const {
    createTask,
    updateTaskName,
    updateTask,
    updateTaskPositions,
    deleteTask,
  } = useTaskMutations();

  // Task data with useQuery
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks', orderId],
    queryFn: () => getTasks(orderId),
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  const {
    isDragging,
    activeId,
    handleDragStart,
    handleDragEnd,
    dragTask,
    sensors,
  } = useDragAndDrop(updateTaskPositions, orderId);

  const handleTaskChange = useCallback(
    (payload: { eventType: string; new: Task.Type; old: Task.Type }) => {
      const { eventType, new: newTask, old: oldTask } = payload;
      const insert = 'INSERT';
      const update = 'UPDATE';
      const del = 'DELETE';

      queryClient.setQueryData(
        ['tasks', orderId],
        (oldTasks: Task.Type[] | undefined) => {
          if (!oldTasks) return [];
          switch (eventType) {
            case insert:
              return [...oldTasks, { ...newTask, subtasks: [] }];
            case update:
              return oldTasks
                .map((task) =>
                  task.id === newTask.id ? { ...task, ...newTask } : task,
                )
                .filter((task) => task.deleted_on === null);
            case del:
              return oldTasks.filter((task) => task.id !== oldTask.id);
            default:
              return oldTasks;
          }
        },
      );
    },
    [queryClient, orderId],
  );

  const handleSubtaskChange = useCallback(
    (payload: { eventType: string; new: Subtask.Type; old: Subtask.Type }) => {
      const { eventType, new: newSubtask, old: oldSubtask } = payload;
      const insert = 'INSERT';
      const update = 'UPDATE';
      const del = 'DELETE';

      queryClient.setQueryData(
        ['tasks', orderId],
        (oldTasks: Task.Type[] | undefined) => {
          if (!oldTasks) return [];
          return oldTasks.map((task) => {
            if (
              task.id ===
              (newSubtask?.parent_task_id ?? oldSubtask?.parent_task_id)
            ) {
              const updatedSubtasks = [...(task.subtasks ?? [])];
              if (eventType === insert) updatedSubtasks.push(newSubtask);
              else if (eventType === update) {
                const index = updatedSubtasks.findIndex(
                  (st) => st.id === newSubtask.id,
                );
                if (index !== -1)
                  updatedSubtasks[index] = {
                    ...updatedSubtasks[index],
                    ...newSubtask,
                  };
              } else if (eventType === del) {
                const index = updatedSubtasks.findIndex(
                  (st) => st.id === oldSubtask.id,
                );
                if (index !== -1) updatedSubtasks.splice(index, 1);
              }
              return { ...task, subtasks: updatedSubtasks };
            }
            return task;
          });
        },
      );
    },
    [queryClient, orderId],
  );

  useEffect(() => {
    // Subscription
    const channel = supabase
      .channel('tasks-and-subtasks')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        handleTaskChange,
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'subtasks' },
        handleSubtaskChange,
      )
      .subscribe();

    return () => {
      channel.unsubscribe().catch((error) => console.error(error));
    };
  }, [orderId, supabase, handleTaskChange, handleSubtaskChange]);

  return {
    // Task state
    tasks,
    loading: isLoading,

    // Task mutations
    createTask,
    updateTaskName,
    updateTask,
    updateTaskPositions,
    deleteTask,

    // Drag and drop
    dragTask,
    isDragging,
    sensors,
    handleDragStart,
    handleDragEnd,
    activeId,
  };
};
