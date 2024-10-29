import { useEffect, useState } from 'react';

import { useSupabase } from '@kit/supabase/hooks/use-supabase';

import { Subtask, Task } from '~/lib/tasks.types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createNewTask } from '~/team-accounts/src/server/actions/tasks/create/create-task';
import { toast } from 'sonner';
import { updateTaskById, updateTaskNameById, updateTasksPositions } from '~/team-accounts/src/server/actions/tasks/update/update-task';
import { deleteTaskById } from '~/team-accounts/src/server/actions/tasks/delete/delete-task';
import { getTasks } from '~/team-accounts/src/server/actions/tasks/get/get-tasks';

export const useRealTimeTasks = (orderId: string) => {
  const supabase = useSupabase();
  const [tasks, setTasks] = useState<Task.Type[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const queryClient = useQueryClient();

  useEffect(() => {
    // Handler for task changes
    const handleTaskChange = (payload: { eventType: string; new: Task.Type; old: Task.Type }) => {
      const { eventType, new: newTask, old: oldTask } = payload;

      if (eventType === 'INSERT') {
        setTasks((prevTasks) => [...prevTasks, { ...newTask, subtasks: [] }]);
      } else if (eventType === 'UPDATE') {
        setTasks(
          (prevTasks) =>
            prevTasks
              .map((task) =>
                task.id === newTask.id
                  ? {
                      ...task,
                      ...newTask,
                      subtasks: task.subtasks, // Preserve subtasks on task update
                    }
                  : task,
              )
              .filter((task) => task.deleted_on === null), // Filter out deleted tasks
        );
      } else if (eventType === 'DELETE') {
        setTasks((prevTasks) =>
          prevTasks.filter((task) => task.id !== oldTask.id),
        );
      }
    };

    // Handler for subtask changes
    const handleSubtaskChange = (payload: { eventType: string; new: Subtask.Type; old: Subtask.Type }) => {
      const { eventType, new: newSubtask, old: oldSubtask } = payload;

      setTasks((prevTasks) => {
        return prevTasks.map((task) => {
          // Only update the task that owns this subtask
          if (
            task.id ===
            (newSubtask?.parent_task_id ?? oldSubtask?.parent_task_id)
          ) {
            const updatedSubtasks = [...(task.subtasks ?? [])];

            if (eventType === 'INSERT') {
              updatedSubtasks.push(newSubtask);
            } else if (eventType === 'UPDATE') {
              const index = updatedSubtasks.findIndex(
                (st) => st.id === newSubtask.id,
              );
              if (index !== -1) {
                updatedSubtasks[index] = {
                  ...updatedSubtasks[index],
                  ...newSubtask,
                };
              }
            } else if (eventType === 'DELETE') {
              const index = updatedSubtasks.findIndex(
                (st) => st.id === oldSubtask.id,
              );
              if (index !== -1) {
                updatedSubtasks.splice(index, 1);
              }
            }

            return { ...task, subtasks: updatedSubtasks };
          }
          return task;
        });
      });
    };

    // Subscribe to both tasks and subtasks changes
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

    // Initial fetch of tasks with their subtasks
    const fetchInitialData = async () => {
        setLoading(true);
        try {
          const tasksData = await getTasks(orderId); 
          setTasks(tasksData ?? []);
        } catch (error) {
          console.error('Error fetching initial data:', error);
        } finally {
          setLoading(false);
        }
      };
  
      fetchInitialData().catch((error) => console.error(error));

    return () => {
      channel.unsubscribe().catch((error) => console.error(error));
    };
  }, []);

  const createTask = useMutation({
    mutationFn: ({
      newTask,
    }: {
      newTask: Omit<Task.Type, 'id'>;
    }) => createNewTask(newTask),

    onSuccess: async () => {
      // toast.success('Successfully created new task');

      await queryClient.invalidateQueries({
        queryKey: ['tasks', 'all'],
      });
    },
    onError: () => {
      toast.error('Error creating new task');
    },
  });

  const updateTaskName = useMutation({
    mutationFn:(
        { 
            taskId, 
            newName 
        }: {
            taskId: string;
            newName: string;
        }
    ) => updateTaskNameById(taskId, newName),
    onSuccess: async () => {
      // toast.success('Successfully updated task name');

      await queryClient.invalidateQueries({
        queryKey: ['tasks', 'all'],
      });
    },
    onError: () => {
      toast.error('Error updating task name');
    },
  });

  const updateTask = useMutation({
    mutationFn:(
        { 
            taskId, 
            task 
        }: {
            taskId: string;
            task: Task.Type;
        }
    ) => updateTaskById(taskId, task),
    onSuccess: async () => {
      // toast.success('Successfully updated task name');

      await queryClient.invalidateQueries({
        queryKey: ['tasks', 'all'],
      });
    },
    onError: () => {
      toast.error('Error updating task name');
    },
  });

  const updateTaskPositions = useMutation({
    mutationFn:(
        { 
            tasks 
        }: {
            tasks: Task.Type[];
        }
    ) => updateTasksPositions(tasks),
    onSuccess: async () => {
      // toast.success('Successfully updated task positions');

      await queryClient.invalidateQueries({
        queryKey: ['tasks', 'all'],
      });
    },
    onError: () => {
      toast.error('Error updating task positions');
    },
  });

  const deleteTask = useMutation({
    mutationFn:(
        { 
            taskId, 
        }: {
            taskId: string;
        }
    ) => deleteTaskById(taskId),
    onSuccess: async () => {
      // toast.success('Successfully deleted task');

      await queryClient.invalidateQueries({
        queryKey: ['tasks', 'all'],
      });
    },
    onError: () => {
      toast.error('Error deleting');
    },
  });

  return {
    tasks,
    setTasks,
    createTask,
    updateTaskName,
    updateTask,
    updateTaskPositions,
    deleteTask,
    loading,
    setLoading,
  };
};
