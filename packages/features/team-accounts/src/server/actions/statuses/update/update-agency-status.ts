'use server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

import { AgencyStatus } from '../../../../../../../../apps/web/lib/agency-statuses.types';

export const updateStatusById = async (
  id: number,
  status: AgencyStatus.Update,
) => {
  try {
    const client = getSupabaseServerComponentClient();

    const { data: statusData, error: statusError } = await client
      .from('agency_statuses')
      .update(status)
      .eq('id', id)
      .select()
      .single();
    if (statusError) throw new Error(statusError.message);

    return statusData;
  } catch (error) {
    console.error('Error updating status:', error);
  }
};
