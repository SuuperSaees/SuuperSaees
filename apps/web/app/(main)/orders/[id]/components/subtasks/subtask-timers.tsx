'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Clock, Plus, X } from 'lucide-react';
import { Spinner } from '@kit/ui/spinner';
import AvatarDisplayer from '../ui/avatar-displayer';
import { getTimersBySubtaskId } from '~/team-accounts/src/server/actions/timers/get/get-timers';
import { formatTimeToAMPM, formatTime, formatTimeInHours } from '~/utils/format-time';
import { ThemedButton } from 'node_modules/@kit/accounts/src/components/ui/button-themed-with-settings';
import { Button } from '@kit/ui/button';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@kit/ui/alert-dialog';
import { Input } from '@kit/ui/input';
import { calculateTotalTime, handleEndTimeChange, handleEndTimeUpdate, handleStartTimeChange, handleStartTimeUpdate } from '~/utils/timer-utils';
import { useUserWorkspace } from '@kit/accounts/hooks/use-user-workspace';
import { Timer, TimerUpdate } from '~/lib/timer.types';
import { toast } from 'sonner';
import TimerList from '../timers/timers-list';

interface SubtaskTimersProps {
  subtaskId: string;
  userRole: string;
  onCreate: (timer: Timer) => Promise<void>;
  onUpdate: (timerId: string, timer: TimerUpdate) => Promise<void>;
}

