'use server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';
import { Service } from '../../../../../../../../apps/web/lib/services.types';




export const getServiceById = async (serviceId: Service.Type['id']) => {
  try {
    const client = getSupabaseServerComponentClient();
    const { error: userError } = await client.auth.getUser();
    if (userError) throw userError.message;

    const { data: serviceData, error: orderError } = await client
      .from('services')
      .select("*")
      .eq('id', serviceId)
      .single();

    if (orderError) throw orderError.message;

    const proccesedData = {
      ...serviceData,
    };

    console.log('Servicio:', proccesedData)

    return proccesedData
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
};