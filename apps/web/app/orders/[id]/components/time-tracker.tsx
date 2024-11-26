import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { useTimeTracker } from '../context/time-tracker-context';
import { cn } from '@kit/ui/utils';
import { createTimer } from '~/team-accounts/src/server/actions/timers/create/create-timer';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';

interface TimeTrackerProps {
  elementId: string;
  elementType: string;
  elementName?: string;
  isHovered?: boolean;
}

export const TimeTracker = ({ 
  elementId, 
  elementType, 
  elementName, 
  isHovered = true 
}: TimeTrackerProps) => {
  const { t } = useTranslation('common');
  const queryClient = useQueryClient();
  const [time, setTime] = useState(0);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const { activeTimer, setActiveTimer, clearTimer } = useTimeTracker();

  const isTracking = activeTimer.elementId === elementId;
  const isAnotherTimerActive = activeTimer.elementId !== null && !isTracking;

  useEffect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [intervalId]);

  const toggleTimer = async () => {
    if (isAnotherTimerActive) return;
  
    if (!isTracking) {
      const startTime = Date.now();
      
      try {
        const timer = await createTimer({
          elementId,
          elementType,
          elementName: elementName ?? '',
          startTime,
          elapsedTime: 0
        });
        
        const id = setInterval(() => {
          setTime((prevTime) => prevTime + 1);
        }, 1000);
        
        setIntervalId(id);
        setActiveTimer({
          id: timer.data?.id ?? '',
          elementId,
          elementType,
          elementName: elementName ?? '',
          startTime,
          elapsedTime: 0
        });

        if (elementType === 'subtask') {
          queryClient.invalidateQueries({
            queryKey: ['subtask_timers', elementId]
          });
        }
      } catch (error) {
        console.error('Failed to create timer:', error);
        toast.error(t('timer.errorCreating'));
      }
    } else {
      if (intervalId) {
        clearInterval(intervalId);
        setIntervalId(null);
      }
      setActiveTimer({
        id: null,
        elementId: null,
        elementType: null,
        elementName: null,
        startTime: null,
        elapsedTime: time
      });
      setTime(0);
      clearTimer();
    }
  };

  return (
    <>
      {isHovered && (
        <Clock
          className={cn(
            'h-4 w-4 cursor-pointer',
            isTracking && "text-brand animate-pulse",
            isAnotherTimerActive && 'text-gray-300 cursor-not-allowed',
            !isTracking && !isAnotherTimerActive && 'text-gray-500 hover:text-gray-700'
          )}
          onClick={toggleTimer}
        />
      )}
    </>
  );
};
