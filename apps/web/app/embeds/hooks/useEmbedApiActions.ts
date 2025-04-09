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
import { useTranslation } from 'react-i18next';

interface UseEmbedApiActionsProps {
  agencyId: string;
  userId: string;
  activeEmbedId: string;
  onCreateSuccess?: (newEmbed: Embeds.Type) => void;
  onDeleteSuccess?: () => void;
  queryKey?: string[];
}

export function useEmbedApiActions({
  agencyId,
  userId,
  activeEmbedId,
  onCreateSuccess,
  onDeleteSuccess,
  queryKey = ['embeds'],
}: UseEmbedApiActionsProps) {
  const queryClient = useQueryClient();
  const host = typeof window !== 'undefined' ? window.location.hostname : '';
  const { t } = useTranslation();
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
      toast.success(t('responses:success.embeds.embedCreated'));
      await queryClient.invalidateQueries({ queryKey });
      onCreateSuccess?.(newEmbed);
    },
    onError: () => {
      toast.error(t('responses:error.embeds.invalidEmbed'));
    },
  });

  // Update mutation
  const updateMutation = useMutation<
    Embeds.Type,
    Error,
    { id: string; values: FormValues; isAccountRemoval?: boolean }
  >({
    mutationFn: ({ id, values }) => {
      const { embed_accounts, ...embedData } = values;
      const embed = {
        ...embedData,
      };
      return updateEmbed(id, embed, embed_accounts, host);
    },
    onMutate: ({ isAccountRemoval }) => {
      // Show loading toast when mutation starts
      if (isAccountRemoval) {
        return toast.loading(t('responses:embeds.removingAccountFromEmbed'));
      }
      return toast.loading(t('responses:embeds.updatingEmbed'));
    },
    onSuccess: (_, { isAccountRemoval }, toastId) => {
      // Dismiss loading toast and show success
      toast.dismiss(toastId as string | number);
      
      if (isAccountRemoval) {
        toast.success(t('responses:embeds.accountRemovedFromEmbed'));
      } else {
        toast.success(t('responses:embeds.embedUpdated'));
      }
      
      void queryClient.invalidateQueries({ queryKey });
    },
    onError: (error, { isAccountRemoval }, toastId) => {
      // Dismiss loading toast and show error
      toast.dismiss(toastId as string | number);
      
      if (isAccountRemoval) {
        toast.error(t('responses:embeds.failedToRemoveAccount'));
      } else {
        toast.error(t('responses:embeds.failedToUpdateEmbed'));
      }
    }
  });

  // Delete mutation
  const deleteMutation = useMutation<void, Error, string>({
    mutationFn: (id: string) => deleteEmbed(id),
    onMutate: () => {
      // Show loading toast when mutation starts
      return toast.loading(t('responses:embeds.deletingEmbed'));
    },
    onSuccess: (_, __, toastId) => {
      // Dismiss loading toast and show success
      toast.dismiss(toastId as string | number);
      toast.success(t('responses:embeds.embedDeleted'));
      
      // Invalidate queries to refresh the data
      void queryClient.invalidateQueries({ queryKey }).then(() => {
        // After data is refreshed, call the success callback
        onDeleteSuccess?.();
      });
    },
    onError: (error, _, toastId) => {
      // Dismiss loading toast and show error
      toast.dismiss(toastId as string | number);
      toast.error(t('responses:embeds.failedToDeleteEmbed'));
    }
  });

  // Handler functions
  const handleEmbedCreation = useCallback(
    async (values: FormValues) => {
      try {
        await createMutation.mutateAsync(values);
      } catch (error) {
        // Error is handled by the mutation's onError
        console.error(t('responses:error.embeds.invalidEmbed'));
      }
    },
    [createMutation, t],
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
        console.error(t('responses:error.embeds.failedToUpdateEmbed'));
      }
    },
    [activeEmbedId, updateMutation, t],
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