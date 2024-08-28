'use client';

import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@kit/ui/alert-dialog'; // Asegúrate de ajustar la importación según tu configuración
import { Trash2 } from 'lucide-react';
import { deleteService } from './delete-service-server';
import { useTranslation } from 'react-i18next';

const DeleteserviceDialog = ({ serviceId }: { serviceId: number }) => {
  const { t } = useTranslation('services');

  const handleDelete = async () => {
    try {
      await deleteService(serviceId);
      window.location.reload();
    } catch (error) {
      console.error('Error al eliminar el usuario:', error);
      alert('Error al eliminar el usuario');
    }
  };

  return (
    <>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Trash2 className="h-4 w-4 text-gray-600 cursor-pointer" />
        </AlertDialogTrigger>
        <AlertDialogContent>
          <div className='flex '>
          <Trash2 className="h-4 w-4 text-error-600 " />
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteService")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteServiceDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>{t("delete")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default DeleteserviceDialog;
