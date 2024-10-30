import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Subtask } from '~/lib/tasks.types';
import { createNewSubtask } from '~/team-accounts/src/server/actions/tasks/create/create-task';
import { updateSubtaskAssigns, updateSubtaskById, updateSubtasksPositions } from '~/team-accounts/src/server/actions/tasks/update/update-task';


export const useSubtaskMutations = () => {
  const queryClient = useQueryClient();

  // Mutations
  const createSubtask = useMutation({
    mutationFn: ({ newSubtask }: { newSubtask: Omit<Subtask.Type, 'id'> }) =>
      createNewSubtask(newSubtask),

    onSuccess: async () => {
    //   toast.success('Successfully created new subtask');

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
    //   toast.success('Successfully updated task');
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
    //   toast.success('Successfully updated subtask positions');

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

  const changeAgencyMembersAssigned = useMutation({
    mutationFn: (
      {
        agencyMemberIds,
        subtaskId,
      }: {
        agencyMemberIds: string[];
        subtaskId: string;
      }
    ) => {
      return updateSubtaskAssigns(subtaskId, agencyMemberIds);
    },
    onSuccess: async () => {
      toast.success('Success', {
        description: 'Agency members in tasks were updated successfully!',
      });

      await queryClient.invalidateQueries({
        queryKey: ['subtask_assignations', 'all'],
      });

      await queryClient.invalidateQueries({
        queryKey: ['subtasks', 'all'],
      });
      await queryClient.invalidateQueries({
        queryKey: ['taks', 'all'],
      });
    },
    onError: () => {
      toast.error('Error', {
        description: 'The agency members could not be updated in subtask.',
      });
    },
  });

  return {
    createSubtask,
    updateSubtask,
    updateSubtaskIndex,
    changeAgencyMembersAssigned
  };
};
