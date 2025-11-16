import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Subtask } from '~/lib/tasks.types';
import {
  getAgencyClients,
  getOrderAgencyMembers,
} from '~/team-accounts/src/server/actions/orders/get/get-order';
import { createNewSubtask } from '~/team-accounts/src/server/actions/tasks/create/create-task';
import {
  updateSubtaskAssigns,
  updateSubtaskById,
  updateSubtaskFollower,
  updateSubtasksPositions,
} from '~/team-accounts/src/server/actions/tasks/update/update-task';

export const useSubtaskMutations = (
  orderId: string,
  orderAgencyId: string,
  userRole: string,
) => {
  const queryClient = useQueryClient();

  const { data: orderAgencyMembers } = useQuery({
    queryKey: ['order-agency-members', orderId],
    queryFn: () => getOrderAgencyMembers(orderAgencyId, Number(orderId)),
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    enabled:
      userRole === 'agency_owner' ||
      userRole === 'agency_member' ||
      userRole === 'agency_project_manager',
  });

  const { data: orderAgencyClientsFollowers } = useQuery({
    queryKey: ['order-agency-clients-followers', orderId],
    queryFn: () => getAgencyClients(orderAgencyId, Number(orderId)),
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    enabled:
      userRole === 'agency_owner' ||
      userRole === 'agency_member' ||
      userRole === 'agency_project_manager' ||
      userRole === 'client_owner', 
  });

  // Mutations
  const createSubtask = useMutation({
    mutationFn: ({ newSubtask }: { newSubtask: Omit<Subtask.Type, 'id'> }) =>
      createNewSubtask(newSubtask),

    onSuccess: async () => {
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
      await queryClient.invalidateQueries({
        queryKey: ['subtasks', 'all'],
      });
    },
    onError: () => {
      toast.error('Failed to update task name');
    },
  });

  const updateSubtaskIndex = useMutation({
    mutationFn: ({ subtasks }: { subtasks: Subtask.Type[] }) =>
      updateSubtasksPositions(subtasks),
    onSuccess: async () => {
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
    mutationFn: ({
      agencyMemberIds,
      subtaskId,
    }: {
      agencyMemberIds: string[];
      subtaskId: string;
    }) => {
      return updateSubtaskAssigns(subtaskId, agencyMemberIds).then(() => ({
        subtaskId,
      }));
    },
    onSuccess: async ({ subtaskId }: { subtaskId: string }) => {
      await queryClient.invalidateQueries({
        queryKey: ['subtask_assignations', subtaskId],
      });

      await queryClient.invalidateQueries({
        queryKey: ['order-agency-members', 'all'],
      });
    },
    onError: () => {
      toast.error('Error', {
        description: 'The agency members could not be updated in subtask.',
      });
    },
  });

  const changeAgencyMembersFollowers = useMutation({
    mutationFn: ({
      followers,
      subtaskId,
    }: {
      followers: string[];
      subtaskId: string;
    }) => {
      return updateSubtaskFollower(subtaskId, followers).then(() => ({
        subtaskId,
      }));
    },
    onSuccess: async ({ subtaskId }: { subtaskId: string }) => {
      await queryClient.invalidateQueries({
        queryKey: ['subtask_followers', subtaskId],
      });

      await queryClient.invalidateQueries({
        queryKey: ['order-agency-clients-followers', 'all'],
      });
    },
    onError: () => {
      toast.error('Error', {
        description: 'The clients followers could not be updated.',
      });
    },
  });

  return {
    createSubtask,
    updateSubtask,
    updateSubtaskIndex,
    changeAgencyMembersAssigned,
    changeAgencyMembersFollowers,

    // Query data
    orderAgencyMembers,
    orderAgencyClientsFollowers,
  };
};
