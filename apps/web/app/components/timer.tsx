'use client';

import { useTimeTracker } from '../orders/[id]/context/time-tracker-context';
import { useState, useEffect } from 'react';
import { formatTime } from '../orders/[id]/utils/format-time';
import { useTranslation } from 'react-i18next';
import { ArrowRight, CirclePause, X } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@kit/ui/alert-dialog';
import { Button } from '@kit/ui/button';
import { Input } from '@kit/ui/input';
import { TimerUpdate } from '~/lib/timer.types';
import { formatTimeToAMPM } from '~/utils/format-time';
import { ThemedButton } from 'node_modules/@kit/accounts/src/components/ui/button-themed-with-settings';
import AvatarDisplayer from '~/orders/[id]/components/ui/avatar-displayer';
import deduceNameFromEmail from '~/orders/[id]/utils/deduce-name-from-email';
import { useUserWorkspace } from '@kit/accounts/hooks/use-user-workspace';
import { Spinner } from '@kit/ui/spinner';

interface TimerProps {
  onUpdate: (timerId: string, timer: TimerUpdate) => Promise<void>;
}

export const Timer = ({ onUpdate }: TimerProps) => {
  const { t } = useTranslation('common');
  const { workspace, user } = useUserWorkspace();
  const { activeTimer, setActiveTimer, clearTimer } = useTimeTracker();
  const [time, setTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showPauseDialog, setShowPauseDialog] = useState(false);
  const [timerName, setTimerName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const userName = workspace.name;
  const userPictureUrl = workspace.picture_url;
  const userEmail = user.email;

  const handlePause = () => {
    setIsPaused(true);
    setShowPauseDialog(true);
  };

  const handlePauseConfirm = async () => {
    try {
      setIsSaving(true);
      const timerUpdate = {
        name: timerName,
        elapsed_time: time,
        end_time: Date.now(),
        status: 'finished'
      };
      setIsPaused(false);
  
      await onUpdate(activeTimer.id!, timerUpdate);
      
      setActiveTimer({
        id: null,
        elementId: null,
        elementType: null,
        elementName: null,
        startTime: null,
        elapsedTime: 0,
      });

      clearTimer();
      setTime(0);
      setTimerName('');
      setShowPauseDialog(false);
    } catch (error) {
      console.error('Error updating timer:', error);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (activeTimer.elementId && !isPaused) {
      const handleBeforeUnload = async (e: BeforeUnloadEvent) => {
        // We still need this for browser close/refresh
        e.preventDefault();
        e.returnValue = '';
        
        //Save the timestamp before the page unloads
        await handlePauseConfirm();
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
  }, [activeTimer.elementId, activeTimer.startTime, isPaused, t, handlePauseConfirm]);

  if (!activeTimer.elementId) return null;

  return (
    <>
      <div className="flex items-center gap-4 text-gray-600">
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
                  : deduceNameFromEmail(userEmail ?? '')
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
              <div className="px-4 py-2 rounded border border-gray-200 text-gray-500">
                {formatTimeToAMPM(activeTimer.startTime)}
              </div>
              <ArrowRight className="h-4 w-4" />
              <div className="px-4 py-2 rounded border border-gray-200 text-gray-500">
                {formatTimeToAMPM(Date.now())}
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <div className="px-4 py-2 rounded border border-gray-200 text-gray-500">
                {formatTime(time)}
              </div>
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
              onClick={handlePauseConfirm}
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