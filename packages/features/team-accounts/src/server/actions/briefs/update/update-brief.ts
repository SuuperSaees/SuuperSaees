'use server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

import { Brief } from '../../../../../../../../apps/web/lib/brief.types';

export const updateBrief = async (briefData: Brief.Type) => {
  // console.log('briefData', briefData);
  try {
    const client = getSupabaseServerComponentClient();
    const { error } = await client
      .from('briefs')
      .update(briefData)
      .eq('id', briefData.id);

    if (error) {
      console.error('Error al crear brief:', error);
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Error al crear el brief:', error);
  }
};
