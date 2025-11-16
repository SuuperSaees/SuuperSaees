'use server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';
import { CustomError, CustomResponse, CustomSuccess, ErrorTimerOperations } from '@kit/shared/response';
import { HttpStatus } from '../../../../../../../shared/src/response/http-status';
import { TimerUpdate } from '../../../../../../../../apps/web/lib/timer.types';
import { convertTimeStringToSeconds, formatTime, formatTimeInHours } from '../../../../../../../../apps/web/app/utils/format-time';

export async function updateActiveTimer(timerId: string, timer: TimerUpdate) {
  try {
    const client = getSupabaseServerComponentClient();

    const updateData: Partial<TimerUpdate> = {
      updated_at: new Date().toISOString(),
    };

    if (timer.start_time) updateData.start_time = timer.start_time;
    if (timer.start_time && timer.end_time) updateData.elapsed_time = convertTimeStringToSeconds(formatTime(formatTimeInHours(timer.start_time, timer.end_time)));
    if (timer.end_time) updateData.end_time = timer.end_time;
    if (timer.status) updateData.status = timer.status;
    if (timer.name) updateData.name = timer.name;
    if (timer.start_time && timer.end_time) updateData.timestamp = formatTime(formatTimeInHours(timer.start_time, timer.end_time));
    if (timer.deleted_on) updateData.deleted_on = new Date();

    // Update the active timer
    const { data, error } = await client
        .from('timers')
        .update(updateData)
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