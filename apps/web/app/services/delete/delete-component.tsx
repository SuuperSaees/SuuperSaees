'use client';

// Asegúrate de ajustar la importación según tu configuración
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';
import { ThemedButton } from 'node_modules/@kit/accounts/src/components/ui/button-themed-with-settings';
import { useTranslation } from 'react-i18next';

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

import { handleResponse } from '~/lib/response/handle-response';

import { deleteService } from '../../../../../packages/features/team-accounts/src/server/actions/services/delete/delete-service-server';

const DeleteServiceDialog = ({ serviceId }: { serviceId: number }) => {
  const { t } = useTranslation(['services', 'responses']);

  const queryClient = useQueryClient();

  const handleDelete = useMutation({
    mutationFn: async () => {
      const res = await deleteService(serviceId);
      await handleResponse(res, 'services', t);
    },
    onSuccess: async () => {
      // invalidate the query
      await queryClient.invalidateQueries({
        queryKey: ['services'],
      });
    },
    onError: () => {
      console.error('Error deleting service');
    },
  });

  return (
    <>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Trash2 className="h-4 w-4 cursor-pointer text-gray-600" />
        </AlertDialogTrigger>
        <AlertDialogContent>
          <div className="flex">
            <Trash2 className="h-4 w-4 text-error-600" />
            <AlertDialogHeader>
              <AlertDialogTitle>{t('deleteService')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('deleteServiceDescription')}
              </AlertDialogDescription>
            </AlertDialogHeader>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <ThemedButton className="w-fit">
              <AlertDialogAction
                onClick={() => handleDelete.mutateAsync()}
                className="w-full bg-transparent hover:bg-transparent"
              >
                {t('delete')}
              </AlertDialogAction>
            </ThemedButton>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default DeleteServiceDialog;
