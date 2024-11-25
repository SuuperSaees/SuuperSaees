'use server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';
import { CustomError, CustomResponse, CustomSuccess } from '@kit/shared/response';
import { HttpStatus } from '../../../../../../../shared/src/response/http-status';

export async function createTimer(timer: {
  elementId: string;
  elementType: string;
  elementName: string;
  startTime: number;
  elapsedTime: number;
}) {
  try {
    const client = getSupabaseServerComponentClient();
    const { data: { user }, error: userError } = await client.auth.getUser();
    
    if (userError) {
      throw new CustomError(
        HttpStatus.Error.Unauthorized,
        'User not authenticated',
        'createTimer'
      );
    }

    // Create the timer
    const { data: timerData, error: timerError } = await client
      .from('timers')
      .insert({
        user_id: user?.id ?? '',
        start_time: timer.startTime,
        elapsed_time: timer.elapsedTime,
        name: timer.elementName,
        status: 'active'
      })
      .select('id')
      .single();

    if (timerError) {
      throw new CustomError(
        HttpStatus.Error.InternalServerError,
        timerError.message,
        'createTimer'
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
          'createTimerRelation'
        );
      }
    }

    return new CustomSuccess(
      HttpStatus.Success.Created,
      'createTimer',
      'Timer created successfully',
      undefined,
      timerData
    ).toJSON();

  } catch (error) {
    console.error('Error creating timer:', error);
    return CustomResponse.error(error).toJSON();
  }
}
