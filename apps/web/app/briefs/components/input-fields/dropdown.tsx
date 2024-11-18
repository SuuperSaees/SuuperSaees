'use client';

import React from 'react';

import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { ComponentProps, Option } from '../../types/brief.types';
import FormField from './form-field';

const FormFieldDropdown: React.FC<ComponentProps> = ({
  index,
  question,
  form,
  handleQuestionChange,
  handleQuestionFocus,
  handleQuestionBlur
}) => {
  const { t } = useTranslation('briefs');
  const [isDropdownOpen, setDropdownOpen] = React.useState(false);

  const handleOptionSelect = (optIndex: number) => {
    handleQuestionChange(question.id, `options.${optIndex}.selected`, true);
    setDropdownOpen(false);
  };

  return (
    <FormField
      index={index}
      question={question}
      form={form}
      handleQuestionChange={handleQuestionChange}
      handleQuestionFocus={handleQuestionFocus}
      handleQuestionBlur={handleQuestionBlur}
    >
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
                onClick={() => {
                  handleOptionSelect(optIndex);
                  handleQuestionFocus &&
                    handleQuestionFocus(question.id, 'options');
                }}
              >
                <span className="text-base text-sm font-medium leading-6 text-gray-500">
                  {option.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </FormField>
  );
};

export default FormFieldDropdown;
