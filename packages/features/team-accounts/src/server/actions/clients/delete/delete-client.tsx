'use client';

// Asegúrate de ajustar la importación según tu configuración
import { useRouter } from 'next/navigation';

import { Trash2 } from 'lucide-react';
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

import { deleteClient } from './delete-client-server';

const DeleteUserDialog = ({ userId }: { userId: string }) => {
  const router = useRouter();
  const handleDelete = async () => {
    try {
      await deleteClient(userId);

      toast('Success', {
        description: 'User deleted successfully',
      });
      router.refresh();
    } catch (error) {
      toast('Error', {
        description: 'Error deleting user',
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
              <AlertDialogTitle>Eliminar cliente</AlertDialogTitle>
              <AlertDialogDescription>
                ¿Está seguro de que desea eliminar este cliente?
              </AlertDialogDescription>
            </AlertDialogHeader>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default DeleteUserDialog;