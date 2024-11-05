'use server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

import { AgencyStatus } from '../../../../../../../../apps/web/lib/agency-statuses.types';

export const createNewStatus = async (status: AgencyStatus.Insert) => {
  try {
    const client = getSupabaseServerComponentClient();

    const { data: statusData, error: statusError } = await client
      .from('agency_statuses')
      .insert(status)
      .select()
      .single();
    if (statusError) throw new Error(statusError.message);

    return statusData;
  } catch (error) {
    console.error('Error creating status:', error);
  }
};
