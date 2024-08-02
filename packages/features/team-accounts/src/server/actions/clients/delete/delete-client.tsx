'use client';

import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@kit/ui/alert-dialog'; // Asegúrate de ajustar la importación según tu configuración
import { Trash2 } from 'lucide-react';
import { deleteClient } from './delete-client-server';

const DeleteUserDialog = ({ userId }: { userId: string }) => {

  const handleDelete = async () => {
    try {
      await deleteClient(userId);
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
          <Trash2 className="h-4 w-4 text-gray-600" />
        </AlertDialogTrigger>
        <AlertDialogContent>
          <div className='flex '>
          <Trash2 className="h-4 w-4 text-error-600 " />
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar cliente</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Está seguro de que desea eliminar este cliente?
            </AlertDialogDescription>
          </AlertDialogHeader>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default DeleteUserDialog;
