import React, { useState } from 'react';

import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { FormControl, FormField, FormItem, FormMessage } from '@kit/ui/form';

import { BriefsProvider } from '../../contexts/briefs-context';
import { FormField as FormFieldType } from '../../types/brief.types';
import { BriefCreationForm } from '../brief-creation-form';
import { RadioOption } from '../options';

export interface FormFieldSingleChoiceProps {
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

const FormFieldSingleChoice: React.FC<FormFieldSingleChoiceProps> = ({
  index,
  question,
  form,
  handleQuestionChange,
}) => {
  const { t } = useTranslation('briefs');
  const [selectedOption, setSelectedOption] = useState<string | null>(
    question.options?.[0]?.value ?? null,
  );

  const handleOptionChange = (value: string, optIndex: number) => {
    setSelectedOption(value);
    handleQuestionChange(index, `options.${optIndex}.selected`, true);
  };

  return (
    <FormField
      control={form.control}
      name={`questions.${index}`}
      render={() => (
        <FormItem className="flex w-full flex-col gap-2 space-y-4 group relative">
          <div className="flex flex-col gap-2 w-full">
            <div className="flex w-full">
              <FormField
                control={form.control}
                name={`questions.${index}.label`}
     
                render={({ field, fieldState }) => (
                  <FormItem className='w-full'>
                    <FormControl>
                      <input
                        {...field}
                        value={question.label}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handleQuestionChange(index, 'label', e.target.value)
                        }
                        placeholder={t('singleChoice.title')}
                        className="bg-transparent w-full border-none text-sm font-bold text-gray-600 focus:outline-none"
                      />
                    </FormControl>
                    <FormMessage>{fieldState.error?.message}</FormMessage>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name={`questions.${index}.description`}
              render={({ field, fieldState }) => (
                <FormItem className='w-full'>
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
                      placeholder={t('singleChoice.description')}
                      className="bg-transparent w-full border-none text-sm font-medium text-gray-500 focus:outline-none"
                    />
                  </FormControl>
                  <FormMessage>{fieldState.error?.message}</FormMessage>
                </FormItem>
              )}
            />

            <div className="mt-4 flex flex-col gap-3 w-full">
              {question.options?.map(
                (
                  option: { value: string; label: string },
                  optIndex: number,
                ) => (
                  <RadioOption
                    key={option.value}
                    value={option.value}
                    selectedOption={selectedOption}
                    onChange={() => handleOptionChange(option.value, optIndex)}
                    label={option.label}
                  />
                ),
              )}
            </div>
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

export default FormFieldSingleChoice;
