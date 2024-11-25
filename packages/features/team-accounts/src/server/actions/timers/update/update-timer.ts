'use server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';
import { CustomError, CustomResponse, CustomSuccess, ErrorTimerOperations } from '@kit/shared/response';
import { HttpStatus } from '../../../../../../../shared/src/response/http-status';
import { TimerUpdate } from '../../../../../../../../apps/web/lib/timer.types';
import { formatElapsedTime } from '../../../../../../../../apps/web/app/utils/format-time';

export async function updateActiveTimer(timerId: string, timer: TimerUpdate) {
  try {
    const client = getSupabaseServerComponentClient();

    // Update the active timer
    const { data, error } = await client
        .from('timers')
        .update({
            start_time: timer.start_time,
            elapsed_time: timer.elapsed_time,
            end_time: timer.end_time,
            status: timer.status,
            name: timer.name,
            updated_at: new Date().toISOString(),
            timestamp: formatElapsedTime(timer.elapsed_time ? timer.elapsed_time : 0),
        })
        .eq('id', timerId)
        .select()
        .single();

    if (error) {
      throw new CustomError(
        HttpStatus.Error.InternalServerError,
        error.message,
        ErrorTimerOperations.FAILED_TO_UPDATE_TIMER
      );
    }

    return new CustomSuccess(
      HttpStatus.Success.OK,
      'upsertActiveTimer',
      'Timer updated successfully',
      undefined,
      data,
    ).toJSON();

  } catch (error) {
    console.error('Error updating active timer:', error);
    return CustomResponse.error(error).toJSON();
  }
}