'use server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';
import { redirect } from 'next/navigation';

// Define la función createClient
export const createService = async (clientData: {
    id?: string
    created_at?: string
    name: string
    price: number
    propietary_organization_id: string
}) => {
  try {
    const client = getSupabaseServerComponentClient();
    const { error } = await client
      .from('services')
      .insert(clientData);
    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Error al crear el servicio:', error);
  }
};
