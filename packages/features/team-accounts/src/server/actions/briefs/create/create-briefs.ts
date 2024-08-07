'use server';

// import { revalidatePath } from 'next/cache';
import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

import { Brief } from '../../../../components/briefs/briefs-table';

// Define la función createClient
export const createBrief = async (clientData: Brief) => {
  try {
    const client = getSupabaseServerComponentClient();
    const { error } = await client.from('briefs').insert(clientData);
    if (error) {
      throw new Error(error.message);
    }
    // revalidatePath('/briefs');
  } catch (error) {
    console.error('Error al crear el servicio:', error);
  }
};
