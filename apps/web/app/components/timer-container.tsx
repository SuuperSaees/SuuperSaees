'use client';

import { Timer } from './timer';
import { TimerUpdate } from '~/lib/timer.types';
import { updateActiveTimer } from '~/team-accounts/src/server/actions/timers/update/update-timer';

export function TimerContainer() {
  const handleUpdate = async (timerId: string, timer: TimerUpdate) => {
    await updateActiveTimer(timerId, timer);
  };

  return <Timer onUpdate={handleUpdate} />;
}