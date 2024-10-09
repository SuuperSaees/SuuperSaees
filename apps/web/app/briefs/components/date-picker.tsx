import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UseFormReturn } from 'react-hook-form';
import { Button } from '@kit/ui/button';
import { X } from 'lucide-react';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@kit/ui/form';
import { FormField as FormFieldType } from '../contexts/briefs-context';
import { BriefCreationForm } from './brief-creation-form';
import { Popover, PopoverContent, PopoverTrigger } from '@kit/ui/popover';
import { Calendar } from '@kit/ui/calendar';
import { CalendarIcon } from '@radix-ui/react-icons';
import { format } from 'date-fns';

export interface FormFieldDatePickerProps {
  index: number;
  question: FormFieldType;
  form: UseFormReturn<BriefCreationForm>;
  handleQuestionChange: (
    index: number,
    field: 'label' | 'description' | 'placeholder' | `options.${number}.selected`,
    value: string | boolean | Date,
  ) => void;
  handleRemoveQuestion: (index: number) => void;
}

const FormFieldDatePicker: React.FC<FormFieldDatePickerProps> = ({
  index,
  question,
  form,
  handleQuestionChange,
  handleRemoveQuestion,
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
        <FormItem className="space-y-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <FormLabel>
                {t('creation.form.questionLabel')} {index + 1}
              </FormLabel>
              {index > 0 && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => handleRemoveQuestion(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="flex">
              <FormField
                control={form.control}
                name={`questions.${index}.label`}
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormControl>
                      <input
                        {...field}
                        value={question.label}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handleQuestionChange(index, 'label', e.target.value)
                        }
                        style={{ width: `${Math.max(question.label.length, t('singleChoice.title').length) + 1}ch` }}
                        placeholder={t('singleChoice.title')}
                        className="border-none focus:outline-none text-gray-600 text-sm font-medium"
                      />
                    </FormControl>
                    <FormMessage>{fieldState.error?.message}</FormMessage>
                  </FormItem>
                )}
              />
              <span className="font-bold">*</span>
            </div>

            <FormField
              control={form.control}
              name={`questions.${index}.description`}
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormControl>
                    <input
                      {...field}
                      value={question.description ?? ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleQuestionChange(index, 'description', e.target.value)
                      }
                      placeholder={t('singleChoice.description')}
                      style={{ width: `${Math.max(question?.description?.length ?? 5, t('singleChoice.description').length) + 1}ch` }}
                      className="border-none focus:outline-none text-gray-600 text-sm font-medium"
                    />
                  </FormControl>
                  <FormMessage>{fieldState.error?.message}</FormMessage>
                </FormItem>
              )}
            />

            <div className=" w-full">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-start text-left font-normal ${!selectedDate ? 'text-muted-foreground' : ''}`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, 'PPP') : <span>{t('datePicker.selectTitle')}</span>}
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
        </FormItem>
      )}
    />
  );
};

export default FormFieldDatePicker;
