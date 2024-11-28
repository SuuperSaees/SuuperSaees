import React from 'react';
import { Timer } from '~/lib/timer.types';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuShortcut, DropdownMenuTrigger } from '@kit/ui/dropdown-menu';
import { ArrowRight, EllipsisVertical, Pen, Ban } from 'lucide-react';
import AvatarDisplayer from '../ui/avatar-displayer';
import { formatDayAndTime, formatTime, formatTimeInHours, formatTimeToAMPM } from '~/utils/format-time';
import { useQueryClient } from '@tanstack/react-query';

interface TimerListProps {
  t: any;
  timers: Timer[];
  onUpdate: (timerId: string, update: any) => Promise<void>;
  onEditClick: (timer: Timer) => void;
  userRole: string;
  subtaskId: string;
}

const TimerList: React.FC<TimerListProps> = ({ t, timers, onUpdate, onEditClick, userRole, subtaskId }) => {
  const queryClient = useQueryClient();
  const enabledUserRole = new Set(['agency_owner', 'agency_member', 'agency_project_manager'])
  return (
    <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {timers.map((timer) => (
        <div
          key={timer.timers.id}
          className="p-3"
        >
          <div className="flex items-start gap-6">
            <div className="flex flex-col items-center">
              <AvatarDisplayer
                isTask={true}
                displayName={timer.timers.accounts.name}
                pictureUrl={timer.timers.accounts.picture_url}
                className="h-8 w-8"
              />
              <div className="w-[2px] h-24 bg-gray-200 mt-2"></div>
            </div>
            <div className="flex flex-col w-full">
              <div className="flex items-center gap-2 justify-between">
                <span className="text-sm font-medium">{timer.timers.accounts.name}</span>
                <div className='flex'>
                  <span className="text-gray-600 text-xs font-normal">
                    {formatDayAndTime(timer.timers.updated_at ?? timer.timers.created_at, t)}
                  </span>
                  {
                    enabledUserRole.has(userRole)  && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <EllipsisVertical className="h-[20px] w-[20px] cursor-pointer text-gray-400" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56">
                          <DropdownMenuGroup>
                            <DropdownMenuItem onClick={() => onEditClick(timer.timers)}>
                              {t('timers.editTimer')}
                              <DropdownMenuShortcut>
                                <Pen className="h-[20px] w-[20px]" />
                              </DropdownMenuShortcut>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={async () => {
                              await onUpdate(timer.timers.id, { deleted_on: Date.now() });
                              queryClient.invalidateQueries({
                                queryKey: ['subtask_timers', subtaskId]
                              });
                            }}>
                              {t('timers.deleteTimer')}
                              <DropdownMenuShortcut>
                                <Ban className="h-[20px] w-[20px]" />
                              </DropdownMenuShortcut>
                            </DropdownMenuItem>
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )
                  }
                </div>
              </div>
              <span className="text-gray-600 font-sans text-sm font-normal">{timer.timers.name}</span>
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
                    {formatTime(formatTimeInHours(timer.timers.start_time, timer.timers.end_time))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TimerList;