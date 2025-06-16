// components/DatePickerDemo.tsx
"use client";

import * as React from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@kit/ui/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@kit/ui/popover";
import { Button } from "@kit/ui/button";
import { Calendar } from "@kit/ui/calendar";

interface DatePickerProps {
  onDateChange: (date: Date) => void;
  showIcon?: boolean;
  className?: string;
  defaultValue?: Date;
}

export function DatePicker({ onDateChange, showIcon = true, className, defaultValue }: DatePickerProps) {
  const [date, setDate] = React.useState<Date | undefined>(defaultValue);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate);
      onDateChange(selectedDate);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
         
            !date && "text-muted-foreground",
            className,
          )}
        >
          {showIcon && <CalendarIcon className="mr-2 h-4 w-4" />}
          {date ? format(date, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
