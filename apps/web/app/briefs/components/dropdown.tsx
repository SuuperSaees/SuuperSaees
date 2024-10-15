'use client';

import React from 'react';

import { ChevronDown, X } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { FormControl, FormField, FormItem, FormMessage } from '@kit/ui/form';

import { BriefsProvider } from '../contexts/briefs-context';
import { FormField as FormFieldType, Option } from '../types/brief.types';
import { BriefCreationForm } from './brief-creation-form';

export interface FormFieldDropdownProps {
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
    value: string | boolean,
  ) => void;
  handleRemoveQuestion: (index: number) => void;
}

const FormFieldDropdown: React.FC<FormFieldDropdownProps> = ({
  index,
  question,
  form,
  handleQuestionChange,
}) => {
  const { t } = useTranslation('briefs');
  const [isDropdownOpen, setDropdownOpen] = React.useState(false);

  const handleOptionSelect = (optIndex: number) => {
    const newOptions = question.options?.map((option, i) => ({
      ...option,
      selected: i === optIndex,
    }));
    handleQuestionChange(index, `options.${optIndex}.selected`, true);
    setDropdownOpen(false);
  };

  return (
    <FormField
      control={form.control}
      name={`questions.${index}`}
      render={() => (
        <FormItem className="flex w-full flex-col gap-2 space-y-4">
          <div className="flex flex-col gap-2">
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
                      placeholder={t('multipleChoice.title')}
                      className="w-full border-none text-sm font-medium text-gray-600 focus:outline-none"
                    />
                  </FormControl>
                  <FormMessage>{fieldState.error?.message}</FormMessage>
                </FormItem>
              )}
            />

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
                        handleQuestionChange(
                          index,
                          'description',
                          e.target.value,
                        )
                      }
                      placeholder={t('multipleChoice.description')}
                      className="w-full border-none text-sm font-medium text-gray-600 focus:outline-none"
                    />
                  </FormControl>
                  <FormMessage>{fieldState.error?.message}</FormMessage>
                </FormItem>
              )}
            />

            <div className="relative">
              <button
                type="button"
                className="flex w-full items-center justify-between rounded-lg border border-gray-300 px-4 py-2 text-base text-sm font-medium leading-6 text-gray-500"
                onClick={() => setDropdownOpen(!isDropdownOpen)}
              >
                {t('dropdown.selectAnOption')}
                <ChevronDown className="h-4 w-4" />
              </button>

              {isDropdownOpen && (
                <div className="absolute z-10 mt-1 w-full rounded-lg border border-gray-300 bg-white">
                  {question.options?.map((option: Option, optIndex) => (
                    <div
                      key={option.value}
                      className="cursor-pointer px-4 py-2 hover:bg-gray-100"
                      onClick={() => handleOptionSelect(optIndex)}
                    >
                      {option.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <BriefsProvider.Options
            formFieldId={question.id}
            className="ml-auto"
          />
        </FormItem>
      )}
    />
  );
};

export default FormFieldDropdown;
