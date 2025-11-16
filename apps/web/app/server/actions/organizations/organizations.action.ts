'use server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

export async function getOrganizationById(id: string, adminActived= false) {
  const client = getSupabaseServerComponentClient({
    admin: adminActived
  });
  const { data, error } = await client.from('organizations').select('*').eq('id', id).single();
  if (error) throw new Error(`Error getting organization by id: ${error.message}`);
  return data;
}