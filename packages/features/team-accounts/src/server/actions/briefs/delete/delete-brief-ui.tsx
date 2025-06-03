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

import Tooltip from '../../../../../../../../apps/web/components/ui/tooltip';
import { handleResponse } from '../../../../../../../../apps/web/lib/response/handle-response';
import { deleteBrief } from './delete-brief';

const DeleteBriefDialog = ({ briefId }: { briefId: string }) => {
  const { t } = useTranslation(['briefs', 'responses']);
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await deleteBrief(briefId);
      await handleResponse(res, 'briefs', t);
    },
    onSuccess: async () => {
      // Mark all briefs queries as invalidated
      await queryClient.invalidateQueries({
        queryKey: ['briefs'],
        exact: false,
      });
    },
    onError: () => {
      console.error('Error deleting brief');
    },
  });

  return (
    <AlertDialog>
      <AlertDialogTrigger >
        <Tooltip content={t('briefs:eliminateBrief')}>
          <Trash2 className=" h-8 w-8 cursor-pointer rounded-md p-2 text-gray-600 hover:bg-accent" />
        </Tooltip>
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
  );
};

export default DeleteBriefDialog;
