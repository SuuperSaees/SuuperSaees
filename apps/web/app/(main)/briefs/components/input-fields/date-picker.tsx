import React, { useState } from 'react';

import { CalendarIcon } from '@radix-ui/react-icons';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

import { Button } from '@kit/ui/button';
import { Calendar } from '@kit/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@kit/ui/popover';

import { ComponentProps } from '../../types/brief.types';
import FormField from './form-field';

const FormFieldDatePicker: React.FC<ComponentProps> = ({
  index,
  question,
  form,
  handleQuestionChange,
  handleQuestionFocus,
  handleQuestionBlur
}) => {
  const { t } = useTranslation('briefs');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const handleDateChange = (date: Date | undefined) => {
    setSelectedDate(date ?? null);
    if (date) {
      handleQuestionChange(question.id, `options.0.selected`, date);
    }
  };

  return (
    <FormField
      index={index}
      question={question}
      form={form}
      handleQuestionChange={handleQuestionChange}
      handleQuestionFocus={handleQuestionFocus}
      handleQuestionBlur={handleQuestionBlur}
    >
        <Popover>
          <PopoverTrigger asChild onFocus={() => handleQuestionFocus && handleQuestionFocus(question.id, 'placeholder')}>
            <Button
              variant="outline"
              className={`w-full justify-start text-left font-normal ${!selectedDate ? 'text-muted-foreground' : ''}`}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? (
                format(selectedDate, 'PPP')
              ) : (
                <span>{t('datePicker.selectTitle')}</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate ?? undefined}
              onSelect={handleDateChange}
              initialFocus
            />
          </PopoverContent>
        </Popover>

    </FormField>
  );
};

export default FormFieldDatePicker;
