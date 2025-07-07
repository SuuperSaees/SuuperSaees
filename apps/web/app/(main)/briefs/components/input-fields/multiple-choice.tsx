'use client';

import React from 'react';

import { ThemedInput } from 'node_modules/@kit/accounts/src/components/ui/input-themed-with-settings';

import {
  FormControl,
  FormField as FormFieldProvider,
  FormItem,
  FormMessage,
} from '@kit/ui/form';

import { ThemedCheckbox } from '../../../../../../../packages/features/accounts/src/components/ui/checkbox-themed-with-settings';
import { ComponentProps, Option } from '../../types/brief.types';
import FormField from './form-field';

const FormFieldMultipleChoice: React.FC<ComponentProps> = ({
  index,
  question,
  form,
  handleQuestionChange,
  handleQuestionFocus,
  handleQuestionBlur
}) => {
  // Get the number of options to determine layout
  const optionsCount = question.options?.length ?? 0;
  const useGridLayout = optionsCount > 3;

  return (
    <FormField
      index={index}
      question={question}
      form={form}
      handleQuestionChange={handleQuestionChange}
      handleQuestionFocus={handleQuestionFocus}
      handleQuestionBlur={handleQuestionBlur}
    >
      <div 
        className={`mt-4 w-full ${
          useGridLayout 
            ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3' 
            : 'flex flex-col gap-3'
        }`}
      >
        {question.options?.map((option: Option, optIndex) => (
          <div
            key={option.value}
            className="flex items-center space-y-0 p-2 rounded-lg"
            onClick={() =>
              handleQuestionFocus && handleQuestionFocus(question.id, 'options')
            }
          >
            <ThemedCheckbox
              checked={false}
              className="mr-2 flex-shrink-0"
            />
            <FormFieldProvider
              control={form.control}
              name={`questions.${index}.options`}
              render={({ field, fieldState }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <ThemedInput
                      {...field}
                      className="focus-visible:ring-none border-none text-sm font-medium leading-6 text-gray-600 shadow-none outline-0 w-full"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const { value } = e.target;
                        const newOptions = [...(question.options ?? [])];
                        newOptions[optIndex] = {
                          ...question?.options?.[optIndex] as Option,
                          label: value,
                        };

                        handleQuestionChange(question.id, `options`, newOptions);
                      }}
                      value={question?.options?.[optIndex]?.label}
                    />
                  </FormControl>
                  <FormMessage>{fieldState.error?.message}</FormMessage>
                </FormItem>
              )}
            />
          </div>
        ))}
      </div>
    </FormField>
  );
};

export default FormFieldMultipleChoice;
