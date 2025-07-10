'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';
import { ThemedButton } from 'node_modules/@kit/accounts/src/components/ui/button-themed-with-settings';
import { useTranslation } from 'react-i18next';
import React from 'react';

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
import Tooltip from '~/components/ui/tooltip';
import { deleteService } from '~/team-accounts/src/server/actions/services/delete/delete-service-server';

interface DeleteServiceDialogProps {
  serviceId: number;
  triggerComponent?: React.ReactNode;
}

const DeleteServiceDialog = ({ serviceId, triggerComponent }: DeleteServiceDialogProps) => {
  const { t } = useTranslation(['services', 'responses']);

  const queryClient = useQueryClient();

  const handleDelete = useMutation({
    mutationFn: async () => {
      const res = await deleteService(serviceId);
      await handleResponse(res, 'services', t);
    },
    onSuccess: async () => {
      // Mark all services queries as invalidated
      await queryClient.invalidateQueries({
        queryKey: ['services'],
        exact: false,
      });
    },
    onError: () => {
      console.error('Error deleting service');
    },
  });

  // Custom trigger component wrapped with proper event handling
  const CustomTrigger = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
  >((props, ref) => {
    if (!triggerComponent) return null;
    
    return (
      <div ref={ref} {...props}>
        {triggerComponent}
      </div>
    );
  });

  CustomTrigger.displayName = 'CustomTrigger';

  return (
    <>
      <AlertDialog>
        <AlertDialogTrigger asChild={!!triggerComponent}>
          {triggerComponent ? (
            <CustomTrigger />
          ) : (
            <Tooltip content={t('services:eliminate')}>
              <Trash2 className="h-8 w-8 cursor-pointer text-gray-600 rounded-md p-2 hover:bg-accent" />
            </Tooltip>
          )}
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
