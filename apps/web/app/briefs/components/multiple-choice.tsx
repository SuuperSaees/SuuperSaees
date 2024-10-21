'use client';

import React from 'react';

import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { FormControl, FormField, FormItem, FormMessage } from '@kit/ui/form';

import { ThemedCheckbox } from '../../../../../packages/features/accounts/src/components/ui/checkbox-themed-with-settings';
import { BriefsProvider } from '../contexts/briefs-context';
import { FormField as FormFieldType, Option } from '../types/brief.types';
import { BriefCreationForm } from './brief-creation-form';

export interface FormFieldMultipleChoiceProps {
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

const FormFieldMultipleChoice: React.FC<FormFieldMultipleChoiceProps> = ({
  index,
  question,
  form,
  handleQuestionChange,
}) => {
  const { t } = useTranslation('briefs');

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
                      readOnly
                      {...field}
                      value={question.label}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleQuestionChange(index, 'label', e.target.value)
                      }
                      placeholder={t('multipleChoice.title')}
                      className="bg-transparent w-full border-none text-sm font-medium text-gray-600 focus:outline-none"
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
                      readOnly
                      value={question.description ?? ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleQuestionChange(
                          index,
                          'description',
                          e.target.value,
                        )
                      }
                      placeholder={t('multipleChoice.description')}
                      className="bg-transparent w-full border-none text-sm font-medium text-gray-600 focus:outline-none"
                    />
                  </FormControl>
                  <FormMessage>{fieldState.error?.message}</FormMessage>
                </FormItem>
              )}
            />

            {question.options?.map((option: Option, optIndex) => (
              <div
                key={option.value}
                className="flex flex-row items-start space-x-3 space-y-0"
              >
                <div>
                  <ThemedCheckbox
                    checked={option.selected}
                    onCheckedChange={(checked) => {
                      handleQuestionChange(
                        index,
                        `options.${optIndex}.selected`,
                        checked,
                      );
                    }}
                  />
                </div>
                <label className="text-base font-medium leading-6 text-gray-700">
                  {option.label}
                </label>
              </div>
            ))}
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

export default FormFieldMultipleChoice;
