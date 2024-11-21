'use client';


import { useTimeTracker } from '../orders/[id]/context/time-tracker-context';
import { useState, useEffect } from 'react';
import { formatTime } from '../orders/[id]/utils/format-time';
import { useTranslation } from 'react-i18next';

export const OrderTimer = () => {
  const { t } = useTranslation('common');
  const { activeTimer } = useTimeTracker();
  const [time, setTime] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (activeTimer.subtaskId) {
      // Agregar el event listener solo para beforeunload
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        // Verificar si es un refresh o cierre de página
        if (e.type === 'beforeunload') {
          e.preventDefault();
          e.returnValue = t('confirm-close');
          return e.returnValue;
        }
      };

      // Solo escuchar el evento beforeunload
      window.addEventListener('beforeunload', handleBeforeUnload);
      
      if (!activeTimer.startTime) {
        activeTimer.startTime = Date.now() - (activeTimer.elapsedTime * 1000);
      }
      
      interval = setInterval(() => {
        const newTime = Math.floor((Date.now() - activeTimer.startTime) / 1000);
        setTime(newTime);
      }, 1000);

      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        if (interval) clearInterval(interval);
      };
    } else {
      setTime(0);
    }
  }, [activeTimer.subtaskId, activeTimer.startTime, t]);

  if (!activeTimer.subtaskId) return null;

  return (
    <div className="flex items-center gap-2 text-brand">
      <span className="text-sm font-medium">{formatTime(time)}</span>
      <span className="text-sm text-gray-500">({activeTimer.subtaskName})</span>
    </div>
  );
};