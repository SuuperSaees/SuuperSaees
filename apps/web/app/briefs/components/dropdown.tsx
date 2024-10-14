'use client';

import React from 'react';
import { ChevronDown, X } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@kit/ui/form';
import { FormField as FormFieldType, Option } from '../types/brief.types';
import { BriefCreationForm } from './brief-creation-form';
import { BriefsProvider } from '../contexts/briefs-context';

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
              <FormLabel>
                {t('creation.form.questionLabel')} {index + 1}
              </FormLabel>

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
                      className="border-none text-sm font-medium text-gray-600 focus:outline-none w-full"
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
                    className="border-none text-sm font-medium text-gray-600 focus:outline-none w-full"
                  />
                  </FormControl>
                  <FormMessage>{fieldState.error?.message}</FormMessage>
                </FormItem>
              )}
            />

            <div className="relative">
              <button
                type="button"
                className="border border-gray-300 px-4 py-2 text-sm flex items-center justify-between w-full rounded-lg text-gray-500 text-base font-medium leading-6"
                onClick={() => setDropdownOpen(!isDropdownOpen)}
              >
                {t('dropdown.selectAnOption')}
                <ChevronDown className="h-4 w-4" />
              </button>

              {isDropdownOpen && (
                <div className="absolute mt-1 w-full border border-gray-300 bg-white z-10 rounded-lg">
                  {question.options?.map((option: Option, optIndex) => (
                    <div
                      key={option.value}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
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
