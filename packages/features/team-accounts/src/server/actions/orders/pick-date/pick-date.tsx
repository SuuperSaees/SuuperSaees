'use client';

import React, { useState } from 'react';
import { addHours, parseISO } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { formatDisplayDate } from '@kit/shared/utils';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@kit/ui/alert-dialog';
import { Button } from '@kit/ui/button';
import { Calendar } from '@kit/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@kit/ui/popover';
import { cn } from '@kit/ui/utils';
import { CalendarIcon } from 'lucide-react';

interface DatePickerProps {
  updateFn: (date: string) => void | Promise<void>;
  defaultDate?: string | undefined | null;
  showIcon?: boolean;
  blocked?: boolean;
  [key: string]: unknown;
}

const DatePicker = ({ updateFn, defaultDate, showIcon, blocked, ...rest }: DatePickerProps) => {
  const { t, i18n } = useTranslation('orders');

  const [date, setDate] = React.useState<Date | undefined>(
    defaultDate?.toString()
      ? addHours(
          parseISO(defaultDate.toString()),
          new Date().getTimezoneOffset() / 60,
        )
      : undefined,
  );

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const language = i18n.language

  async function onSubmit() {
    if (!date) return;
    await updateFn(date.toISOString());
  }

  const handleDateChange = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    setIsDialogOpen(true);
  };

  const handleConfirm = async () => {
    await onSubmit();
    setIsDialogOpen(false);
  };

  const handleCancel = () => {
    setDate(undefined);
    setIsDialogOpen(false);
  };

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={'outline'}
            className={cn(
              'w-fit justify-start bg-gray-50 shadow-none border-none text-left font-normal text-gray-600 flex gap-2 items-center',
              !date && 'text-muted-foreground', blocked && 'hover:bg-transparent hover:text-gray-600 bg-transparent',
            )}
            {...rest}
          >
            {
              showIcon 
              && <CalendarIcon className="ml-2 h-5 w-5" />
            }
            {blocked ? t('details.deadlineNotSet'): date ? formatDisplayDate(date, language) : t('selectDateLabel')}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start" hidden={blocked}>
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateChange}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirmDateTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('confirmDateMessage')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel}>
              {t('cancel')}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>
              {t('accept')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default DatePicker;