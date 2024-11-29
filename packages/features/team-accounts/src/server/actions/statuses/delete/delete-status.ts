'use server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';


export const deleteStatusById = async (
    status_id: number,
) => {
    try {
        const client = getSupabaseServerComponentClient();
        
        const { data: statusData, error: statusError } = await client
          .from('agency_statuses')
          .update({ deleted_on: new Date().toISOString() })
          .eq('id', status_id);
        if (statusError) throw new Error(statusError.message);

        return statusData;
    } catch (error) {
      console.error('Error deleting status:', error)
    }
}