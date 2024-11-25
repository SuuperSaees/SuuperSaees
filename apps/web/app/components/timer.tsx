'use client';

import { useTimeTracker } from '../orders/[id]/context/time-tracker-context';
import { useState, useEffect } from 'react';
import { formatTime } from '../orders/[id]/utils/format-time';
import { useTranslation } from 'react-i18next';
import { Pause } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@kit/ui/alert-dialog';
import { Button } from '@kit/ui/button';
import { Input } from '@kit/ui/input';
import { updateActiveTimer } from '~/team-accounts/src/server/actions/timers/update/update-timer';

export const OrderTimer = () => {
  const { t } = useTranslation('common');
  const { activeTimer, setActiveTimer, clearTimer } = useTimeTracker();
  const [time, setTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showPauseDialog, setShowPauseDialog] = useState(false);
  const [timerName, setTimerName] = useState(activeTimer.elementName ?? '');

  const handlePause = () => {
    setIsPaused(true);
    setShowPauseDialog(true);
  };

  const handlePauseConfirm = async () => {
    try {
      const timerUpdate = {
        name: timerName,
        elapsed_time: time,
        end_time: Date.now(),
        status: 'finished'
      };
      setIsPaused(false);
  
      await updateActiveTimer(activeTimer.id!, timerUpdate);
      
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
      
      setShowPauseDialog(false);
    } catch (error) {
      console.error('Error updating timer:', error);
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
      <div className="flex items-center gap-2 text-brand">
        <span className="text-sm font-medium">{formatTime(time)}</span>
        <span className="text-sm text-gray-500">({activeTimer.elementName ?? ''})</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePause}
          className="ml-2"
        >
          <Pause className="h-4 w-4" />
        </Button>
      </div>

      <AlertDialog open={showPauseDialog} onOpenChange={setShowPauseDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('timer.pauseTimer')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('timer.enterTimerName')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Input
              value={timerName}
              onChange={(e) => setTimerName(e.target.value)}
              placeholder={t('timer.timerName')}
            />
          </div>
          <AlertDialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowPauseDialog(false);
                setIsPaused(false);
              }}
            >
              {t('timer.cancel')}
            </Button>
            <Button onClick={handlePauseConfirm}>
              {t('timer.confirm')}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};