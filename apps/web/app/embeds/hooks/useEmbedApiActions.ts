import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Embeds } from '~/lib/embeds.types';
import {
  createEmbed,
  deleteEmbed,
  updateEmbed,
} from '~/server/actions/embeds/embeds.action';
import { FormValues } from '../schema';

interface UseEmbedApiActionsProps {
  agencyId: string;
  userId: string;
  activeEmbedId: string;
  onCreateSuccess?: (newEmbed: Embeds.Type) => void;
  onDeleteSuccess?: () => void;
}

export function useEmbedApiActions({
  agencyId,
  userId,
  activeEmbedId,
  onCreateSuccess,
  onDeleteSuccess,
}: UseEmbedApiActionsProps) {
  const queryClient = useQueryClient();
  const host = typeof window !== 'undefined' ? window.location.hostname : '';

  // Create mutation
  const createMutation = useMutation<Embeds.Type, Error, FormValues>({
    mutationFn: (values: FormValues) => {
      const { embed_accounts, ...embedData } = values;
      const embed = {
        ...embedData,
        organization_id: agencyId,
        user_id: userId,
      };
      return createEmbed(embed, embed_accounts, host);
    },
    onSuccess: async (newEmbed) => {
      toast.success('Integration created successfully');
      await queryClient.invalidateQueries({ queryKey: ['embeds'] });
      onCreateSuccess?.(newEmbed);
    },
    onError: (error: Error) => {
      toast.error('Failed to create integration: ' + error.message);
    },
  });

  // Update mutation
  const updateMutation = useMutation<
    Embeds.Type,
    Error,
    { id: string; values: FormValues; isAccountRemoval?: boolean }
  >({
    mutationFn: ({ id, values }) => {
      const { embed_accounts: _embed_accounts, ...embedData } = values;
      const embed = {
        ...embedData,
      };
      return updateEmbed(id, embed, _embed_accounts, host);
    },
    onMutate: ({ isAccountRemoval }) => {
      // Show loading toast when mutation starts
      if (isAccountRemoval) {
        return toast.loading('Removing account from integration...');
      }
      return toast.loading('Updating integration...');
    },
    onSuccess: (_, { isAccountRemoval }, toastId) => {
      // Dismiss loading toast and show success
      toast.dismiss(toastId as string | number);
      
      if (isAccountRemoval) {
        toast.success('Account removed from integration successfully');
      } else {
        toast.success('Integration updated successfully');
      }
      
      void queryClient.invalidateQueries({ queryKey: ['embeds'] });
    },
    onError: (error, { isAccountRemoval }, toastId) => {
      // Dismiss loading toast and show error
      toast.dismiss(toastId as string | number);
      
      if (isAccountRemoval) {
        toast.error('Failed to remove account: ' + error.message);
      } else {
        toast.error('Failed to update integration: ' + error.message);
      }
    }
  });

  // Delete mutation
  const deleteMutation = useMutation<void, Error, string>({
    mutationFn: (id: string) => deleteEmbed(id),
    onMutate: () => {
      // Show loading toast when mutation starts
      return toast.loading('Deleting integration...');
    },
    onSuccess: (_, __, toastId) => {
      // Dismiss loading toast and show success
      toast.dismiss(toastId as string | number);
      toast.success('Integration deleted successfully');
      
      // Invalidate queries to refresh the data
      void queryClient.invalidateQueries({ queryKey: ['embeds'] }).then(() => {
        // After data is refreshed, call the success callback
        onDeleteSuccess?.();
      });
    },
    onError: (error, _, toastId) => {
      // Dismiss loading toast and show error
      toast.dismiss(toastId as string | number);
      toast.error('Failed to delete integration: ' + error.message);
    }
  });

  // Handler functions
  const handleEmbedCreation = useCallback(
    async (values: FormValues) => {
      try {
        await createMutation.mutateAsync(values);
      } catch (error) {
        // Error is handled by the mutation's onError
        console.error('Failed to create embed:', error);
      }
    },
    [createMutation],
  );

  const handleEmbedUpdate = useCallback(
    async (values: FormValues, options?: { isAccountRemoval?: boolean }) => {
      if (activeEmbedId === 'new') return;
      try {
        await updateMutation.mutateAsync({ 
          id: activeEmbedId, 
          values,
          isAccountRemoval: options?.isAccountRemoval 
        });
      } catch (error) {
        // Error is handled by the mutation's onError
        console.error('Failed to update embed:', error);
      }
    },
    [activeEmbedId, updateMutation],
  );

  const handleEmbedDelete = useCallback(
    (id: string) => {
      deleteMutation.mutate(id);
    },
    [deleteMutation],
  );

  return {
    createMutation,
    updateMutation,
    deleteMutation,
    handleEmbedCreation,
    handleEmbedUpdate,
    handleEmbedDelete,
  };
} 