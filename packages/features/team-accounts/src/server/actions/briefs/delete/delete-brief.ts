'use server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

export const deleteBrief = async (briefId: string) => {
  try {
    const client = getSupabaseServerComponentClient();
    const { error } = await client.from('briefs').delete().eq('id', briefId);

    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Error al eliminar el brief:', error);
  }
};
