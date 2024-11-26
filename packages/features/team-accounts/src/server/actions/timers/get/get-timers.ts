'use server';

import { CustomError, ErrorTimerOperations } from '@kit/shared/response';
import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';
import { HttpStatus } from '../../../../../../../shared/src/response/http-status';


export const getTimersBySubtaskId = async (subtaskId: string) => {
  try {
    const client = getSupabaseServerComponentClient();
    const { data: { user }, error: userError } = await client.auth.getUser();

    if (userError) {
      throw new CustomError(
        HttpStatus.Error.Unauthorized,
        'User not authenticated',
        ErrorTimerOperations.INSUFFICIENT_PERMISSIONS
      );
    }

    const { data: timersData, error: timersDataError } = await client
      .from('subtask_timers')
      .select(`*, timers(*, accounts(*))`)
      .eq('subtask_id', subtaskId);

    if (timersDataError) {
      throw new CustomError(
        HttpStatus.Error.InternalServerError,
        timersDataError.message,
        ErrorTimerOperations.FAILED_TO_GET_TIMERS
      );
    }

    return timersData;

  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    
    throw new CustomError(
      HttpStatus.Error.InternalServerError,
      'Failed to get timers',
      ErrorTimerOperations.FAILED_TO_GET_TIMERS
    );
  }
};