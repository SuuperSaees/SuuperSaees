'use client';

import { format } from 'date-fns';
import { AlarmClockIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Tooltip from '~/components/ui/tooltip';

interface OverdueIndicatorProps {
  dueDate: string | null;
}

export function OverdueIndicator({ dueDate }: OverdueIndicatorProps) {
  const { t } = useTranslation();
  
  // If no due date, don't show anything
  if (!dueDate) {
    return null;
  }
  
  const dueDateObj = new Date(dueDate);
  const today = new Date();
  
  // Set time to midnight for both dates to compare just the dates
  today.setHours(0, 0, 0, 0);
  dueDateObj.setHours(0, 0, 0, 0);
  
  // If due date is in the future, don't show anything
  if (dueDateObj >= today) {
    return null;
  }
  
  // Calculate days overdue
  const daysOverdue = Math.floor((today.getTime() - dueDateObj.getTime()) / (1000 * 60 * 60 * 24));
  
  const tooltipContent = (
    <div className="flex flex-col gap-1">
      <p className="text-sm font-medium">
        {daysOverdue === 1 
          ? t('overdue.singular.description', { days: daysOverdue }) 
          : t('overdue.plural.description', { days: daysOverdue })}
      </p>
      <p className="text-xs text-blue-400">
        {format(dueDateObj, 'MMM d, yyyy')}
      </p>
    </div>
  );
  
  return (
    <Tooltip content={tooltipContent} delayDuration={200}>
      <div className="flex-shrink-0 ml-1">
        <div className="bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600 rounded-full border border-red-400 flex items-center gap-1 ">
          <AlarmClockIcon className="w-4 h-4 mr-1" />
          {t('overdue.title')}
        </div>
      </div>
    </Tooltip>
  );
} 