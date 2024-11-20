import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { useTimeTracker } from '../context/time-tracker-context';
import { cn } from '@kit/ui/utils';

interface TimeTrackerProps {
  subtaskId: string;
  taskId: string;
  isHovered: boolean;
  subtaskName: string;
}

export const TimeTracker = ({ subtaskId, taskId, isHovered, subtaskName }: TimeTrackerProps) => {
  const [time, setTime] = useState(0);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const { activeTimer, setActiveTimer } = useTimeTracker();

  const isTracking = activeTimer.subtaskId === subtaskId;
  const isAnotherTimerActive = activeTimer.subtaskId !== null && !isTracking;

  useEffect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [intervalId]);

  const toggleTimer = () => {
    if (isAnotherTimerActive) return;
  
    if (!isTracking) {
      const startTime = Date.now();
      const id = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
      setIntervalId(id);
      setActiveTimer({
        subtaskId,
        taskId,
        subtaskName,
        startTime,
        elapsedTime: 0
      });
    } else {
      if (intervalId) {
        clearInterval(intervalId);
        setIntervalId(null);
      }
      setActiveTimer({
        subtaskId: null,
        taskId: null,
        subtaskName: null,
        startTime: null,
        elapsedTime: time
      });
      setTime(0);
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
