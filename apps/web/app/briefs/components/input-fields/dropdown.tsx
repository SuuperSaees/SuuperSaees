'use client';

import React from 'react';

import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { FormControl, FormField, FormItem, FormMessage } from '@kit/ui/form';

import { BriefsProvider } from '../../contexts/briefs-context';
import { ComponentProps, Option } from '../../types/brief.types';

const FormFieldDropdown: React.FC<ComponentProps> = ({
  index,
  question,
  form,
  handleQuestionChange,
}) => {
  const { t } = useTranslation('briefs');
  const [isDropdownOpen, setDropdownOpen] = React.useState(false);

  const handleOptionSelect = (optIndex: number) => {
    // const newOptions = question.options?.map((option, i) => ({
    //   ...option,
    //   selected: i === optIndex,
    // }));
    handleQuestionChange(question.id, `options.${optIndex}.selected`, true);
    setDropdownOpen(false);
  };

  return (
    <FormField
      control={form.control}
      name={`questions.${index}`}
      render={() => (
        <FormItem className="group relative flex w-full flex-col gap-2 space-y-4">
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
                        handleQuestionChange(
                          question.id,
                          'label',
                          e.target.value,
                        )
                      }
                      placeholder={t('dropdown.title')}
                      className="w-full border-none bg-transparent text-sm font-bold text-gray-600 focus:outline-none"
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
                      placeholder={t('dropdown.description')}
                      className="w-full border-none bg-transparent text-sm font-medium text-gray-500 focus:outline-none"
                    />
                  </FormControl>
                  <FormMessage>{fieldState.error?.message}</FormMessage>
                </FormItem>
              )}
            />

            <div className="relative">
              <button
                type="button"
                className="flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-2 text-base text-sm font-medium leading-6 text-gray-500"
                onClick={() => setDropdownOpen(!isDropdownOpen)}
              >
                {question.options?.[0]?.label === ''
                  ? t('dropdown.selectAnOption')
                  : question.options?.[0]?.label}
                <ChevronDown className="h-4 w-4" />
              </button>

              {isDropdownOpen && (
                <div className="z-10 mt-1 w-full rounded-lg border border-gray-300 bg-white">
                  {question.options?.map((option: Option, optIndex) => (
                    <div
                      key={option.value}
                      className="cursor-pointer px-4 py-2 hover:bg-gray-100"
                      onClick={() => handleOptionSelect(optIndex)}
                    >
                      <span className="text-base text-sm font-medium leading-6 text-gray-500">
                        {option.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <BriefsProvider.Options
            formFieldId={question.id}
            className="absolute right-0 top-0 ml-auto hidden group-hover:flex"
          />
        </FormItem>
      )}
    />
  );
};

export default FormFieldDropdown;
