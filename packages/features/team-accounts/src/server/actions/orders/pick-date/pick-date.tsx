'use client';

import React, { useState } from 'react';
import { 
  AlertDialog, 
  AlertDialogTrigger, 
  AlertDialogContent, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogCancel, 
  AlertDialogAction 
} from '@kit/ui/alert-dialog'; 
import { putDueDate } from './pick-date-server';
import { Button } from '@kit/ui/button';
import { useTranslation } from 'react-i18next';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@kit/ui/popover"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "@kit/ui/calendar"
import { cn } from "@kit/ui/utils"
import { format, parseISO, addHours } from "date-fns"

type Order = {
    id: string
    created_at: string
    title: string
    description: string | null
    customer_id: string
    status: string
    assigned_to: string[] | null
    due_date: string | null
    propietary_organization_id: string
}

const DatePicker = ({
    id,
    created_at,
    title,
    description,
    customer_id,
    status,
    assigned_to,
    due_date,
    propietary_organization_id
}: Order) => {
  const { t } = useTranslation('orders');
  const [date, setDate] = React.useState<Date | undefined>(due_date ? addHours(parseISO(due_date), new Date().getTimezoneOffset() / 60) : undefined);

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  async function onSubmit() {
    if (!date) return; 

    await putDueDate({
        id,
        created_at,
        title,
        description,
        customer_id,
        status,
        assigned_to,
        due_date: date.toISOString(),
        propietary_organization_id
    });
    window.location.reload();
  }

  const handleDateChange = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    setIsDialogOpen(true); 
  };

  const handleConfirm = () => {
    onSubmit(); 
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
            variant={"outline"}
            className={cn(
              "w-[240px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "dd-MM-yyyy") : t("selectDateLabel")}
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
            <AlertDialogTitle>{t("confirmDateTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("confirmDateMessage")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel}>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>{t("accept")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default DatePicker;
