import React, { useState } from 'react';

import { CalendarIcon } from '@radix-ui/react-icons';
import { format } from 'date-fns';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { Button } from '@kit/ui/button';
import { Calendar } from '@kit/ui/calendar';
import { FormControl, FormField, FormItem, FormMessage } from '@kit/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@kit/ui/popover';

import { BriefsProvider } from '../../contexts/briefs-context';
import { FormField as FormFieldType } from '../../types/brief.types';
import { BriefCreationForm } from '../brief-creation-form';

export interface FormFieldDatePickerProps {
  index: number;
  question: FormFieldType;
  form: UseFormReturn<BriefCreationForm>;
  handleQuestionChange: (
    index: number,
    field:
      | 'label'
      | 'description'
      | 'placeholder'
      | `options.${number}.selected`,
    value: string | boolean | Date,
  ) => void;
  handleRemoveQuestion: (index: number) => void;
}

const FormFieldDatePicker: React.FC<FormFieldDatePickerProps> = ({
  index,
  question,
  form,
  handleQuestionChange,
}) => {
  const { t } = useTranslation('briefs');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const handleDateChange = (date: Date | undefined) => {
    setSelectedDate(date ?? null);
    if (date) {
      handleQuestionChange(index, `options.0.selected`, date);
    }
  };

  return (
    <FormField
      control={form.control}
      name={`questions.${index}`}
      render={() => (
        <FormItem className="flex w-full flex-col gap-2 space-y-4 group relative">
          <div className="flex flex-col gap-2">
            <div className="flex">
              <FormField
                control={form.control}
                name={`questions.${index}.label`}
                render={({ field, fieldState }) => (
                  <FormItem className='w-full'>
                    <FormControl>
                      <input
                        readOnly
                        {...field}
                        value={question.label}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handleQuestionChange(index, 'label', e.target.value)
                        }

                        placeholder={t('datePicker.title')}
                        className="bg-transparent w-full border-none text-sm font-bold text-gray-600 focus:outline-none w-full"
                      />
                    </FormControl>
                    <FormMessage>{fieldState.error?.message}</FormMessage>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name={`questions.${index}.description`}
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormControl>
                    <input
                      readOnly
                      {...field}
                      value={question.description ?? ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleQuestionChange(
                          index,
                          'description',
                          e.target.value,
                        )
                      }
                      placeholder={t('datePicker.description')}
                      className="bg-transparent w-full border-none text-sm font-medium text-gray-500 focus:outline-none"
                    />
                  </FormControl>
                  <FormMessage>{fieldState.error?.message}</FormMessage>
                </FormItem>
              )}
            />

            <div className="w-full">
              <Popover>
                <PopoverTrigger asChild>
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
            </div>
          </div>
          <BriefsProvider.Options
            formFieldId={question.id}
            className="ml-auto group-hover:flex hidden absolute right-0 top-0"
          />
        </FormItem>
      )}
    />
  );
};

export default FormFieldDatePicker;
