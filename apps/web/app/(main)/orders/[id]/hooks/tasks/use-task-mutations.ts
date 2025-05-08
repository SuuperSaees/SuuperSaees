import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Task } from '~/lib/tasks.types';
import { createNewTask } from '~/team-accounts/src/server/actions/tasks/create/create-task';
import { deleteTaskById } from '~/team-accounts/src/server/actions/tasks/delete/delete-task';
import {
  updateTaskById,
  updateTaskNameById,
  updateTasksPositions,
} from '~/team-accounts/src/server/actions/tasks/update/update-task';

export const useTaskMutations = () => {
  const queryClient = useQueryClient();

  // Mutations
  const createTask = useMutation({
    mutationFn: ({ newTask }: { newTask: Omit<Task.Type, 'id'> }) =>
      createNewTask(newTask),
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
    mutationFn: ({ taskId, newName }: { taskId: string; newName: string }) =>
      updateTaskNameById(taskId, newName),
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
    mutationFn: ({ taskId, task }: { taskId: string; task: Task.Type }) =>
      updateTaskById(taskId, task),
    onSuccess: async () => {
      // toast.success('Successfully updated task');
      await queryClient.invalidateQueries({
        queryKey: ['tasks', 'all'],
      });
    },
    onError: () => {
      toast.error('Error updating task');
    },
  });

  const updateTaskPositions = useMutation({
    mutationFn: ({ tasks }: { tasks: Task.Type[] }) =>
      updateTasksPositions(tasks),
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
    mutationFn: ({ taskId }: { taskId: string }) => deleteTaskById(taskId),
    onSuccess: async () => {
      // toast.success('Successfully deleted task');
      await queryClient.invalidateQueries({
        queryKey: ['tasks', 'all'],
      });
    },
    onError: () => {
      toast.error('Error deleting task');
    },
  });

  return {
    createTask,
    updateTaskName,
    updateTask,
    updateTaskPositions,
    deleteTask,
  };
};
