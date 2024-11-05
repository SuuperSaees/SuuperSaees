'use server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

import { AgencyStatus } from '../../../../../../../../apps/web/lib/agency-statuses.types';

export const updateStatusById = async (
  id: number,
  status: AgencyStatus.Update,
) => {
  try {
    const client = getSupabaseServerComponentClient();
    console.log(status);

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


export const updateStatusesPositions = async (statuses: AgencyStatus.Type[]) => {
  try {
    const updates = statuses.map((status, index) => ({
      id: status.id,
      position: index,
    }));
    const client = getSupabaseServerComponentClient();
    const { error: userError } = await client.auth.getUser();
    if (userError) throw new Error(userError.message);

    const { data: tasksData, error: taskDataError } = await client
      .from('agency_statuses')
      .upsert(updates, { onConflict: 'id' });

    if (taskDataError) throw new Error(taskDataError.message);

    return tasksData;
  } catch (error) {
    console.error('Error updating statuses:', error);
  }
};
