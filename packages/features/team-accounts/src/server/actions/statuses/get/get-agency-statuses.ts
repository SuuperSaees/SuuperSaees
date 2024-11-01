'use server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';


export const getAgencyStatuses = async (agency_id: string) => {
    try {
        const client = getSupabaseServerComponentClient();
        
        const { data: statusData, error: statusError } = await client
            .from('agency_statuses')
            .select('*')
            .eq('agency_id', agency_id)
        if (statusError) throw new Error(statusError.message);
        if(statusData){
          console.log(statusData)
        }
        return statusData;
    } catch (error) {
      console.error('Error getting statuses:', error)
    }
}