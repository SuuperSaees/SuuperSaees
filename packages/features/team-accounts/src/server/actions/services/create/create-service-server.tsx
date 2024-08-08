'use server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

// Define la función createClient
export const createService = async (clientData: {
  id?: string;
  created_at?: string;
  name: string;
  price: number;
  propietary_organization_id: string;
}) => {
  try {
    const client = getSupabaseServerComponentClient();
    const { error, data } = await client
      .from('services')
      .insert(clientData)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error('Error al crear el servicio:', error);
    throw error;
  }
};
