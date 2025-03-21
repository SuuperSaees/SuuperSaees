'use client';

import { format, parseISO, isAfter, differenceInDays } from 'date-fns';
import { AlarmClockIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Tooltip from '~/components/ui/tooltip';

interface OverdueIndicatorProps {
  dueDate: string | null;
  isCompleted?: boolean;
  completedDate?: string | null;
}

export function OverdueIndicator({ 
  dueDate, 
  isCompleted = false, 
  completedDate = null 
}: OverdueIndicatorProps) {
  const { t } = useTranslation();
  
  // If no due date, don't show anything
  if (!dueDate) {
    return null;
  }
  
  // Parse dates safely
  const dueDateObj = parseISO(dueDate);
  const today = new Date();
  
  // If the order is completed, check if it was completed before the due date
  if (isCompleted && completedDate) {
    const completedDateObj = parseISO(completedDate);
    
    // If completed before or on the due date, it's not overdue
    if (!isAfter(completedDateObj, dueDateObj)) {
      return null;
    }
  }
  
  // For incomplete orders, if today is before or equal to the due date, it's not overdue
  if (!isCompleted && !isAfter(today, dueDateObj)) {
    return null;
  }
  
  // If we've reached this point and the order is completed, but we don't have a completion date,
  // we'll assume it was completed on time and not show the overdue indicator
  if (isCompleted && !completedDate) {
    return null;
  }
  
  // Calculate days overdue - use the completion date for completed orders, or today for incomplete ones
  const referenceDate = isCompleted && completedDate ? parseISO(completedDate) : today;
  
  // Set time to midnight for both dates to compare just the dates
  // This helps with timezone issues
  const normalizedDueDate = new Date(dueDateObj);
  normalizedDueDate.setHours(0, 0, 0, 0);
  
  const normalizedReferenceDate = new Date(referenceDate);
  normalizedReferenceDate.setHours(0, 0, 0, 0);
  
  // Calculate days overdue
  const daysOverdue = differenceInDays(normalizedReferenceDate, normalizedDueDate);
  
  // If days overdue is 0 or negative, don't show the indicator
  if (daysOverdue <= 0) {
    return null;
  }
  
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