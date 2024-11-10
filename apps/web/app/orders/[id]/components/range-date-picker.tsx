import { 
	Popover,
	PopoverContent,
  PopoverTrigger,
 
} from '@kit/ui/popover';

import { Calendar } from '@kit/ui/calendar';
import { cn } from '@kit/ui/utils';
import { DateRange } from '@kit/ui/calendar';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { Subtask } from '~/lib/tasks.types';
import { useState } from 'react';


interface DatePickerWithRangeProps {
  initialPeriod: DateRange | undefined;
  handlePeriod: (
    subtaskId: string,
    subtask: Subtask.Type,
    newPeriod: DateRange | undefined
  ) => void
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
  shortFormat = false
}: DatePickerWithRangeProps & React.HTMLAttributes<HTMLDivElement>) {

  const { t } = useTranslation(['tasks','orders']);
  const [selectedPeriod, setSelectedPeriod] = useState<DateRange | undefined>(initialPeriod)
  const [open, setOpen] = useState(false);

  const formattedDateRange = selectedPeriod?.from && selectedPeriod?.to
    ? shortFormat 
        ? `${format(selectedPeriod.to, 'MMM d, yyyy')}` 
        : `${format(selectedPeriod.from, 'MMM d, yyyy')} - ${format(selectedPeriod.to, 'MMM d, yyyy')}`
    : t('select_date_range',{ns: 'orders'});
  

  const handleDateSelect = (newPeriod: DateRange | undefined) => {
    setSelectedPeriod(newPeriod)
    handlePeriod(subtaskId, subtask, newPeriod)
  }
  
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={open}>
        <PopoverTrigger asChild onClick={() => {setOpen(!open)}}>
          
          <p 
            className='whitespace-nowrap cursor-pointer select-none px-3 text-gray-900 font-medium text-sm'
          >
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
  )
}