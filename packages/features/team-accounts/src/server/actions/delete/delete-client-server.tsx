'use server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';
import { redirect } from 'next/navigation';

// Define la función handleDelete
export const deleteClient = async (userId: string) => {
  try {
    const client = getSupabaseServerComponentClient();
    console.log('userId', userId);
    const { error } = await client
      .from('clients') // Asegúrate de que el nombre de la tabla sea correcto
      .delete()
      .eq('id', userId);

    if (error) {
      throw new Error(error.message);
    }
    redirect('/home');
  } catch (error) {
    console.error('Error al eliminar el usuario:', error);
  }
};
