'use client';

import React from 'react';

import { useTranslation } from 'react-i18next';

import { FormControl, FormField, FormItem, FormMessage } from '@kit/ui/form';

import { ThemedCheckbox } from '../../../../../../packages/features/accounts/src/components/ui/checkbox-themed-with-settings';
import { BriefsProvider } from '../../contexts/briefs-context';
import { ComponentProps, Option } from '../../types/brief.types';


const FormFieldMultipleChoice: React.FC<ComponentProps> = ({
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
        <FormItem className="flex w-full flex-col gap-2 space-y-4 group relative">
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
                        handleQuestionChange(question.id, 'label', e.target.value)
                      }
                      placeholder={t('multipleChoice.title')}
                      className="bg-transparent w-full border-none text-sm font-bold text-gray-600 focus:outline-none"
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
                          question.id,
                          'description',
                          e.target.value,
                        )
                      }
                      placeholder={t('multipleChoice.description')}
                      className="bg-transparent w-full border-none text-sm font-medium text-gray-500 focus:outline-none"
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
                        question.id,
                        `options.${optIndex}.selected`,
                        checked,
                      );
                    }}
                  />
                </div>
                <label className="text-sm font-medium leading-6 text-gray-600">
                  {option.label}
                </label>
              </div>
            ))}
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

export default FormFieldMultipleChoice;
