'use client';

import { ThemedInput } from 'node_modules/@kit/accounts/src/components/ui/input-themed-with-settings';
import { useTranslation } from 'react-i18next';

import {
  FormControl,
  FormField as FormFieldProvider,
  FormItem,
  FormMessage,
} from '@kit/ui/form';

import { ComponentProps } from '../../types/brief.types';
import FormField from './form-field';

export function FormFieldShortText({
  index,
  question,
  form,
  handleQuestionChange,
  handleQuestionFocus,
  handleQuestionBlur
}: ComponentProps) {
  const { t } = useTranslation();

  return (
    <FormField
      index={index}
      question={question}
      form={form}
      handleQuestionChange={handleQuestionChange}
      handleQuestionFocus={handleQuestionFocus}
      handleQuestionBlur={handleQuestionBlur}
    >
      <FormFieldProvider
        control={form.control}
        name={`questions.${index}.placeholder`}
        render={({ field, fieldState }) => (
          <FormItem>
            <FormControl>
              <ThemedInput
                // readOnly
                {...field}
                value={question.placeholder}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleQuestionChange(
                    question.id,
                    'placeholder',
                    e.target.value,
                  )
                }
                onFocus={() => handleQuestionFocus && handleQuestionFocus(question.id, 'placeholder')}
                placeholder={t('creation.form.placeholderPlaceholder')}
                className="focus-visible:ring-none bg-white text-gray-400"
              />
            </FormControl>
            <FormMessage>{fieldState.error?.message}</FormMessage>
          </FormItem>
        )}
      />
    </FormField>
  );
}
