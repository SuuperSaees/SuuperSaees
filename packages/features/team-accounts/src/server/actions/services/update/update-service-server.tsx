'use server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';
import { Service } from '../../../../../../../../apps/web/lib/services.types';

export const updateService = async (id: number, serviceData: Service.Update) => {
  console.log('serviceData', serviceData)
  try {
    const client = getSupabaseServerComponentClient();
    const { error } = await client
      .from('services')
      .update(serviceData)
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Error al crear el cliente:', error);
  }
};
