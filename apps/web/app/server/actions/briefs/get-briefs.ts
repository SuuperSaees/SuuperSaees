'use server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';
import { cache } from 'react';

import { BriefResponse } from '~/lib/brief.types';

export const getBriefResponses = cache(async (
  orderUUID: string,
): Promise<BriefResponse.Response[]> => {
  try {
    const client = getSupabaseServerComponentClient();
    const { data, error } = await client
      .from('brief_responses')
      .select(
        'id, response, created_at, field:form_fields(*), brief:briefs(id, name)',
      )
      .eq('order_id', orderUUID);
    if (error)
      throw new Error(`Error fetching brief responses: ${error.message}`);
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
});
