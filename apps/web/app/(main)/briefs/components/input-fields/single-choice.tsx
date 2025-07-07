import React from 'react';

import {
  FormControl,
  FormField as FormFieldProvider,
  FormItem,
  FormMessage,
} from '@kit/ui/form';

import { ComponentProps, Option } from '../../types/brief.types';
import FormField from './form-field';
import { ThemedInput } from 'node_modules/@kit/accounts/src/components/ui/input-themed-with-settings';
import { CheckboxRounded } from '~/components/icons/icons';

const FormFieldSingleChoice: React.FC<ComponentProps> = ({
  index,
  question,
  form,
  handleQuestionChange,
  handleQuestionFocus,
  handleQuestionBlur,
  ...props
}) => {
  // const [selectedOption, setSelectedOption] = useState<string | null>(
  //   question.options?.[0]?.value ?? null,
  // );

  // const handleOptionChange = (value: string, optIndex: number) => {
  //   setSelectedOption(value);
  //   handleQuestionChange(question.id, `options.${optIndex}.selected`, true);
  // };

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
                    <ThemedInput
                    {...field}
                    className="focus-visible:ring-none border-none text-sm font-medium leading-6 text-gray-600 shadow-none outline-0 w-full"
                    onFocus={() =>
                      handleQuestionFocus &&
                      handleQuestionFocus(question.id, 'options')
                    }
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
          ),
        )}
      </div>
    </FormField>
  );
};

export default FormFieldSingleChoice;
