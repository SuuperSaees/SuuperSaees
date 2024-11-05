'use client';

// Asegúrate de ajustar la importación según tu configuración
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';
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

import { deleteBrief } from './delete-brief';
import { handleResponse } from '../../../../../../../../apps/web/lib/response/handle-response';

const DeleteBriefDialog = ({ briefId }: { briefId: string }) => {
  const { t } = useTranslation(['briefs', 'responses']);
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await deleteBrief(briefId);
      await handleResponse(res, 'briefs', t);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['briefs'],
      });
    },
    onError: () => {
      console.error('Error deleting brief');
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
            <Trash2 className="text-error-600 h-4 w-4" />
            <AlertDialogHeader>
              <AlertDialogTitle>{t('deleteBrief')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('deleteDescription')}
              </AlertDialogDescription>
            </AlertDialogHeader>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => await deleteMutation.mutateAsync()}
            >
              {t('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default DeleteBriefDialog;
