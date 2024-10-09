'use client';

import React from 'react';

import { X } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { Button } from '@kit/ui/button';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@kit/ui/form';

import { ThemedCheckbox } from '../../../../../packages/features/accounts/src/components/ui/checkbox-themed-with-settings';
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
  handleRemoveQuestion,
}) => {
  const { t } = useTranslation('briefs');

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
                      style={{
                        width: `${Math.max(question.label.length, t('multipleChoice.title').length) + 1}ch`,
                      }}
                      placeholder={t('multipleChoice.title')}
                      className="border-none text-sm font-medium text-gray-600 focus:outline-none"
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
                      style={{
                        width: `${Math.max(question.description!.length, t('multipleChoice.description').length) + 1}ch`,
                      }}
                      placeholder={t('multipleChoice.description')}
                      className="border-none text-sm font-medium text-gray-600 focus:outline-none"
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
        </FormItem>
      )}
    />
  );
};

export default FormFieldMultipleChoice;