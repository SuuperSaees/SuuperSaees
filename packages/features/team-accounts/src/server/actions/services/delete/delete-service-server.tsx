'use server';

import { revalidatePath } from 'next/cache';



import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

export const deleteService = async (serviceId: number) => {
  try {
    const client = getSupabaseServerComponentClient();
    const { error } = await client
      .from('services')
      .delete()
      .eq('id', serviceId);

    if (error) {
      throw new Error(error.message);
    }
    revalidatePath('/services');
  } catch (error) {
    console.error('Error al eliminar el usuario:', error);
    throw error;
  }
};