'use server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

import { AgencyStatus } from '../../../../../../../../apps/web/lib/agency-statuses.types';

export const createNewStatus = async (status: AgencyStatus.Insert) => {
  try {
    const client = getSupabaseServerComponentClient();

    const { data: existingPositions, error: positionsError } = await client
      .from('agency_statuses')
      .select('position')
      .eq('agency_id', status.agency_id ?? '')
      .order('position');
		
		if (positionsError) throw positionsError

		// Find the next available position
    let nextPosition = 0
    if (existingPositions && existingPositions.length > 0) {
      const positions = existingPositions.map(p => p.position)
      while (positions.includes(nextPosition)) {
        nextPosition++
      }
    }

    const { data: newStatus, error: insertError } = await client
      .from('agency_statuses')
      .insert({ ...status, position: nextPosition })
      .select()
      .single()

    if (insertError) throw new Error(insertError.message);

    return newStatus;
		
  } catch (error) {
    console.error('Error creating status:', error);
  }
};
