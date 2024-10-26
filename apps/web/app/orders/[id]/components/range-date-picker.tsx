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


interface DatePickerWithRangeProps {
  selectedPeriod: DateRange | undefined;
  setSelectedPeriod: Dispatch<SetStateAction<DateRange | undefined>>;
}


export function DatePickerWithRange({
  selectedPeriod,
  setSelectedPeriod,
  className,
}: DatePickerWithRangeProps & React.HTMLAttributes<HTMLDivElement>) {

  const { t } = useTranslation('orders');

  const formattedDateRange = selectedPeriod?.from && selectedPeriod?.to
    ? `${format(selectedPeriod.from, 'dd/MM/yyyy')} - ${format(selectedPeriod.to, 'dd/MM/yyyy')}`
    : t('select_date_range');
 
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          
          <p 
            className='cursor-pointer select-none px-3 text-gray-900 font-medium'
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
            onSelect={setSelectedPeriod}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}