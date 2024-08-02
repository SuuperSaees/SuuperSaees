'use server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

export const deleteService = async (serviceId: string) => {
  try {
    const client = getSupabaseServerComponentClient();
    const { error } = await client
      .from('services')
      .delete()
      .eq('id', serviceId);

    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Error al eliminar el usuario:', error);
  }
};
