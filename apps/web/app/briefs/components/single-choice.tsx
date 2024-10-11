import React, { useState } from 'react';

import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@kit/ui/form';

import { FormField as FormFieldType } from '../types/brief.types';
import { BriefCreationForm } from './brief-creation-form';
import { RadioOption } from './options';
import { BriefsProvider } from '../contexts/briefs-context';

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
        <FormItem className="flex w-full flex-col gap-2 space-y-4">
          <div className="flex flex-col gap-2">
            <FormLabel>
              {t('creation.form.questionLabel')} {index + 1}
            </FormLabel>

            <div className="flex">
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
                        placeholder={t('singleChoice.title')}
                        className="border-none text-sm font-medium text-gray-600 focus:outline-none w-full"
                      />
                    </FormControl>
                    <FormMessage>{fieldState.error?.message}</FormMessage>
                  </FormItem>
                )}
              />
              <span className="font-bold">*</span>
            </div>

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
                      placeholder={t('singleChoice.description')}
                      className="border-none text-sm font-medium text-gray-600 focus:outline-none w-full"
                    />
                  </FormControl>
                  <FormMessage>{fieldState.error?.message}</FormMessage>
                </FormItem>
              )}
            />

            <div className="mt-4 flex flex-col gap-3">
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
           className='ml-auto'
           />
        </FormItem>
      )}
    />
  );
};

export default FormFieldSingleChoice;