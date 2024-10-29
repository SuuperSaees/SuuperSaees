import { useEffect, useState } from 'react';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { useSupabase } from '@kit/supabase/hooks/use-supabase';

import { Subtask } from '~/lib/tasks.types';
import { createNewSubtask } from '~/team-accounts/src/server/actions/tasks/create/create-task';
import { updateSubtaskById, updateSubtasksPositions } from '~/team-accounts/src/server/actions/tasks/update/update-task';

type SubtaskType = Subtask.Type;

export const useRealTimeSubtasks = (initialSubtasks: SubtaskType[]) => {
  const supabase = useSupabase();
  const [subtaskList, setSubtaskList] =
    useState<SubtaskType[]>(initialSubtasks);

  const queryClient = useQueryClient();

  useEffect(() => {
    const handleSubtaskChange = (payload: {
      eventType: string;
      new: SubtaskType;
      old: SubtaskType;
    }) => {
      const { eventType, new: newSubtask, old: oldSubtask } = payload;
      if (eventType === 'INSERT') {
        setSubtaskList((prevSubtasks) => [...prevSubtasks, { ...newSubtask }]);
      } else if (eventType === 'UPDATE') {
        setSubtaskList(
          (prevSubtasks) =>
            prevSubtasks
              .map((subtask) =>
                subtask.id === newSubtask.id
                  ? {
                      ...subtask,
                      ...newSubtask,
                    }
                  : subtask,
              )
              .filter((subtask) => subtask.deleted_on === null), // Filter out deleted subtasks
        );
      } else if (eventType === 'DELETE') {
        setSubtaskList((prevSubtasks) =>
          prevSubtasks.filter((subtask) => subtask.id !== oldSubtask.id),
        );
      }
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
    subtaskList,
    createSubtask,
    updateSubtask,
    updateSubtaskIndex,
  };
};
