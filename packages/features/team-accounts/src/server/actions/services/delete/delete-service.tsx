'use client';

// Asegúrate de ajustar la importación según tu configuración
import { Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';



import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@kit/ui/alert-dialog';



import { ThemedButton } from '../../../../../../accounts/src/components/ui/button-themed-with-settings';
import { deleteService } from './delete-service-server';


const DeleteserviceDialog = ({ serviceId }: { serviceId: number }) => {
  const { t } = useTranslation('services');

  const handleDelete = async () => {
    try {
      await deleteService(Number(serviceId));

      toast('Success', {
        description: 'The service has been deleted!',
      });
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
            <ThemedButton className='w-fit'>

            <AlertDialogAction onClick={handleDelete} className='bg-transparent w-full hover:bg-transparent'>
              {t('delete')}
            </AlertDialogAction>
            </ThemedButton>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default DeleteserviceDialog;