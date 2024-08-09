'use server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';
import { redirect } from 'next/navigation';

// Define la función createClient
export const createClient = async (clientData: {
    id?: string
    created_at?: string
    name: string
    picture_url: string
    client_organization: string
    email: string
    role: string
    propietary_organization: string
    propietary_organization_id: string
}) => {
  try {
    const client = getSupabaseServerComponentClient();
    const { error } = await client
      .from('clients')
      .insert(clientData);

    if (error) {
      throw new Error(error.message);
    }
    redirect('/home');
  } catch (error) {
    console.error('Error al crear el cliente:', error);
  }
};
