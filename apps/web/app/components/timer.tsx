'use client';

import { useTimeTracker } from '~/(main)/orders/[id]/context/time-tracker-context';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight, CirclePause, X} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@kit/ui/alert-dialog';
import { Button } from '@kit/ui/button';
import { Input } from '@kit/ui/input';
import { TimerUpdate } from '~/lib/timer.types';
import { formatTimeToAMPM, formatTime, formatTimeInHours } from '~/utils/format-time';
import { ThemedButton } from 'node_modules/@kit/accounts/src/components/ui/button-themed-with-settings';
import AvatarDisplayer from '~/(main)/orders/[id]/components/ui/avatar-displayer';
import { useUserWorkspace } from '@kit/accounts/hooks/use-user-workspace';
import { Spinner } from '@kit/ui/spinner';
import { handleEndTimeChange, handlePauseConfirm, handleStartTimeChange } from '~/utils/timer-utils';

interface TimerProps {
  onUpdate: (timerId: string, timer: TimerUpdate) => Promise<void>;
  className?: string;
}

export const Timer = ({ onUpdate, className }: TimerProps) => {
  const { t } = useTranslation('common');
  const { workspace, user } = useUserWorkspace();
  const { activeTimer, setActiveTimer, clearTimer } = useTimeTracker();
  const [time, setTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showPauseDialog, setShowPauseDialog] = useState(false);
  const [timerName, setTimerName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // New state for editable times
  const [editingStartTime, setEditingStartTime] = useState(false);
  const [editingEndTime, setEditingEndTime] = useState(false);
  const [startTime, setStartTime] = useState(activeTimer.startTime);
  const [endTime, setEndTime] = useState(Date.now());

  const userName = workspace.name;
  const userPictureUrl = workspace.picture_url;
  const userEmail = user.email;

  const handlePause = () => {
    setIsPaused(true);
    setShowPauseDialog(true);
    setStartTime(activeTimer.startTime);
    setEndTime(Date.now());
    setEditingStartTime(false);
    setEditingEndTime(false);
  };

  const handleStartTimeChangeWrapper = (value: string) => {
    handleStartTimeChange(value, setStartTime);
    };

  const handleEndTimeChangeWrapper = (value: string) => {
      handleEndTimeChange(value, setEndTime);
  };

  const handlePauseConfirmWrapper = async () => {
    await handlePauseConfirm(
        activeTimer,
        onUpdate,
        timerName,
        startTime,
        endTime,
        setActiveTimer,
        clearTimer,
        setTime,
        setTimerName,
        setShowPauseDialog,
        setIsSaving
    );
};


  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (activeTimer.elementId) {
      const handleBeforeUnload = async (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = '';
        
        await handlePauseConfirmWrapper();
        return '';
      };

      window.addEventListener('beforeunload', handleBeforeUnload);
      
      if (!activeTimer.startTime) {
        activeTimer.startTime = Date.now() - (activeTimer.elapsedTime * 1000);
      }

      interval = setInterval(() => {
        const newTime = Math.floor((Date.now() - (activeTimer.startTime ?? 0)) / 1000);
        setTime(newTime);
      }, 1000);

      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        if (interval) clearInterval(interval);
      };
    } 
  }, [activeTimer.elementId, activeTimer.startTime, isPaused, t, handlePauseConfirmWrapper]);

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

  if (!activeTimer.elementId) return null;

  return (
    <>
      <div className={`flex items-center gap-4 text-gray-600 ${className}`}>
        <span className="text-gray-600 text-right text-base font-normal">{formatTime(time)}</span>
        <CirclePause className="h-4 w-4 cursor-pointer" onClick={handlePause} />
      </div>

      <AlertDialog open={showPauseDialog} onOpenChange={setShowPauseDialog}>
        <AlertDialogContent className="max-w-md">
          <div className="flex justify-between items-start">
            <AlertDialogTitle className="text-xl font-semibold">
              {t('timer.addTime')}
            </AlertDialogTitle>
            <button 
              onClick={() => {
                setShowPauseDialog(false);
                setIsPaused(false);
              }}
              className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center gap-4 mt-4">
            <AvatarDisplayer
              displayName={
                userName
                  ? userName
                  : userEmail ?? ''
              }
              pictureUrl={
                userPictureUrl
                  ? userPictureUrl
                  : undefined
              }
            />
            <div className="flex-1">
              <AlertDialogDescription className="mb-2 text-gray-700 text-sm font-medium">
                {t('timer.whatDidYouSpendTimeOn')}
              </AlertDialogDescription>
              <Input
                value={timerName}
                onChange={(e) => setTimerName(e.target.value)}
                placeholder={t('timer.writeHere')}
                className="w-full"
              />
            </div>
          </div>
          <div className="flex items-center justify-between mt-6 w-full">
            <div className="flex gap-2 w-full items-center">
              {renderEditableTime(
                'startTime', 
                startTime ?? 0, 
                editingStartTime, 
                setEditingStartTime, 
                handleStartTimeChangeWrapper
              )}
              <ArrowRight className="h-4 w-4" />
              {renderEditableTime(
                'endTime', 
                endTime, 
                editingEndTime, 
                setEditingEndTime, 
                handleEndTimeChangeWrapper
              )}
            </div>
            <div className="flex gap-2 items-center ">
              {formatTime(formatTimeInHours(startTime, endTime))}
            </div>
          </div>
          <div className="flex gap-4 items-center justify-between mt-6 w-full">
            <Button
              variant="outline"
              onClick={() => {
                setShowPauseDialog(false);
                setIsPaused(false);
              }}
              className="px-6"
            >
              {t('timer.cancel')}
            </Button>
            <ThemedButton
              onClick={handlePauseConfirmWrapper}
              className="px-6"
            >
              {isSaving ? <Spinner className="w-4 h-4" /> : t('timer.confirm')}
            </ThemedButton>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};