'use client';

// Asegúrate de ajustar la importación según tu configuración
import { Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@kit/ui/alert-dialog';
import { deleteService } from 'node_modules/@kit/team-accounts/src/server/actions/services/delete/delete-service-server';
import { useServicesContext } from '../contexts/services-context';

const DeleteServiceDialog = ({ priceId }: { priceId: string }) => {
  const { t } = useTranslation('services');
  const { updateServices } = useServicesContext();

  const handleDelete = async () => {
    try {
      await deleteService(priceId);

      toast('Success', {
        description: 'The service has been deleted!',
      });
      await updateServices(false);

    } catch (error) {
      toast('Error', {
        description: 'The service could not be deleted',
      });
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
              <AlertDialogTitle>{t('deleteService')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('deleteServiceDescription')}
              </AlertDialogDescription>
            </AlertDialogHeader>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              {t('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default DeleteServiceDialog;