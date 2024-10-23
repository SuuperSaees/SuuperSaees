import { 
	Popover,
	PopoverContent,
  PopoverTrigger,
 
} from '@kit/ui/popover';

import { Calendar } from '@kit/ui/calendar';
import { cn } from '@kit/ui/utils';
import { DateRange } from '@kit/ui/calendar';


interface DatePickerWithRangeProps {
  selectedPeriod: DateRange | undefined;
  setSelectedPeriod: Dispatch<SetStateAction<DateRange | undefined>>;
}


export function DatePickerWithRange({
  selectedPeriod,
  setSelectedPeriod,
  className,
}: DatePickerWithRangeProps & React.HTMLAttributes<HTMLDivElement>) {
 
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          
          <p className='cursor-pointer select-none px-3 text-gray-900 font-medium'>Seleccionar fechas</p>
          
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