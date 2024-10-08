'use client';

import { X } from 'lucide-react';
import { ThemedInput } from 'node_modules/@kit/accounts/src/components/ui/input-themed-with-settings';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { Button } from '@kit/ui/button';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@kit/ui/form';

import { FormField as FormFieldType } from '../contexts/briefs-context';
import { BriefCreationForm } from './brief-creation-form';

export interface FormFieldShortTextProps {
  index: number;
  question: FormFieldType;
  form: UseFormReturn<BriefCreationForm>;
  handleQuestionChange: (
    index: number,
    field: 'label' | 'description' | 'placeholder',
    value: string,
  ) => void;
  handleRemoveQuestion: (index: number) => void;
}

export function FormFieldShortText({
  index,
  question,
  form,
  handleQuestionChange,
  handleRemoveQuestion,
}: FormFieldShortTextProps) {
  const { t } = useTranslation();

  return (
    <FormField
      control={form.control}
      name={`questions.${index}`}
      render={() => (
        <FormItem className="space-y-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <FormLabel>
                {t('creation.form.questionLabel')} {index + 1}
              </FormLabel>
              {index > 0 && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => handleRemoveQuestion(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Label Input */}
            <FormField
              control={form.control}
              name={`questions.${index}.label`}
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormControl>
                    <ThemedInput
                      {...field}
                      value={question.label}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleQuestionChange(index, 'label', e.target.value)
                      }
                      placeholder={t('creation.form.labelPlaceholder')}
                      className="focus-visible:ring-none"
                    />
                  </FormControl>
                  <FormMessage>{fieldState.error?.message}</FormMessage>
                </FormItem>
              )}
            />

            {/* Description Input */}
            <FormField
              control={form.control}
              name={`questions.${index}.description`}
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormControl>
                    <ThemedInput
                      {...field}
                      value={question.description}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleQuestionChange(
                          index,
                          'description',
                          e.target.value,
                        )
                      }
                      placeholder={t('creation.form.descriptionPlaceholder')}
                      className="focus-visible:ring-none"
                    />
                  </FormControl>
                  <FormMessage>{fieldState.error?.message}</FormMessage>
                </FormItem>
              )}
            />

            {/* Placeholder Input */}
            <FormField
              control={form.control}
              name={`questions.${index}.placeholder`}
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormControl>
                    <ThemedInput
                      {...field}
                      value={question.placeholder}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleQuestionChange(
                          index,
                          'placeholder',
                          e.target.value,
                        )
                      }
                      placeholder={t('creation.form.placeholderPlaceholder')}
                      className="focus-visible:ring-none"
                    />
                  </FormControl>
                  <FormMessage>{fieldState.error?.message}</FormMessage>
                </FormItem>
              )}
            />
          </div>
        </FormItem>
      )}
    />
  );
}
