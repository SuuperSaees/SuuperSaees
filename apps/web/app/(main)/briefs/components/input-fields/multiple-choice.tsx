'use client';

import React from 'react';

import { ThemedInput } from 'node_modules/@kit/accounts/src/components/ui/input-themed-with-settings';
import { useTranslation } from 'react-i18next';

import {
  FormControl,
  FormField as FormFieldProvider,
  FormItem,
  FormMessage,
} from '@kit/ui/form';

import { ThemedCheckbox } from '../../../../../../../packages/features/accounts/src/components/ui/checkbox-themed-with-settings';
import { ComponentProps, Option } from '../../types/brief.types';
import FormField from './form-field';

// Helper functions for managing the "other" option display
const OTHER_OPTION_PREFIX = 'suuper-custom';

const isOtherOption = (option: Option): boolean => {
  return option.label.startsWith(OTHER_OPTION_PREFIX);
};

const getDisplayLabel = (option: Option, t: (key: string) => string): string => {
  if (isOtherOption(option)) {
    return t('creation.form.marks.other_option_label');
  }
  return option.label;
};

const FormFieldMultipleChoice: React.FC<ComponentProps> = ({
  index,
  question,
  form,
  handleQuestionChange,
  handleQuestionFocus,
  handleQuestionBlur
}) => {
  const { t } = useTranslation('briefs');
  
  return (
    <FormField
      index={index}
      question={question}
      form={form}
      handleQuestionChange={handleQuestionChange}
      handleQuestionFocus={handleQuestionFocus}
      handleQuestionBlur={handleQuestionBlur}
    >
      {question.options?.map((option: Option, optIndex) => (
        <div
          key={option.value}
          className="flex flex-row items-center space-y-0 w-full"
          onClick={() =>
            !isOtherOption(option) && handleQuestionFocus && handleQuestionFocus(question.id, 'options')
          }
        >
          <ThemedCheckbox
            checked={false}
          />
          <FormFieldProvider
            control={form.control}
            name={`questions.${index}.options`}
            render={({ field, fieldState }) => (
              <FormItem className='w-full'>
                <FormControl>
                  <div className="relative flex-1 w-full">
                    <ThemedInput
                      {...field}
                      className={`w-full focus-visible:ring-none border-transparent border-none text-sm font-medium leading-6 text-gray-600 shadow-none outline-0 ${
                        isOtherOption(option) 
                          ? 'rounded-none border-b-2 border-dotted border-b-gray-300 cursor-not-allowed italic bg-transparent' 
                          : ''
                      }`}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        // Don't allow editing of "other" options
                        if (isOtherOption(option)) {
                          return;
                        }
                        
                        const { value } = e.target;
                        const newOptions = [...(question.options ?? [])];
                        
                        newOptions[optIndex] = {
                          ...question?.options?.[optIndex] as Option,
                          label: value,
                        };

                        handleQuestionChange(question.id, `options`, newOptions);
                      }}
                      value={getDisplayLabel(option, t)}
                      readOnly={isOtherOption(option)}
                      placeholder={isOtherOption(option) ? t('creation.form.marks.other_option_placeholder') : undefined}
                    />
                  </div>
                </FormControl>
                <FormMessage>{fieldState.error?.message}</FormMessage>
              </FormItem>
            )}
          />
        </div>
      ))}
    </FormField>
  );
};

export default FormFieldMultipleChoice;
