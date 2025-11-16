import React from 'react';

import {
  FormControl,
  FormField as FormFieldProvider,
  FormItem,
  FormMessage,
} from '@kit/ui/form';
import { useTranslation } from 'react-i18next';

import { ComponentProps, Option } from '../../types/brief.types';
import FormField from './form-field';
import { ThemedInput } from 'node_modules/@kit/accounts/src/components/ui/input-themed-with-settings';
import { CheckboxRounded } from '~/components/icons/icons';

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

const FormFieldSingleChoice: React.FC<ComponentProps> = ({
  index,
  question,
  form,
  handleQuestionChange,
  handleQuestionFocus,
  handleQuestionBlur,
  ...props
}) => {
  const { t } = useTranslation('briefs');

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
      {...props}
    >
      <div 
        className={`mt-4 w-full ${
          useGridLayout 
            ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3' 
            : 'flex flex-col gap-3'
        }`}
      >
        {question.options?.map(
          (option: { value: string; label: string }, optIndex: number) => (
            <FormFieldProvider
              key={option.value}
              control={form.control}
              name={`questions.${index}.options`}
              render={({ fieldState, field }) => (
                <FormItem className='flex items-center space-y-0 p-2 rounded-lg'>
                    <CheckboxRounded className='w-4 h-4 mr-2 flex-shrink-0'/>
                  <FormControl>
                    <div className="relative flex-1">
                      <ThemedInput
                      {...field}
                      className={`focus-visible:ring-none border-transparent border-none text-sm font-medium leading-6 text-gray-600 shadow-none outline-0 ${
                        isOtherOption(option as Option) 
                          ? 'rounded-none border-b-2 border-dotted border-b-gray-300 cursor-not-allowed italic bg-transparent' 
                          : ''
                      }`}
                      onFocus={() =>
                        !isOtherOption(option as Option) && handleQuestionFocus &&
                        handleQuestionFocus(question.id, 'options')
                      }
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        // Don't allow editing of "other" options
                        if (isOtherOption(option as Option)) {
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
                      value={getDisplayLabel(option as Option, t)}
                      readOnly={isOtherOption(option as Option)}
                      placeholder={isOtherOption(option as Option) ? t('creation.form.marks.other_option_placeholder') : undefined}
                    />
                    </div>
                  </FormControl>
                  <FormMessage>{fieldState.error?.message}</FormMessage>
                </FormItem>
              )}
            />
          ),
        )}
      </div>
    </FormField>
  );
};

export default FormFieldSingleChoice;
