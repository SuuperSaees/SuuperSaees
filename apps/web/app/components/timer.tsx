'use client';


import { useTimeTracker } from '../orders/[id]/context/time-tracker-context';
import { useState, useEffect } from 'react';
import { formatTime } from '../orders/[id]/utils/format-time';

export const OrderTimer = () => {
  const { activeTimer } = useTimeTracker();
  const [time, setTime] = useState(0);

  console.log('activeTimer', activeTimer);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (activeTimer.subtaskId) {
      // Si no hay startTime, establecerlo
      if (!activeTimer.startTime) {
        activeTimer.startTime = Date.now() - (activeTimer.elapsedTime * 1000);
      }
      
      interval = setInterval(() => {
        const newTime = Math.floor((Date.now() - activeTimer.startTime) / 1000);
        setTime(newTime);
      }, 1000);
    } else {
      setTime(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTimer.subtaskId, activeTimer.startTime]);

  if (!activeTimer.subtaskId) return null;

  return (
    <div className="flex items-center gap-2 text-brand">
      <span className="text-sm font-medium">{formatTime(time)}</span>
      <span className="text-sm text-gray-500">({activeTimer.subtaskName})</span>
    </div>
  );
};