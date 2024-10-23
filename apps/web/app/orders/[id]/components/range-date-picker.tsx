import { 
	Popover,
	PopoverContent,
  PopoverTrigger,
 
} from '@kit/ui/popover';

import { Calendar } from '@kit/ui/calendar';
import { Button } from '@kit/ui/button';
import { cn } from '@kit/ui/utils';
import { DateRange } from '@kit/ui/calendar';
import { addDays, format } from 'date-fns';
import { useState } from 'react';
import { Calendar as CalendarIcon } from "lucide-react"


export function DatePickerWithRange({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
  to: addDays(new Date(), 3), 
  })
 
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          
          <p className='cursor-pointer select-none px-3'>Seleccionar fechas</p>
          
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}