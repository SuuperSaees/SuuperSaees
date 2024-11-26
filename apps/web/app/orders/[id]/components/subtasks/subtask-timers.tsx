'use client';

import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import { Spinner } from '@kit/ui/spinner';
import AvatarDisplayer from '../ui/avatar-displayer';
import { isValidName } from '../../utils/is-valid-name';
import deduceNameFromEmail from '../../utils/deduce-name-from-email';
import { getTimersBySubtaskId } from '~/team-accounts/src/server/actions/timers/get/get-timers';
import { formatTimeToAMPM, formatDayAndTime, formatTime } from '~/utils/format-time';

interface SubtaskTimersProps {
  subtaskId: string;
  userRole: string;
}

const SubtaskTimers = ({ subtaskId, userRole }: SubtaskTimersProps) => {
  const { t } = useTranslation('orders');
  const enabledUserRole = new Set(['agency_owner', 'agency_member', 'agency_project_manager'])

  const { data: timers, isLoading } = useQuery({
    queryKey: ['subtask_timers', subtaskId],
    queryFn: () => getTimersBySubtaskId(subtaskId).then((res) => {
      return res;
    }),
    enabled: enabledUserRole.has(userRole)
  });

  const calculateTotalTime = (timers: any[]) => {
    if (!timers?.length) return '00:00:00';
    
    return timers.reduce((total, timer) => {
      const time = timer.timers.timestamp.split(':').map(Number);
      const [currentHours, currentMinutes, currentSeconds] = total.split(':').map(Number);
      const [timerHours, timerMinutes, timerSeconds] = time;

      let seconds = currentSeconds + timerSeconds;
      let minutes = currentMinutes + timerMinutes;
      let hours = currentHours + timerHours;

      if (seconds >= 60) {
        minutes += Math.floor(seconds / 60);
        seconds = seconds % 60;
      }
      if (minutes >= 60) {
        hours += Math.floor(minutes / 60);
        minutes = minutes % 60;
      }

      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, '00:00:00');
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between w-full bg-gray-100 p-2 rounded-lg">
        <span className="text-gray-900 text-xs font-medium">
          {t('timers.timeTracking')}
        </span>
        <span className="font-mono text-sm">
          {calculateTotalTime(timers)}
        </span>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center">
          <Spinner className="h-4 w-4" />
        </div>
      ) : (
        <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {timers?.map((timer) => (
            <div
              key={timer.timer_id}
              className="p-3"
            >
              <div className="flex items-start gap-6">
                <div className="flex flex-col items-center">
                  <AvatarDisplayer
                    isTask={true}
                    displayName={
                      isValidName(timer.timers.accounts.name)
                        ? timer.timers.accounts.name
                        : deduceNameFromEmail(timer.timers.accounts.email)
                    }
                    pictureUrl={timer.timers.accounts.picture_url}
                    className="h-8 w-8"
                  />
                  <div className="w-[2px] h-24 bg-gray-200 mt-2"></div>
                </div>
                <div className="flex flex-col w-full">
                  <div className="flex items-center gap-2 justify-between">
                    <span className="text-sm font-medium">
                        {isValidName(timer.timers.accounts.name)
                        ? timer.timers.accounts.name
                        : deduceNameFromEmail(timer.timers.accounts.email)}
                    </span>
                    <span className="text-gray-600 text-xs font-normal">
                        {formatDayAndTime(timer.timers.end_time, t)}
                    </span>
                  </div>
                  <span className="text-gray-600 font-sans text-sm font-normal">
                    {timer.timers.name}
                  </span>
                  <div className="flex items-center justify-between mt-6 w-full">
                    <div className="flex gap-2 w-full items-center">
                    <div className="px-4 py-2 rounded-lg border border-gray-200 text-gray-500">
                        {formatTimeToAMPM(timer.timers.start_time)}
                    </div>
                    <ArrowRight className="h-4 w-4" />
                    <div className="px-4 py-2 rounded-lg border border-gray-200 text-gray-500">
                        {formatTimeToAMPM(timer.timers.end_time)}
                    </div>
                    </div>
                    <div className="flex gap-2 items-center">
                    <div className="px-4 py-2 rounded-lg border border-gray-200 text-gray-500">
                        {formatTime(timer.timers.elapsed_time)}
                    </div>
                    </div>
                </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SubtaskTimers;