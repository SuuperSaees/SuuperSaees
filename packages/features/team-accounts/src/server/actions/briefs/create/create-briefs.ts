'use server';

// import { revalidatePath } from 'next/cache';
import { Database } from '@kit/supabase/database';
import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

import { Brief } from '../../../../../../../../apps/web/lib/brief.types';

// Define la función createClient
export const createBrief = async (clientData: Brief.Type) => {
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

export const addServiceBriefs = async (
  serviceBriefs: Database['public']['Tables']['service_briefs']['Insert'][],
) => {
  try {
    const client = getSupabaseServerComponentClient();
    const { error: serviceBriefError } = await client
      .from('service_briefs')
      .insert(serviceBriefs)
      .select();

    if (serviceBriefError) {
      throw new Error(serviceBriefError.message);
    }

    // revalidatePath('/briefs');
  } catch (error) {
    console.error('Error al crear el servicio:', error);
  }
};
