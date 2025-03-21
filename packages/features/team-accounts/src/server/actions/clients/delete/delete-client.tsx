'use client';

// Asegúrate de ajustar la importación según tu configuración
import { useRouter } from 'next/navigation';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@kit/ui/alert-dialog';

import { deleteClient } from './delete-client-server';
import { handleResponse } from '../../../../../../../../apps/web/lib/response/handle-response';
import { useTranslation } from 'react-i18next';
import { Trans } from '@kit/ui/trans';
import { partialDeleteUserAccount } from '../../members/update/update-account';

const DeleteUserDialog = ({
  userId,
  queryKey,
  organizationId,
  showLabel = false,
  inTeamMembers = false,
  withText = false
}: {
  userId: string;
  queryKey?: string;
  organizationId?: string;
  showLabel?: boolean;
  inTeamMembers?: boolean;
  withText?: boolean;
}) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { t } = useTranslation('responses');

  // Client version
  const deleteClientFn = useMutation({
    mutationFn: async (userId: string) => await deleteClient(userId, organizationId),
    onSuccess: async () => {
      const res = await deleteClient(userId, organizationId);
      await handleResponse(res, 'clients', t);

      await queryClient.invalidateQueries({
        queryKey: [queryKey ?? 'clients'],
      });
    },
    onError: () => null,
  });

  const deleteTeamMember = useMutation({
    mutationFn: async (userId: string) => await partialDeleteUserAccount(userId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [queryKey ?? 'clients'],
      });
    },
    onError: () => null,
  });

  const handleClick = async () => {
    if (!queryKey) {
      // Server version
      try {
        if (inTeamMembers) {
          const res = await partialDeleteUserAccount(userId);
          await handleResponse(res, 'clients', t);
        } else {
          const res = await deleteClient(userId, organizationId);
          await handleResponse(res, 'clients', t);
        }
        router.refresh();
      } catch (error) {
        console.error('Error deleting user:', error);
      }
      return;
    }

    // Client version
    if (inTeamMembers) {
      await deleteTeamMember.mutateAsync(userId);
    } else {
      await deleteClientFn.mutateAsync(userId);
    }
  };

  return (
    <>
      <AlertDialog>
        <AlertDialogTrigger asChild className={`${showLabel ? 'w-full' : ''}`}>
          <div className='flex gap-2 items-center text-gray-600'>
            <Trash2 className="h-4 w-4 cursor-pointer" />
            {
              showLabel && 
              <p>
                {inTeamMembers ? <Trans i18nKey={'clients:deletion:titleInTeamMembers'} /> : <Trans i18nKey={'clients:deletion:title'} />}
              </p>
            }
            {withText && <Trans i18nKey={'clients:organizations.deleteOrganization'} />}
          </div>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <div className="flex">
            <AlertDialogHeader>
              <AlertDialogTitle>
                {inTeamMembers ? <Trans i18nKey={'clients:deletion:titleInTeamMembers'} /> : <Trans i18nKey={'clients:deletion:title'} />}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {inTeamMembers ? <Trans i18nKey={'clients:deletion:descriptionInTeamMembers'} /> : <Trans i18nKey={'clients:deletion:description'} />}
              </AlertDialogDescription>
            </AlertDialogHeader>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel><Trans i18nKey={'clients:deletion:cancel'} /></AlertDialogCancel>
            <AlertDialogAction onClick={handleClick}>
              <Trans i18nKey={'clients:deletion:delete'} />
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default DeleteUserDialog;