'use client';

import React, { useState } from 'react';



import { addHours, format, parseISO } from 'date-fns';

import { useTranslation } from 'react-i18next';



import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@kit/ui/alert-dialog';
import { Button } from '@kit/ui/button';
import { Calendar } from '@kit/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@kit/ui/popover';
import { cn } from '@kit/ui/utils';


interface DatePickerProps {
  updateFn: (date: string) => void | Promise<void>;
  defaultDate?: string | undefined | null;
}

const DatePicker = ({ updateFn, defaultDate }: DatePickerProps) => {
  const { t } = useTranslation('orders');
  const [date, setDate] = React.useState<Date | undefined>(
    defaultDate?.toString()
      ? addHours(
          parseISO(defaultDate.toString()),
          new Date().getTimezoneOffset() / 60,
        )
      : undefined,
  );

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  async function onSubmit() {
    if (!date) return;

    await updateFn(date.toISOString());
    // window.location.reload();
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
              'w-fit justify-start bg-gray-50 shadow-none border-none text-left font-normal',
              !date && 'text-muted-foreground',
            )}
          >
            {date ? format(date, 'dd-MM-yyyy') : t('selectDateLabel')}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
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