'use server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

export const updateService = async (serviceData: {
    id: string
    created_at: string
    name?: string 
    price?: number
    number_of_clients: number
    status?: string
    propietary_organization_id: string
}) => {
  console.log('serviceData', serviceData)
  try {
    const client = getSupabaseServerComponentClient();
    const { error } = await client
      .from('services')
      .update(serviceData)
      .eq('id', serviceData.id);

    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Error al crear el cliente:', error);
  }
};
