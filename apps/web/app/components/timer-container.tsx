'use client';

import { Timer } from './timer';
import { TimerUpdate } from '~/lib/timer.types';
import { updateActiveTimer } from '~/team-accounts/src/server/actions/timers/update/update-timer';
import { useQueryClient } from '@tanstack/react-query';

export function TimerContainer({className}: {className?: string}) {
  const queryClient = useQueryClient();

  const handleUpdate = async (timerId: string, timer: TimerUpdate) => {
    await updateActiveTimer(timerId, timer);

    queryClient.invalidateQueries({
      queryKey: ['subtask_timers', timer.elementId]
    });
  };

  return <Timer onUpdate={handleUpdate} className={className} />;
}