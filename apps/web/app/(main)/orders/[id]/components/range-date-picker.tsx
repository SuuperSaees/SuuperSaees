import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@kit/ui/popover';

import { Calendar } from '@kit/ui/calendar';
import { cn } from '@kit/ui/utils';
import { DateRange } from '@kit/ui/calendar';
import { useTranslation } from 'react-i18next';
import { Subtask } from '~/lib/tasks.types';
import { useRef, useState } from 'react';
import { getFormattedDateRange } from '../utils/get-formatted-dates';

interface DatePickerWithRangeProps {
  initialPeriod: DateRange | undefined;
  handlePeriod: (
    subtaskId: string,
    subtask: Subtask.Type,
    newPeriod: DateRange | undefined
  ) => void;
  subtaskId: string;  
  subtask: Subtask.Type;
  shortFormat?: boolean;
}

export function DatePickerWithRange({
  initialPeriod,
  handlePeriod,
  subtaskId,
  subtask,
  className,
  shortFormat = false,
}: DatePickerWithRangeProps & React.HTMLAttributes<HTMLDivElement>) {
  const { t, i18n } = useTranslation(['tasks', 'orders']);
  const language = i18n.language;
  const [selectedPeriod, setSelectedPeriod] = useState<DateRange | undefined>(initialPeriod);
  const [open, setOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const formattedDateRange = 
    getFormattedDateRange(selectedPeriod, language, shortFormat) || 
    t('select_date_range', { ns: 'orders' });

  const handleDateSelect = (newPeriod: DateRange | undefined) => {
    setSelectedPeriod(newPeriod);
    handlePeriod(subtaskId, subtask, newPeriod);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
      setOpen(false);
    }
  };

  const togglePopover = () => {
    if (!open) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    setOpen(!open);
  };

  return (
    <div
      className={cn("grid gap-2 bg-gray-100 hover:bg-gray-200 p-2 rounded-lg", className)}
      ref={popoverRef}
    >
      <Popover open={open}>
        <PopoverTrigger asChild onClick={togglePopover}>
          <p className="whitespace-nowrap cursor-pointer select-none px-3 text-gray-900 font-medium text-sm">
            {formattedDateRange}
          </p>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={selectedPeriod?.from}
            selected={selectedPeriod}
            onSelect={handleDateSelect}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
