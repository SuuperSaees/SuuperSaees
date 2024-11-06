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

const DeleteUserDialog = ({
  userId,
  queryKey,
  organizationId,
}: {
  userId: string;
  queryKey?: string;
  organizationId?: string;
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

  // Server version, when not querykey is present due
  // to the data was fetched directly from the server
  const handleDelete = async () => {
    try {
      const res = await deleteClient(userId, organizationId);
      await handleResponse(res, 'clients', t);
      
      router.refresh();
    } catch (error) {
      console.error('Error deleting client:', error);
    }
  };

  return (
    <>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Trash2 className="h-4 w-4 cursor-pointer text-gray-600" />
        </AlertDialogTrigger>
        <AlertDialogContent>
          <div className="flex">
            <Trash2 className="text-error-600 h-4 w-4" />
            <AlertDialogHeader>
              <AlertDialogTitle>Eliminar cliente</AlertDialogTitle>
              <AlertDialogDescription>
                ¿Está seguro de que desea eliminar este cliente?
              </AlertDialogDescription>
            </AlertDialogHeader>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={
                queryKey
                  ? async () => await deleteClientFn.mutateAsync(userId)
                  : handleDelete
              }
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default DeleteUserDialog;