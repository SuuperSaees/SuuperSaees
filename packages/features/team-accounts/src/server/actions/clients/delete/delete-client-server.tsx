'use server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

// Define la función handleDelete
export const deleteClient = async (userId: string) => {
  try {
    const client = getSupabaseServerComponentClient();
    const { error } = await client
      .from('clients') // Asegúrate de que el nombre de la tabla sea correcto
      .delete()
      .eq('user_client_id', userId);

    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Error al eliminar el usuario:', error);
    throw error;
  }
};