'use client';

import React from 'react';

import { ThemedInput } from 'node_modules/@kit/accounts/src/components/ui/input-themed-with-settings';

import {
  FormControl,
  FormField as FormFieldProvider,
  FormItem,
  FormMessage,
} from '@kit/ui/form';

import { ThemedCheckbox } from '../../../../../../packages/features/accounts/src/components/ui/checkbox-themed-with-settings';
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
          className="flex flex-row items-center space-y-0"
          onClick={() =>
            handleQuestionFocus && handleQuestionFocus(question.id, 'options')
          }
        >
          <ThemedCheckbox
            checked={false}
          />
          <FormFieldProvider
            control={form.control}
            name={`questions.${index}.options`}
            render={({ field, fieldState }) => (
              <FormItem>
                <FormControl>
                  <ThemedInput
                    {...field}
                    className="focus-visible:ring-none border-none text-sm font-medium leading-6 text-gray-600 shadow-none outline-0"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      
                      const { value } = e.target;
                      const newOptions = [...(question.options ?? [])];
                      newOptions[optIndex] = {
                        ...question?.options?.[optIndex] as Option,
                        label: value,
                        value: value,
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
    </FormField>
  );
};

export default FormFieldMultipleChoice;
