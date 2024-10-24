'use client';

// Asegúrate de ajustar la importación según tu configuración
import { Trash2 } from 'lucide-react';
import { ThemedButton } from 'node_modules/@kit/accounts/src/components/ui/button-themed-with-settings';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

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

import { deleteService } from '../../../../../packages/features/team-accounts/src/server/actions/services/delete/delete-service-server';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const DeleteServiceDialog = ({ priceId }: { priceId: string }) => {
  const { t } = useTranslation('services');
  
  const queryClient = useQueryClient();

  const handleDelete = useMutation({
    mutationFn: async () => {
      await deleteService(priceId);
      
    },
    onSuccess: async () => {
      toast.success('Success', {
        description: 'The service has been deleted!',
      });
      // invalidate the query
      await queryClient.invalidateQueries({
        queryKey: ['services'],
      });
    },
    onError: () => {
      toast.error('Error', {
        description: 'The service could not be deleted',
      });
    },
  })

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
                onClick={()=> handleDelete.mutateAsync()}
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