const SubtaskTimers = ({ subtaskId, userRole, onCreate, onUpdate }: SubtaskTimersProps) => {
  const { t } = useTranslation('orders');
  const { workspace } = useUserWorkspace();
  const enabledUserRole = new Set(['agency_owner', 'agency_member', 'agency_project_manager'])
  const [showManualTimerDialog, setShowManualTimerDialog] = useState(false);


  // States to create the timer
  const [timerName, setTimerName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [editingStartTime, setEditingStartTime] = useState(false);
  const [editingEndTime, setEditingEndTime] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [endTime, setEndTime] = useState(Date.now());

  // States to update timer
  const [currentTimer, setCurrentTimer] = useState<Timer | null>(null);
  const [showUpdate, setshowUpdate] = useState(false);

  const handleUpdateClick = (timer: Timer) => {
    setCurrentTimer(timer);
    setshowUpdate(true);
  };

  //User information
  const userName = workspace.name;
  const userPictureUrl = workspace.picture_url;

  const queryClient = useQueryClient();

  const { data: timers = [], isLoading } = useQuery({
    queryKey: ['subtask_timers', subtaskId],
    queryFn: () => getTimersBySubtaskId(subtaskId).then((res) => {
      return res || [];
    }),
    // enabled: enabledUserRole.has(userRole)
  });

  const renderEditableTime = (
    type: 'startTime' | 'endTime',
    value: number, 
    editing: boolean, 
    setEditing: (value: boolean) => void,
    onChange: (value: string) => void
  ) => {
    if (!editing) {
      return (
        <div 
          className="px-4 py-2 rounded border border-gray-200 text-gray-500 flex items-center gap-2 cursor-pointer hover:bg-gray-100"
          onClick={() => setEditing(true)}
        >
          {type === 'startTime' ? formatTimeToAMPM(value) : 
           type === 'endTime' ? formatTimeToAMPM(value) : 
           formatTime(value)}
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <Input
          type="time"
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => setEditing(false)}
        />
      </div>
    );
  };

  const handleStartTimeChangeWrapper = (value: string) => {
    if (currentTimer) {
      const newStartTime = handleStartTimeUpdate(value);
      setCurrentTimer({ ...currentTimer, start_time: newStartTime});
    }
    handleStartTimeChange(value, setStartTime);
  };

  const handleEndTimeChangeWrapper = (value: string) => {
    if (currentTimer) {
      const newEndTime = handleEndTimeUpdate(value);
      setCurrentTimer({ ...currentTimer, end_time: newEndTime });
    }
      handleEndTimeChange(value, setEndTime);
  };

  const clearStates= () => {
    setTimerName('')
    setEditingStartTime(false)
    setEditingEndTime(false)
    setStartTime(Date.now())
    setEndTime(Date.now())
  }

  return (
    <div className="flex flex-col gap-4">
      <div className='flex gap-2'>
        <div className="flex items-center justify-between w-full bg-gray-100 p-2 rounded-lg">
          <span className="text-gray-900 text-xs font-medium">
            {t('timers.timeTracking')}
          </span>
          <span className="font-mono text-sm">
            {calculateTotalTime(timers)}
          </span>
        </div>
        {
            enabledUserRole.has(userRole) && (
              <Button
                variant="outline"
                onClick={() => setShowManualTimerDialog(true)}
              >
                <div className='flex gap-2 items-center'>
                  <Plus className='w-4 h-4 text-gray-500'/>
                  <span className='text-gray-500'>{t('timers.addManualTime')}</span>
                </div>
              </Button>
            )
          }
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center">
          <Spinner className="h-4 w-4" />
        </div>
      ) : timers.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center p-4 h-[calc(100vh-300px)] gap-4">
          <Clock className='h-10 w-10' />
          <span className="text-gray-500">{t('timers.noTimeEntries')}</span>
          {
            enabledUserRole.has(userRole)  && (
              <>
                <span className="text-gray-400">{t('timers.startAdding')}</span>
                <ThemedButton
                  onClick={() => {
                    setShowManualTimerDialog(true)
                  }}
                >
                  {t('timers.addManualTime')}
                </ThemedButton>
              </>
            )
          }
        </div>
      ) : (
        <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {timers.length > 0 ? (
            <TimerList
              t={t}
              timers={timers}
              onUpdate={onUpdate}
              onEditClick={handleUpdateClick}
              userRole={userRole}
              subtaskId={subtaskId}
            />
          ) : (
            <span className="text-gray-500">{t('timers.noTimeEntries')}</span>
          )}
        </div>
      )}
      <AlertDialog 
        open={showManualTimerDialog || showUpdate} 
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setShowManualTimerDialog(false);
            setshowUpdate(false);
            clearStates();
            setCurrentTimer(null);
          }
        }}
      >
        <AlertDialogContent className="max-w-md">
          <div className="flex justify-between items-start">
            <AlertDialogTitle className="text-xl font-semibold">
              {showUpdate ? t('timer.updateTime') : t('timer.addTime')}
            </AlertDialogTitle>
            <button
              onClick={() => {
                setShowManualTimerDialog(false);
                setshowUpdate(false);
                clearStates();
                setCurrentTimer(null);
              }}
              className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center gap-4 mt-4">
            <AvatarDisplayer
              displayName={userName}
              pictureUrl={userPictureUrl ? userPictureUrl : undefined}
            />
            <div className="flex-1">
              <AlertDialogDescription className="mb-2 text-gray-700 text-sm font-medium">
                {t('timer.whatDidYouSpendTimeOn')}
              </AlertDialogDescription>
              <Input
                value={showUpdate ? currentTimer?.name ?? '' : timerName}
                onChange={(e) =>
                  showUpdate
                    ? setCurrentTimer({ ...currentTimer, name: e.target.value } as Timer)
                    : setTimerName(e.target.value)
                }
                placeholder={t('timer.writeHere')}
                className="w-full"
              />
            </div>
          </div>
          <div className="flex items-center justify-between mt-6 w-full">
            <div className="flex gap-2 w-full items-center">
              {renderEditableTime(
                'startTime',
                showUpdate ? currentTimer?.start_time ?? 0 : startTime,
                editingStartTime,
                setEditingStartTime,
                handleStartTimeChangeWrapper
              )}
              <ArrowRight className="h-4 w-4" />
              {renderEditableTime(
                'endTime',
                showUpdate ? currentTimer?.end_time ?? 0 : endTime,
                editingEndTime,
                setEditingEndTime,
                handleEndTimeChangeWrapper
              )}
            </div>
            <div className="flex gap-2 items-center ">
              {formatTime(
                formatTimeInHours(
                  showUpdate ? currentTimer?.start_time ?? 0 : startTime,
                  showUpdate ? currentTimer?.end_time ?? 0 : endTime
                )
              )}
            </div>
          </div>
          <div className="flex gap-4 items-center justify-between mt-6 w-full">
            <Button
              variant="outline"
              onClick={() => {
                setShowManualTimerDialog(false);
                setshowUpdate(false);
                clearStates();
                setCurrentTimer(null);
              }}
              className="px-6"
            >
              {t('timer.cancel')}
            </Button>
            <ThemedButton
              className="px-6"
              onClick={async () => {
                try {
                  setIsSaving(true);
                  if (showUpdate && currentTimer) {
                    await onUpdate(currentTimer.id, {
                      name: currentTimer.name,
                      start_time: currentTimer.start_time,
                      end_time: currentTimer.end_time,
                    });
                  } else {
                    await onCreate({
                      elementId: subtaskId,
                      elementType: 'subtask',
                      elementName: timerName,
                      startTime: startTime,
                      endTime: endTime,
                      timestamp: formatTime(formatTimeInHours(startTime, endTime)),
                    });
                  }
                  queryClient.invalidateQueries({ queryKey: ['subtask_timers', subtaskId] });
                  setIsSaving(false);
                  setShowManualTimerDialog(false);
                  setshowUpdate(false);
                  clearStates();
                  setCurrentTimer(null);
                } catch (error) {
                  setIsSaving(false);
                  console.error(
                    showUpdate ? 'Error updating subtask timer:' : 'Error creating subtask timer:',
                    error
                  );
                  toast(
                    showUpdate ? 'Error updating timer:' : 'Error creating timer:',
                    error
                  );
                }
              }}
            >
              {isSaving ? <Spinner className="w-4 h-4" /> : t('timer.confirm')}
            </ThemedButton>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SubtaskTimers;