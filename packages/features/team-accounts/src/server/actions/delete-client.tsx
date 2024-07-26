'use client';

import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@kit/ui/alert-dialog'; // Asegúrate de ajustar la importación según tu configuración
import { Trash2 } from 'lucide-react';
import { deleteClient } from './delete-client-server';
import { Button } from '@kit/ui/button';
import { redirect } from 'next/navigation';


const DeleteUserDialog = ({ userId }: { userId: string }) => {

  const handleDelete = async () => {
    try {
      await deleteClient(userId);

      alert('Usuario eliminado correctamente, refresca la página para ver los cambios');;
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
            <AlertDialogTitle>Eliminar cliente</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Está seguro de que desea eliminar este cliente?
            </AlertDialogDescription>
          </AlertDialogHeader>

          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            {/* <Button onClick={handleDelete} variant="destructive">Eliminar</Button> */}
            <AlertDialogAction onClick={handleDelete}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default DeleteUserDialog;
