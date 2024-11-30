'use server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';
import { CustomError, CustomResponse, CustomSuccess } from '@kit/shared/response';
import { HttpStatus } from '../../../../../../../shared/src/response/http-status';
import { ErrorTimerOperations } from '@kit/shared/response';
import { Timer } from '../../../../../../../../apps/web/lib/timer.types';
import { convertTimeStringToSeconds } from '../../../../../../../../apps/web/app/utils/format-time';

export async function createTimer(timer: Timer) {
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

    // Create the timer
    const { data: timerData, error: timerError } = await client
      .from('timers')
      .insert({
        user_id: user?.id ?? '',
        start_time: timer.startTime,
        elapsed_time: timer.timestamp ? convertTimeStringToSeconds(timer.timestamp) : timer.elapsedTime,
        name: timer.elementName,
        end_time: timer.endTime ? timer.endTime : null,
        status: timer.timestamp ?  'finished' : 'active',
        timestamp: timer.timestamp ? timer.timestamp : '00:00',
      })
      .select('id')
      .single();

    if (timerError) {
      throw new CustomError(
        HttpStatus.Error.InternalServerError,
        timerError.message,
        ErrorTimerOperations.FAILED_TO_CREATE_TIMER
      );
    }

    // Create the relationship if it's a subtask
    if (timer.elementType === 'subtask') {
      const { error: relationError } = await client
        .from('subtask_timers')
        .insert({
          subtask_id: timer.elementId,
          timer_id: timerData.id
        });

      if (relationError) {
        throw new CustomError(
          HttpStatus.Error.InternalServerError,
          relationError.message,
          ErrorTimerOperations.FAILED_TO_CREATE_TIMER
        );
      }
    }

    return new CustomSuccess(
      HttpStatus.Success.Created,
      ErrorTimerOperations.TIMER_CREATED,
      'Timer created successfully',
      undefined,
      timerData
    ).toJSON();

  } catch (error) {
    console.error('Error creating timer:', error);
    return CustomResponse.error(error).toJSON();
  }
}
